const prisma = require("../config/prisma");
const { nextReceiptNo } = require("../config/sequence");
const {
    money, displayDate, paymentMethod, saleStatus, paymentStatus, HttpError,
} = require("../config/format");

const ITEM_INCLUDE = {
    sale: true,
    variant: { select: { size: true, color: true } },
    product: { select: { id: true, name: true, artNumber: true, subCategory: { select: { name: true } } } },
};

// One row per sale line, in the flat shape the frontend's lists and
// dashboard reports use. sale_id / receipt_no group lines into receipts.
const toSaleLine = (item) => ({
    id: item.id,
    sale_id: item.saleId,
    receipt_no: item.sale.receiptNo,
    reference: String(item.sale.receiptNo).padStart(6, "0"),
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity,
    color: item.variant?.color ?? null,
    size: item.variant?.size ?? null,
    amount: money(item.unitPrice), // unit price
    line_total: money(item.lineTotal),
    total_amount: money(item.sale.totalAmount), // whole receipt
    paid: money(item.sale.amountPaid),
    due: money(item.sale.amountDue),
    status: saleStatus.toApi(item.sale.status),
    payment: paymentStatus.toApi(item.sale.paymentStatus),
    payment_method: paymentMethod.toApi(item.sale.paymentMethod),
    user_id: item.sale.userId,
    date: displayDate(item.sale.soldAt),
    sold_at: item.sale.soldAt,
    // Kept for compatibility: the frontend reads artNumber.artNumber / artNumber.name.
    artNumber: {
        id: item.productId,
        name: item.product?.subCategory
            ? `${item.product.subCategory.name}: ${item.productName}`
            : item.productName,
        artNumber: item.artNumber,
    },
});

async function getAllSales() {
    const items = await prisma.saleItem.findMany({
        where: { sale: { status: { not: "CANCELLED" } } },
        include: ITEM_INCLUDE,
        orderBy: [{ sale: { soldAt: "desc" } }, { createdAt: "asc" }],
    });
    return items.map(toSaleLine);
}

async function getSalesForProducts(productIds) {
    const items = await prisma.saleItem.findMany({
        where: { productId: { in: productIds }, sale: { status: { not: "CANCELLED" } } },
        include: ITEM_INCLUDE,
        orderBy: { createdAt: "asc" },
    });
    return items.map(toSaleLine);
}

// Reduce stock for one sale line; returns false if stock is not tracked.
async function takeStock(tx, { product, variantId, quantity }) {
    if (variantId) {
        const { count } = await tx.productVariant.updateMany({
            where: { id: variantId, productId: product.id, quantity: { gte: quantity } },
            data: { quantity: { decrement: quantity } },
        });
        if (count === 0) {
            const exists = await tx.productVariant.findFirst({ where: { id: variantId, productId: product.id } });
            throw new HttpError(exists ? 409 : 400,
                exists ? `Not enough stock for ${product.artNumber}` : `Unknown variant for ${product.artNumber}`);
        }
        return true;
    }
    if (product.stockQuantity !== null) {
        const { count } = await tx.product.updateMany({
            where: { id: product.id, stockQuantity: { gte: quantity } },
            data: { stockQuantity: { decrement: quantity } },
        });
        if (count === 0) throw new HttpError(409, `Not enough stock for ${product.artNumber}`);
        return true;
    }
    return false; // stock not tracked for this product
}

/**
 * Create one sale (receipt) with one or more lines.
 * items: [{ productId, quantity, variantId? }]. Prices come from the
 * product record, never from the client.
 */
async function createSale({ userId, paymentMethod: method, items, amountPaid }) {
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "A sale needs at least one item");

    const lines = items.map((it) => ({
        productId: String(it.productId || ""),
        variantId: it.variantId ? String(it.variantId) : null,
        quantity: parseInt(it.quantity, 10),
    }));
    if (lines.some((l) => !l.productId || !Number.isInteger(l.quantity) || l.quantity < 1)) {
        throw new HttpError(400, "Each item needs a product and a quantity of at least 1");
    }

    let method_;
    try {
        method_ = paymentMethod.fromApi(method, "CASH");
    } catch {
        throw new HttpError(400, `Unknown payment method "${method}"`);
    }

    return prisma.$transaction(async (tx) => {
        const ids = [...new Set(lines.map((l) => l.productId))];
        const products = await tx.product.findMany({
            where: { id: { in: ids }, deletedAt: null, isActive: true },
        });
        const byId = new Map(products.map((p) => [p.id, p]));
        const missing = ids.filter((id) => !byId.has(id));
        if (missing.length) throw new HttpError(400, `Unknown or inactive product(s): ${missing.join(", ")}`);

        const priced = lines.map((l) => {
            const p = byId.get(l.productId);
            const unitPrice = money(p.sellingPrice);
            return { ...l, product: p, unitPrice, lineTotal: unitPrice * l.quantity };
        });
        const totalAmount = priced.reduce((s, l) => s + l.lineTotal, 0);
        const paid = amountPaid === undefined || amountPaid === null ? totalAmount : Number(amountPaid);
        if (!Number.isFinite(paid) || paid < 0) throw new HttpError(400, "Invalid amount paid");
        const due = Math.max(totalAmount - paid, 0);

        const sale = await tx.sale.create({
            data: {
                receiptNo: await nextReceiptNo(tx),
                userId,
                paymentMethod: method_,
                totalAmount,
                amountPaid: Math.min(paid, totalAmount),
                amountDue: due,
                paymentStatus: due === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID",
            },
        });

        for (const l of priced) {
            const item = await tx.saleItem.create({
                data: {
                    saleId: sale.id,
                    productId: l.productId,
                    variantId: l.variantId,
                    productName: l.product.name,
                    artNumber: l.product.artNumber,
                    unitPrice: l.unitPrice,
                    quantity: l.quantity,
                    lineTotal: l.lineTotal,
                },
            });
            if (await takeStock(tx, l)) {
                await tx.stockMovement.create({
                    data: {
                        productId: l.productId, variantId: l.variantId, saleItemId: item.id,
                        type: "SALE", quantity: -l.quantity, userId,
                    },
                });
            }
        }

        return { id: sale.id, receipt_no: sale.receiptNo, total_amount: totalAmount, paid: money(sale.amountPaid), due };
    });
}

module.exports = { getAllSales, getSalesForProducts, createSale, toSaleLine };

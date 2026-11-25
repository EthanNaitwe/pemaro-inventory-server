const prisma = require("../config/prisma");

const toSale = (s, product) => ({
    id: s.id,
    productId: s.productId,
    quantity: s.quantity,
    color: s.color,
    size: s.size,
    reference: s.reference,
    status: s.status,
    payment: s.payment,
    amount: s.amount,
    paid: s.paid,
    due: s.due,
    user_id: s.userId,
    date: s.date,
    payment_method: s.paymentMethod,
    // Kept for compatibility: the frontend expects the product object here.
    artNumber: product
        ? { id: product.id, name: product.name, artNumber: product.artNumber }
        : undefined,
});

const toData = (sale) => ({
    id: sale.id,
    productId: sale.productId ?? null,
    quantity: parseInt(sale.quantity, 10) || 0,
    color: sale.color ?? null,
    size: sale.size ?? null,
    reference: sale.reference ?? null,
    status: sale.status ?? null,
    payment: sale.payment ?? null,
    amount: Number(sale.amount) || 0,
    paid: Number(sale.paid) || 0,
    due: Number(sale.due) || 0,
    userId: sale.user_id ?? null,
    date: sale.date ?? null,
    paymentMethod: sale.payment_method ?? null,
});

// Get all sales
async function getAllSales() {
    const [sales, products] = await Promise.all([
        prisma.sale.findMany({ orderBy: { createdAt: "asc" } }),
        prisma.product.findMany({ select: { id: true, name: true, artNumber: true } }),
    ]);
    const byId = new Map(products.map((p) => [p.id, p]));
    return sales.map((s) => toSale(s, byId.get(s.productId)));
}

// Add a new sale
async function addSale(saleData) {
    return prisma.sale.create({ data: toData(saleData) });
}

// Add multiple sales at once (bulk create)
async function addSalesBulk(salesDataArray) {
    if (!Array.isArray(salesDataArray) || salesDataArray.length === 0) {
        throw new Error("Sales data must be a non-empty array");
    }
    return prisma.sale.createMany({ data: salesDataArray.map(toData) });
}

// Update a sale by id
async function updateSale(id, saleData) {
    const { id: _ignored, ...data } = toData({ ...saleData, id });
    return prisma.sale.update({ where: { id }, data });
}

// Delete a sale by id
async function deleteSale(id) {
    return prisma.sale.delete({ where: { id } });
}

module.exports = { getAllSales, addSale, addSalesBulk, updateSale, deleteSale };

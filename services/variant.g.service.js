const prisma = require("../config/prisma");
const { HttpError } = require("../config/format");

const toVariant = (v) => ({
    id: v.id,
    productId: v.productId,
    size: v.size,
    color: v.color,
    quantity: v.quantity,
});

// Add a new product variant; its opening quantity is recorded as a RESTOCK.
async function addVariant(productId, size, color, quantity, userId) {
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty < 0) throw new HttpError(400, "quantity must be a whole number ≥ 0");

    const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product) throw new HttpError(404, "Product not found");

    try {
        const variant = await prisma.$transaction(async (tx) => {
            const v = await tx.productVariant.create({ data: { productId, size, color, quantity: qty } });
            if (qty > 0) {
                await tx.stockMovement.create({
                    data: { productId, variantId: v.id, type: "RESTOCK", quantity: qty, note: "Initial stock", userId },
                });
            }
            return v;
        });
        return toVariant(variant);
    } catch (error) {
        if (error.code === "P2002") throw new HttpError(409, "This product already has a variant with that size and color");
        throw error;
    }
}

async function getAllVariants() {
    const variants = await prisma.productVariant.findMany({
        where: { product: { deletedAt: null } },
        orderBy: { createdAt: "asc" },
    });
    return variants.map(toVariant);
}

module.exports = { addVariant, getAllVariants };

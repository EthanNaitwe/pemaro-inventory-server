const prisma = require("../config/prisma");

const toVariant = (v) => ({
    id: v.id,
    productId: v.productId,
    size: v.size,
    color: v.color,
    quantity: v.quantity,
});

// Add a new product variant
async function addVariant(productId, size, color, quantity) {
    try {
        const variant = await prisma.productVariant.create({
            data: {
                id: `VAR-${Date.now()}`,
                productId,
                size,
                color,
                quantity: parseInt(quantity, 10) || 0,
            },
        });
        return toVariant(variant);
    } catch (error) {
        console.error("Error adding variant:", error);
        throw new Error("Failed to add variant");
    }
}

// Fetch all variants
async function getAllVariants() {
    try {
        const variants = await prisma.productVariant.findMany({ orderBy: { createdAt: "asc" } });
        return variants.map(toVariant);
    } catch (error) {
        console.error("Error fetching variants:", error);
        throw new Error("Failed to fetch variants");
    }
}

module.exports = { addVariant, getAllVariants };

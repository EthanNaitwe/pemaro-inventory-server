const { validateProduct } = require("../middlewares/productValidator");
const { capitalize } = require("lodash");
const prisma = require("../config/prisma");
const { nextArtNumber } = require("../config/sequence");
const { money, HttpError } = require("../config/format");
const { getSalesForProducts } = require("./sale.g.service");

const PRODUCT_INCLUDE = {
  subCategory: { include: { category: true } },
  variants: { orderBy: { createdAt: "asc" } },
};

// Shape the frontend already uses (name = "Sub: Name", food = plain name).
const toProduct = (p) => ({
  id: p.id,
  name: `${p.subCategory.name}: ${p.name}`,
  artNumber: p.artNumber,
  purchasing_price: money(p.purchasingPrice),
  minimum_price: money(p.sellingPrice),
  description: p.description,
  food_category: p.subCategory.category.name,
  sub_category: p.subCategory.name,
  sub_category_id: p.subCategoryId,
  food: p.name.trim(),
  stock_quantity: p.stockQuantity,
  is_active: p.isActive,
});

const toVariant = (v) => ({
  id: v.id,
  productId: v.productId,
  size: v.size,
  color: capitalize(v.color || ""),
  quantity: v.quantity,
});

async function fetchAllProductsG() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  const sales = await getSalesForProducts(products.map((p) => p.id));

  return products.map((p) => ({
    ...toProduct(p),
    variants: p.variants.map(toVariant),
    sales: sales.filter((s) => s.product_id === p.id),
  }));
}

async function addProductG(product, userId) {
  const { error } = validateProduct(product);
  if (error) throw new HttpError(400, error.details[0].message);

  const subCategory = await prisma.subCategory.findFirst({
    where: { name: product["sub-category"], category: { name: product.category } },
  });
  if (!subCategory) {
    throw new HttpError(400, `Unknown sub-category "${product["sub-category"]}" in "${product.category}"`);
  }

  const initialStock =
    product.stock_quantity === undefined || product.stock_quantity === null || product.stock_quantity === ""
      ? null
      : parseInt(product.stock_quantity, 10);

  const created = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        artNumber: await nextArtNumber(tx),
        name: product.name.trim(),
        description: product.description || null,
        subCategoryId: subCategory.id,
        purchasingPrice: Number(product.purchasing_price) || 0,
        sellingPrice: Number(product.price),
        imageUrl: product.imageUrl || null,
        stockQuantity: initialStock,
        createdById: userId,
      },
    });
    if (initialStock) {
      await tx.stockMovement.create({
        data: { productId: p.id, type: "RESTOCK", quantity: initialStock, note: "Initial stock", userId },
      });
    }
    return p;
  });

  return { success: true, message: "Product added successfully!", id: created.id, artNumber: created.artNumber };
}

async function fetchProductByArtNumberG(artNumber) {
  const p = await prisma.product.findFirst({
    where: { artNumber, deletedAt: null },
    include: PRODUCT_INCLUDE,
  });
  if (!p) return null;
  const { id, name, artNumber: art, purchasing_price, minimum_price, description } = toProduct(p);
  return { id, name, artNumber: art, purchasing_price, minimum_price, description };
}

/**
 * Record a stock change for a product (or one of its variants).
 * type: RESTOCK (quantity > 0) or ADJUSTMENT (quantity may be negative).
 * Turns stock tracking on for the product if it was off.
 */
async function adjustStock(productId, { quantity, type = "RESTOCK", note, variantId }, userId) {
  const qty = parseInt(quantity, 10);
  const kind = String(type).toUpperCase();
  if (!["RESTOCK", "ADJUSTMENT"].includes(kind)) throw new HttpError(400, "type must be RESTOCK or ADJUSTMENT");
  if (!Number.isInteger(qty) || qty === 0 || (kind === "RESTOCK" && qty < 0)) {
    throw new HttpError(400, "quantity must be a non-zero whole number (positive for RESTOCK)");
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product) throw new HttpError(404, "Product not found");

    let stock;
    if (variantId) {
      const where = { id: variantId, productId, ...(qty < 0 ? { quantity: { gte: -qty } } : {}) };
      const { count } = await tx.productVariant.updateMany({ where, data: { quantity: { increment: qty } } });
      if (!count) throw new HttpError(409, "Variant not found or not enough stock");
      stock = (await tx.productVariant.findUnique({ where: { id: variantId } })).quantity;
    } else {
      const current = product.stockQuantity ?? 0;
      if (current + qty < 0) throw new HttpError(409, "Not enough stock");
      stock = (await tx.product.update({ where: { id: productId }, data: { stockQuantity: current + qty } })).stockQuantity;
    }

    await tx.stockMovement.create({
      data: { productId, variantId: variantId || null, type: kind, quantity: qty, note: note || null, userId },
    });
    return { productId, variantId: variantId || null, stock_quantity: stock };
  });
}

async function getStockMovements(productId) {
  const rows = await prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map((m) => ({
    id: m.id, type: m.type, quantity: m.quantity, note: m.note,
    variant_id: m.variantId, sale_item_id: m.saleItemId, user_id: m.userId, created_at: m.createdAt,
  }));
}

module.exports = {
  fetchAllProductsG,
  fetchProductByArtNumberG,
  addProductG,
  adjustStock,
  getStockMovements,
};

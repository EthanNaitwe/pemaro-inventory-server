const { validateProduct } = require("../middlewares/productValidator");
const { capitalize } = require("lodash");
const prisma = require("../config/prisma");
const { createWithNextCode } = require("../config/sequence");

const toSale = (s) => ({
  id: s.id,
  productId: s.productId,
  color: s.color,
  size: s.size,
  reference: s.reference,
  status: s.status,
  payment: s.payment,
  amount: s.amount,
  paid: s.paid,
  due: s.due,
  date: s.date,
});

async function fetchAllProductsG() {
  const [products, sales] = await Promise.all([
    prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: "asc" } }),
    prisma.sale.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    artNumber: p.artNumber,
    purchasing_price: p.purchasingPrice,
    minimum_price: p.minimumPrice,
    description: p.description,
    food_category: p.foodCategory,
    sub_category: p.subCategory,
    food: p.food?.trim(),
    variants: p.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      size: v.size,
      color: capitalize(v.color),
      quantity: v.quantity,
    })),
    sales: sales.filter((s) => s.productId === p.id).map(toSale),
  }));
}

async function addProductG(product) {
  const { error } = validateProduct(product);
  if (error) throw new Error(error.details[0].message);

  await createWithNextCode({
    prefix: "WD",
    loadCodes: async () =>
      (await prisma.product.findMany({ select: { artNumber: true } })).map((p) => p.artNumber),
    create: (artNumber) =>
      prisma.product.create({
        data: {
          id: `${Date.now()}`,
          name: `${product["sub-category"]}: ${product.name}`,
          artNumber,
          purchasingPrice: 0,
          minimumPrice: Number(product.price) || 0,
          description: product.name,
          foodCategory: product.category,
          subCategory: product["sub-category"],
          food: product.name,
        },
      }),
  });

  return { success: true, message: "Product added successfully!" };
}

async function fetchProductByArtNumberG(artNumber) {
  const p = await prisma.product.findUnique({ where: { artNumber } });
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    artNumber: p.artNumber,
    purchasing_price: p.purchasingPrice,
    minimum_price: p.minimumPrice,
    description: p.description,
  };
}

module.exports = {
  fetchAllProductsG,
  fetchProductByArtNumberG,
  addProductG,
};

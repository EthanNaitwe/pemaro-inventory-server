const { groupBy } = require("lodash");
const productService = require("../services/product.g.service");
const catalogService = require("../services/catalog.service");
const { sendError } = require("../config/http");

exports.addProductG = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // The service assigns the next art number (WD1, WD2, ...).
    const result = await productService.addProductG(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error, { fallback: "Failed to add product" });
  }
};

exports.fetchAllProductsG = async (req, res) => {
  try {
    const products = (await productService.fetchAllProductsG()).map(
      (product, index) => ({ ...product, index })
    );
    res.status(200).json({
      products,
      food_category: groupBy(products, "food_category"),
      sub_category: groupBy(products, "sub_category"),
    });
  } catch (error) {
    sendError(res, error, { fallback: "Failed to fetch products" });
  }
};

exports.getProductByArtNumberG = async (req, res) => {
  try {
    const product = await productService.fetchProductByArtNumberG(req.params.artNumber);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    sendError(res, error, { fallback: "Failed to fetch product" });
  }
};

// GET /products/categories
exports.getCategories = async (req, res) => {
  try {
    res.status(200).json(await catalogService.getProductCategories());
  } catch (error) {
    sendError(res, error, { fallback: "Failed to fetch categories" });
  }
};

// POST /products/:productId/stock  { quantity, type?: RESTOCK|ADJUSTMENT, note?, variant_id? }
exports.adjustStock = async (req, res) => {
  try {
    const { quantity, type, note, variant_id } = req.body;
    const result = await productService.adjustStock(
      req.params.productId,
      { quantity, type, note, variantId: variant_id },
      req.user.id
    );
    res.status(201).json({ message: "Stock updated", ...result });
  } catch (error) {
    sendError(res, error, { fallback: "Failed to update stock" });
  }
};

// GET /products/:productId/stock
exports.getStockMovements = async (req, res) => {
  try {
    res.status(200).json({ movements: await productService.getStockMovements(req.params.productId) });
  } catch (error) {
    sendError(res, error, { fallback: "Failed to fetch stock movements" });
  }
};

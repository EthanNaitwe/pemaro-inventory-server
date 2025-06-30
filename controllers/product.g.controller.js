const { groupBy } = require("lodash");
const productService = require("../services/product.g.service");

exports.addProductG = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const products = await productService.fetchAllProductsG();
    const result = await productService.addProductG({
      ...req.body,
      artNumber: `WD${products.length + 1}`,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
};

exports.getProductByArtNumberG = async (req, res) => {
  try {
    const { artNumber } = req.params;
    const product = await productService.fetchProductByArtNumberG(artNumber);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const productService = require('../services/product.g.service');

exports.addProductG = async (req, res) => {
    try {
        const { name, artNumber } = req.body;

        // Validate input
        if (!name || !artNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const product = await productService.fetchProductByArtNumberG(artNumber);

        if (product) {
            throw new Error('A Product with this Art Number already exists');
        }

        const result = await productService.addProductG(req.body);

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.fetchAllProductsG = async (req, res) => {
    try {
        const products = await productService.fetchAllProductsG();
        res.status(200).json({ products });
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

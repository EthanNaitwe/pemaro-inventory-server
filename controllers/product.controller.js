const productService = require('../services/product.service');

exports.createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const message = await productService.deleteProduct(req.params.id);
        res.status(200).json(message);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

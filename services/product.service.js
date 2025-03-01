const { Product } = require('../config/db');
const { validateProduct } = require('../middlewares/productValidator');

exports.createProduct = async (data) => {
    const { error } = validateProduct(data);
    if (error) throw new Error(error.details[0].message);

    return await Product.create(data);
};

exports.getAllProducts = async () => {
    return await Product.findAll();
};

exports.getProductById = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Product not found');
    return product;
};

exports.updateProduct = async (id, data) => {
    const { error } = validateProduct(data);
    if (error) throw new Error(error.details[0].message);

    const product = await Product.findByPk(id);
    if (!product) throw new Error('Product not found');

    await product.update(data);
    return product;
};

exports.deleteProduct = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Product not found');

    await product.destroy();
    return { message: 'Product deleted successfully' };
};

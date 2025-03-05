const { Product, ProductVariant } = require('../config/db');
const { validateProduct, addVariantSchema } = require('../middlewares/productValidator');

exports.createProduct = async (data) => {
    const { error } = validateProduct(data);
    if (error) throw new Error(error.details[0].message);

    return await Product.create(data);
};

exports.getAllProducts = async () => {
    return await Product.findAll({
        include: [{ model: ProductVariant, as: 'variants' }],
    });
};

exports.getProductById = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Product Not Found');
    return product;
};

exports.updateProduct = async (id, data) => {
    const { error } = validateProduct(data);
    if (error) throw new Error(error.details[0].message);

    const product = await Product.findByPk(id);
    if (!product) throw new Error('Product Not Found');

    await product.update(data);
    return product;
};

exports.deleteProduct = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Product Not Found');

    await product.destroy();
    return { message: 'Product deleted successfully' };
};

// Product Variant Services

exports.bulkCreateProductVariants = async (data) => {
    // const { error } = validateProduct(data);
    // if (error) throw new Error(error.details[0].message);
    return await ProductVariant.bulkCreate(data);
};

exports.addVariant = async (data) => {
    const { error } = addVariantSchema(data);
    if (error) throw new Error(error.details[0].message);
    return await ProductVariant.create(data);
};

const Joi = require('joi');

exports.validateProduct = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        artNumber: Joi.string().optional(), // assigned by the server
        category: Joi.string().required(),
        'sub-category': Joi.string().required(),
        price: Joi.number().integer().min(1).required(),
        imageUrl: Joi.string().uri().optional(),
        description: Joi.string().allow('').optional(),
        purchasing_price: Joi.number().min(0).optional(),
        stock_quantity: Joi.number().integer().min(0).allow(null, '').optional(),
    });
    return schema.validate(data);
};

exports.addVariantSchema = (data) => {
    const schema = Joi.object({
        productId: Joi.string().uuid().required(),
        size: Joi.string().required(),
        color: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
    });
    return schema.validate(data);
};

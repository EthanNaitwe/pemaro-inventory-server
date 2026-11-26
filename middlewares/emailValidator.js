const Joi = require('joi');

exports.validateProduct = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        // artNumber: Joi.string().required(),
        minimum_price: Joi.number().integer().min(1).required(),
        purchasing_price: Joi.number().integer().min(1).required(),
        imageUrl: Joi.string().uri().optional(),
        description: Joi.string().optional(),
    });
    return schema.validate(data);
};

exports.addVariantSchema = (data) => {
    const schema = Joi.object({
        productId: Joi.number().required(),
        size: Joi.string().required(),
        color: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
    });
    return schema.validate(data);
};

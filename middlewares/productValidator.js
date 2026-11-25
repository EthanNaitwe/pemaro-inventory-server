const Joi = require('joi');

exports.validateProduct = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        artNumber: Joi.string().optional(), // assigned by the server
        category: Joi.string().required(),
        'sub-category': Joi.string().required(),
        price: Joi.number().integer().min(1).required(),
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

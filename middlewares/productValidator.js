const Joi = require('joi');

exports.validateProduct = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        size: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        artNumber: Joi.string().required(),
        // price: Joi.number().positive(),
        color: Joi.string().required(),
        tax: Joi.number().min(0).max(100).optional(),
        discount: Joi.number().min(0).max(100).optional(),
        imageUrl: Joi.string().uri().optional(),
        description: Joi.string().optional(),
    });
    return schema.validate(data);
};

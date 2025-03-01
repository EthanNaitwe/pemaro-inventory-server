// middlewares/validate.js

const Joi = require('joi');

// Joi validation schema for user registration
const registerSchema = Joi.object({
    surname: Joi.string().min(3).max(30).required().messages({
        'string.base': '"surname" should be a type of text',
        'string.min': '"surname" should have a minimum length of 3 characters',
        'string.max': '"surname" should have a maximum length of 30 characters',
        'any.required': '"surname" is required'
    }),
    other_names: Joi.string().min(3).max(30).required().messages({
        'string.base': '"other_names" should be a type of text',
        'string.min': '"other_names" should have a minimum length of 3 characters',
        'string.max': '"other_names" should have a maximum length of 30 characters',
        'any.required': '"other_names" is required'
    }),
    address: Joi.string().min(4).max(50).messages({
        'string.base': '"address" should be a type of text',
        'string.min': '"address" should have a minimum length of 4 characters',
        'string.max': '"address" should have a maximum length of 50 characters',
        // 'any.required': '"address" is required'
    }),
    gender: Joi.string().min(4).max(8).messages({
        'string.base': '"gender" should be a type of text',
        'string.min': '"gender" should have a minimum length of 4 characters',
        'string.max': '"gender" should have a maximum length of 8 characters',
        // 'any.required': '"address" is required'
    }),
    email: Joi.string().email().required().messages({
        'string.base': '"email" should be a type of text',
        'string.empty': '"email" cannot be empty',
        'string.email': '"email" should be a valid email address',
        'any.required': '"email" is required'
    }),
    phone_number: Joi.string().pattern(/^2567\d{8}$/).required().messages({
        'string.base': '"phone_number" should be a type of text',
        'string.empty': '"phone_number" cannot be empty',
        'string.pattern.base': '"phone_number" should be valid',
        'any.required': '"phone_number" is required'
    }),
    avatar: Joi.string().min(4).max(100).uri().messages({
        'string.base': '"avatar" should be a type of text',
        'string.min': '"avatar" should have a minimum length of 4 characters',
        'string.max': '"avatar" should have a maximum length of 100 characters',
        'string.uri': '"avatar" should be a valid URL',
    }),
    birth_date: Joi.date()
        // .min(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
        .max(new Date())
        .messages({
            'date.base': '"birth_date" should be a valid date',
            // 'date.min': 'User should be above 18 years of age',
            'date.max': '"birth_date"  should not be later than today',
            // 'any.required': '"birth_date" is required'
        }),
    password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/-]).*$/)
        .required()
        .messages({
            'string.base': '"password" should be a type of text',
            'string.pattern.base': '"password" should contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
            'any.required': '"password" is required'
        }),
});

// Joi validation schema for user login
const loginSchema = Joi.object({
    email: Joi.string().email(),
    phone_number: Joi.string().pattern(/^2567\d{8}$/),
    password: Joi.string().required(),
}).xor('email', 'phone_number');

// Validation middleware function
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ message });
        }
        next();
    };
}

module.exports = { registerSchema, loginSchema, validate };

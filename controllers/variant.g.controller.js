const variantService = require('../services/variant.g.service');
const { sendError } = require('../config/http');

exports.addVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size, color, quantity } = req.body;

        if (!productId || !size || !color || quantity === undefined || quantity === "")
            return res.status(400).json({ message: "All fields are required" });

        const newVariant = await variantService.addVariant(productId, size, color, quantity, req.user.id);
        res.status(201).json({ message: "Variant added successfully", variant: newVariant });
    } catch (error) {
        sendError(res, error, { fallback: "Failed to add variant" });
    }
};

exports.getAllVariants = async (req, res) => {
    try {
        const variants = await variantService.getAllVariants();
        res.status(200).json(variants);
    } catch (error) {
        sendError(res, error, { fallback: "Failed to fetch variants" });
    }
};

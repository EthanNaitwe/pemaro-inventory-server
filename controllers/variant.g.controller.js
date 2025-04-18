const variantService = require('../services/variant.g.service');

exports.addVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size, color, quantity } = req.body;

        if (!productId || !size || !color || !quantity)
            return res.status(400).json({ message: "All fields are required`" });

        const newVariant = await variantService.addVariant(productId, size, color, quantity);
        res.status(201).json({ message: "Variant added successfully", variant: newVariant });
    } catch (error) {
        res.status(500).json({ message: "Failed to add variant", error: error.message });
    }
};

exports.getAllVariants = async (req, res) => {
    try {
        const variants = await variantService.getAllVariants();
        res.status(200).json(variants);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch variants", error: error.message });
    }
};

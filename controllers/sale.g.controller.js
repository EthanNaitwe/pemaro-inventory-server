const salesService = require("../services/sale.g.service");
const { sendError } = require("../config/http");

// Get all sales (one row per sale line)
async function getAllSales(req, res) {
    try {
        const sales = await salesService.getAllSales();
        res.status(200).json({ message: "Sales fetched successfully", sales });
    } catch (error) {
        sendError(res, error, { key: "error", fallback: "Failed to retrieve sales" });
    }
}

// Single-product sale: POST /sales/:prodId/product
async function addSale(req, res) {
    try {
        const { prodId } = req.params;
        const { quantity, payment_method, variant_id, amount_paid } = req.body;

        if (!quantity) return res.status(400).json({ message: "All fields are required." });

        const sale = await salesService.createSale({
            userId: req.user.id,
            paymentMethod: payment_method,
            amountPaid: amount_paid,
            items: [{ productId: prodId, quantity, variantId: variant_id }],
        });
        res.status(201).json({ message: "Sale added successfully", sale });
    } catch (error) {
        sendError(res, error, { fallback: "Failed to add sale" });
    }
}

// Checkout with several lines (one receipt): POST /sales/product
// Body: [{ prod_id, quantity, payment_method, variant_id? }, ...]
async function addSalesBulk(req, res) {
    try {
        const lines = req.body;

        if (!Array.isArray(lines) || lines.length === 0) {
            return res.status(400).json({ error: "Sales data must be a non-empty array" });
        }
        if (lines.some((line) => !line.prod_id || !line.quantity)) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const sale = await salesService.createSale({
            userId: req.user.id,
            paymentMethod: lines.find((l) => l.payment_method)?.payment_method,
            items: lines.map((line) => ({
                productId: line.prod_id,
                quantity: line.quantity,
                variantId: line.variant_id,
            })),
        });

        res.status(201).json({ message: "Sales added successfully", sale });
    } catch (error) {
        sendError(res, error, { key: "error", fallback: "Failed to add sales" });
    }
}

module.exports = { getAllSales, addSale, addSalesBulk };

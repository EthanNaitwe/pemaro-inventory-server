const salesService = require("../services/sale.g.service");
const { DateTime } = require("luxon");

// Get all sales
async function getAllSales(req, res) {
    try {
        const sales = await salesService.getAllSales();
        res.status(200).json({ message: "Sales fetched successfully", sales });
    } catch (error) {
        console.error("Error fetching sales:", error);
        res.status(500).json({ error: "Failed to retrieve sales" });
    }
}

// Add a new sale
async function addSale(req, res) {
    try {
        const { prodId } = req.params;
        const { artNumber, amount, quantity } = req.body;

        if (!quantity || !artNumber)
            return res.status(400).json({ message: "All fields are required." });

        await salesService.addSale(
            {
                id: `SAL-${Date.now()}`,
                productId: prodId,
                quantity,
                status: 'Completed',
                payment: 'Paid',
                amount,
                paid: amount,
                due: 0,
                user_id: req.user.id,
                date: DateTime.now().toFormat('dd/MM/yyyy'),
            });
        res.status(201).json({ message: "Sale added successfully" });
    } catch (error) {
        console.error("Error adding sale:", error);
        res.status(500).json({ error: "Failed to add sale" });
    }
}

// Update a sale
async function updateSale(req, res) {
    try {
        const { rowIndex } = req.params;
        const saleData = req.body;
        await salesService.updateSale(parseInt(rowIndex), saleData);
        res.status(200).json({ message: "Sale updated successfully" });
    } catch (error) {
        console.error("Error updating sale:", error);
        res.status(500).json({ error: "Failed to update sale" });
    }
}

// Delete a sale
async function deleteSale(req, res) {
    try {
        const { rowIndex } = req.params;
        await salesService.deleteSale(parseInt(rowIndex));
        res.status(200).json({ message: "Sale deleted successfully" });
    } catch (error) {
        console.error("Error deleting sale:", error);
        res.status(500).json({ error: "Failed to delete sale" });
    }
}

module.exports = { getAllSales, addSale, updateSale, deleteSale };

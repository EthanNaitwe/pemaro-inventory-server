const expenseService = require("../services/expense.g.service");

// Get all expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getAllExpenses();
        res.status(200).json({ data: expenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new expense
exports.addExpense = async (req, res) => {
    try {
        const newExpense = await expenseService.addExpense({ ...req.body, user_id: req.user.id });
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an expense
exports.updateExpense = async (req, res) => {
    try {
        const { ref } = req.params;
        const updatedExpense = await expenseService.updateExpense(ref, req.body);
        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        const { ref } = req.params;
        const response = await expenseService.deleteExpense(ref);
        res.status(200).json(response);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

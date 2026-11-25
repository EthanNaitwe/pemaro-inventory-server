const expenseService = require("../services/expense.g.service");
const catalogService = require("../services/catalog.service");
const { sendError } = require("../config/http");

exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getAllExpenses();
        res.status(200).json({ data: expenses });
    } catch (error) {
        sendError(res, error, { fallback: "Failed to fetch expenses" });
    }
};

exports.getExpenseCategories = async (req, res) => {
    try {
        res.status(200).json({ categories: await catalogService.getExpenseCategories() });
    } catch (error) {
        sendError(res, error, { fallback: "Failed to fetch expense categories" });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const newExpense = await expenseService.addExpense({ ...req.body, user_id: req.user.id });
        res.status(201).json(newExpense);
    } catch (error) {
        sendError(res, error, { fallback: "Failed to add expense" });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const updatedExpense = await expenseService.updateExpense(req.params.ref, req.body);
        res.status(200).json(updatedExpense);
    } catch (error) {
        sendError(res, error, { fallback: "Failed to update expense" });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const response = await expenseService.deleteExpense(req.params.ref);
        res.status(200).json(response);
    } catch (error) {
        sendError(res, error, { fallback: "Failed to delete expense" });
    }
};

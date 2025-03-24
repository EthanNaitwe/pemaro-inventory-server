const express = require("express");
const expenseController = require("../controllers/expense.g.controller");

const router = express.Router();

router.get("/", expenseController.getAllExpenses);
router.post("/", expenseController.addExpense);
router.put("/:ref", expenseController.updateExpense);
router.delete("/:ref", expenseController.deleteExpense);

module.exports = router;

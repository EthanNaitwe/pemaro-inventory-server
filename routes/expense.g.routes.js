const express = require("express");
const expenseController = require("../controllers/expense.g.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, expenseController.getAllExpenses);
router.post("/", authMiddleware, expenseController.addExpense);
router.put("/:ref", authMiddleware, expenseController.updateExpense);
router.delete("/:ref", authMiddleware, expenseController.deleteExpense);

module.exports = router;

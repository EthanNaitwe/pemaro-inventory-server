const { DateTime } = require("luxon");
const prisma = require("../config/prisma");
const { createWithNextCode } = require("../config/sequence");

const toExpense = (e) => ({
    id: e.id,
    category: e.category || "",
    ref: e.ref,
    date: e.date || "",
    status: e.status || "",
    amount: e.amount,
    description: e.description || "",
    user_id: e.userId || "",
});

// Fetch all expenses
async function getAllExpenses() {
    const expenses = await prisma.expense.findMany({ orderBy: { createdAt: "asc" } });
    return expenses.map(toExpense);
}

// Add a new expense
async function addExpense(expense) {
    // Refs keep the original "PT00<n>" format; n continues from the highest ref.
    await createWithNextCode({
        prefix: "PT00",
        loadCodes: async () => (await prisma.expense.findMany({ select: { ref: true } })).map((e) => e.ref),
        create: (ref) =>
            prisma.expense.create({
                data: {
                    id: `EXP-${Date.now()}`,
                    category: expense.category,
                    ref,
                    date: DateTime.now().toFormat("dd/MM/yyyy"),
                    status: "Active",
                    amount: Number(expense.amount) || 0,
                    description: expense.description,
                    userId: expense.user_id,
                },
            }),
    });

    return { message: "Expense added successfully", expense };
}

// Update an expense by reference
async function updateExpense(ref, updatedExpense) {
    const existing = await prisma.expense.findUnique({ where: { ref } });
    if (!existing) throw new Error("Expense not found");

    const { category, date, status, amount, description } = updatedExpense;
    await prisma.expense.update({
        where: { ref },
        data: {
            category,
            date,
            status,
            amount: amount === undefined ? undefined : Number(amount) || 0,
            description,
        },
    });

    return { message: "Expense updated successfully", updatedExpense };
}

// Delete an expense by reference
async function deleteExpense(ref) {
    const existing = await prisma.expense.findUnique({ where: { ref } });
    if (!existing) throw new Error("Expense not found");

    await prisma.expense.delete({ where: { ref } });
    return { message: "Expense deleted successfully" };
}

module.exports = { getAllExpenses, addExpense, updateExpense, deleteExpense };

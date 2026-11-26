const prisma = require("../config/prisma");
const { nextExpenseRef } = require("../config/sequence");
const { money, displayDate, parseDate, expenseStatus, HttpError } = require("../config/format");

const toExpense = (e) => ({
    id: e.id,
    category: e.category.name,
    ref: e.ref,
    date: displayDate(e.spentAt),
    status: expenseStatus.toApi(e.status),
    amount: money(e.amount),
    description: e.description || "",
    user_id: e.userId,
});

async function findCategory(name) {
    const category = await prisma.expenseCategory.findUnique({ where: { name: String(name || "") } });
    if (!category) throw new HttpError(400, `Unknown expense category "${name}"`);
    return category;
}

const parseAmount = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) throw new HttpError(400, "amount must be a positive number");
    return amount;
};

async function getAllExpenses() {
    const expenses = await prisma.expense.findMany({
        where: { deletedAt: null },
        include: { category: true },
        orderBy: { spentAt: "desc" },
    });
    return expenses.map(toExpense);
}

async function addExpense(expense) {
    const category = await findCategory(expense.category);
    const amount = parseAmount(expense.amount);

    const created = await prisma.$transaction(async (tx) =>
        tx.expense.create({
            data: {
                ref: await nextExpenseRef(tx),
                categoryId: category.id,
                amount,
                description: expense.description || null,
                spentAt: parseDate(expense.date) || new Date(),
                userId: expense.user_id,
            },
            include: { category: true },
        })
    );

    return { message: "Expense added successfully", expense: toExpense(created) };
}

async function updateExpense(ref, updatedExpense) {
    const existing = await prisma.expense.findFirst({ where: { ref, deletedAt: null } });
    if (!existing) throw new HttpError(404, "Expense not found");

    const { category, date, status, amount, description } = updatedExpense;
    let status_;
    try {
        status_ = status === undefined ? undefined : expenseStatus.fromApi(status);
    } catch {
        throw new HttpError(400, `Invalid status "${status}"`);
    }

    const updated = await prisma.expense.update({
        where: { id: existing.id },
        data: {
            categoryId: category === undefined ? undefined : (await findCategory(category)).id,
            spentAt: date === undefined ? undefined : parseDate(date),
            status: status_,
            amount: amount === undefined ? undefined : parseAmount(amount),
            description,
        },
        include: { category: true },
    });

    return { message: "Expense updated successfully", updatedExpense: toExpense(updated) };
}

// Soft delete: the row stays for the audit trail but disappears from lists.
async function deleteExpense(ref) {
    const existing = await prisma.expense.findFirst({ where: { ref, deletedAt: null } });
    if (!existing) throw new HttpError(404, "Expense not found");

    await prisma.expense.update({ where: { id: existing.id }, data: { deletedAt: new Date(), status: "VOID" } });
    return { message: "Expense deleted successfully" };
}

module.exports = { getAllExpenses, addExpense, updateExpense, deleteExpense };

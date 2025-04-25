const { DateTime } = require("luxon");
const { getSheetsClient } = require("../config/googleSheets");

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME = "Expenses";

// Fetch all expenses
async function getAllExpenses() {
    const sheets = await getSheetsClient();
    const range = `${SHEET_NAME}!A2:Z`;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range,
    });

    const rows = response.data.values || [];
    return rows.map(row => ({
        id: row[0] || "",
        category: row[1] || "",
        ref: row[2] || "",
        date: row[3] || "",
        status: row[4] || "",
        amount: parseFloat(row[5]) || 0,
        description: row[6] || "",
        user_id: row[7] || "",
    }));
}

// Add a new expense
async function addExpense(expense) {
    const sheets = await getSheetsClient();
    const range = `${SHEET_NAME}!A2:Z`;
    const refNo = `PT00${(await getAllExpenses()).length + 1}`;

    const status = "Active";
    const expenseId = `EXP-${Date.now()}`;
    const date = DateTime.now().toFormat('dd/MM/yyyy');

    const values = [[
        expenseId, expense.category, refNo, date, status,
        expense.amount, expense.description, expense.user_id
    ]];

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
    });

    return { message: "Expense added successfully", expense };
}

// Update an expense by reference
async function updateExpense(ref, updatedExpense) {
    const sheets = await getSheetsClient();
    const expenses = await getAllExpenses();

    const rowIndex = expenses.findIndex(exp => exp.ref === ref);
    if (rowIndex === -1) throw new Error("Expense not found");

    const rowRange = `${SHEET_NAME}!A${rowIndex + 2}:F${rowIndex + 2}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: rowRange,
        valueInputOption: "RAW",
        requestBody: {
            values: [[
                updatedExpense.category, updatedExpense.ref, updatedExpense.date,
                updatedExpense.status, updatedExpense.amount, updatedExpense.description
            ]]
        },
    });

    return { message: "Expense updated successfully", updatedExpense };
}

// Delete an expense by reference
async function deleteExpense(ref) {
    const sheets = await getSheetsClient();
    const expenses = await getAllExpenses();

    const rowIndex = expenses.findIndex(exp => exp.ref === ref);
    if (rowIndex === -1) throw new Error("Expense not found");

    const rowRange = `${SHEET_NAME}!A${rowIndex + 2}:F${rowIndex + 2}`;
    await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: rowRange,
    });

    return { message: "Expense deleted successfully" };
}

module.exports = { getAllExpenses, addExpense, updateExpense, deleteExpense };

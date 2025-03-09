const { getSheetsClient, appendToSheet } = require('../config/googleSheets');

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Add a new product variant
async function addVariant(productId, size, color, quantity) {
    try {
        const sheets = await getSheetsClient();
        const range = "ProductVariants!A2:E";

        // Generate a unique ID (For simplicity, using timestamp)
        const variantId = `VAR-${Date.now()}`;

        const newVariant = [variantId, productId, size, color, quantity];

        await appendToSheet(sheets, SPREADSHEET_ID, range, [newVariant]);

        return { id: variantId, productId, size, color, quantity };
    } catch (error) {
        console.error("Error adding variant:", error);
        throw new Error("Failed to add variant");
    }
}

// Fetch all variants
async function getAllVariants() {
    try {
        const sheets = await getSheetsClient();
        const range = "ProductVariants!A2:E";
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values || [];
        return rows.map(row => ({
            id: row[0],
            productId: row[1],
            size: row[2],
            color: row[3],
            quantity: parseInt(row[4], 10),
        }));
    } catch (error) {
        console.error("Error fetching variants:", error);
        throw new Error("Failed to fetch variants");
    }
}

module.exports = { addVariant, getAllVariants };

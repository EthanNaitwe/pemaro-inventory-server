const { getSheetsClient, appendToSheet } = require('../config/googleSheets');

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Add a new product variant
async function subscribe(email) {
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

module.exports = { subscribe };

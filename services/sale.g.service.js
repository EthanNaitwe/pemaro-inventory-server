const { getSheetsClient, SPREADSHEET_ID } = require("../config/googleSheets");

const SALES_SHEET = "Sales"; // Change this to match your sheet's name
const PRODUCTS_SHEET = "Products"; // Change this to match your sheet's name

// Get all sales
async function getAllSales() {
    const sheets = await getSheetsClient();
    const saleResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SALES_SHEET}!A:Z`, // Fetch all columns
    });

    // Fetch products
    const productResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCTS_SHEET}!A2:F`,
    });


    const saleRows = saleResponse.data.values || [];
    const productRows = productResponse.data.values || [];


    // Convert rows into an array of objects
    const products = productRows.map(row => ({
        id: row[0],
        artNumber: row[2],
    }));

    const headers = saleRows[0]; // Extract column headers
    return saleRows.slice(1).map((row) => {
        let sale = {};
        headers.forEach((header, index) => {
            sale[header] = row[index] || "";
            sale.artNumber = products.find(prod => prod.id === row[1]);
        });
        return sale;
    });
}

// Add a new sale
async function addSale(saleData) {
    const sheets = await getSheetsClient();
    const values = Object.values(saleData);

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SALES_SHEET}!A:Z`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [values] },
    });

    return response.data;
}

// Update a sale (by row index)
async function updateSale(rowIndex, saleData) {
    const sheets = await getSheetsClient();
    const values = Object.values(saleData);

    const rowRange = `${SALES_SHEET}!A${rowIndex + 2}:Z${rowIndex + 2}`; // Adjust for header row
    const response = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: rowRange,
        valueInputOption: "RAW",
        requestBody: { values: [values] },
    });

    return response.data;
}

// Delete a sale (by clearing row)
async function deleteSale(rowIndex) {
    const sheets = await getSheetsClient();
    const rowRange = `${SALES_SHEET}!A${rowIndex + 2}:Z${rowIndex + 2}`;

    const response = await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: rowRange,
    });

    return response.data;
}

module.exports = { getAllSales, addSale, updateSale, deleteSale };

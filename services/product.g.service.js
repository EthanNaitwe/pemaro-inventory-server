
const { validateProduct } = require('../middlewares/productValidator');
const { getSheetsClient } = require('../config/googleSheets');
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;


exports.addProductG = async (product) => {
    const { error } = validateProduct(product);
    if (error) throw new Error(error.details[0].message);

    const sheets = await getSheetsClient();
    const range = "Products!A2:F"; // Ensure this matches your sheet's structure

    // Append new product row
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
            values: [[
                Date.now(),
                product.name,
                product.artNumber,
                product.tax,
                product.discount,
                product.description,
            ]],
        },
    });

    return { success: true, message: "Product added successfully!" };
}


exports.fetchAllProductsG = async () => {
    const sheets = await getSheetsClient();
    const productRange = "Products!A2:F"; // Ensure this range covers your product data
    const variantRange = "ProductVariants!A2:E"; // Ensure this range covers variant data

    // Fetch products
    const productResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: productRange,
    });

    // Fetch variants
    const variantResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: variantRange,
    });

    const productRows = productResponse.data.values || [];
    const variantRows = variantResponse.data.values || [];

    // Convert rows into an array of objects
    const products = productRows.map(row => ({
        id: row[0],
        name: row[1],
        artNumber: row[2],
        tax: parseFloat(row[3]) || 0,
        discount: parseFloat(row[4]) || 0,
        description: row[5],
        variants: [] // Initialize empty array
    }));

    const variants = variantRows.map(row => ({
        id: row[0],
        productId: row[1],
        size: row[2],
        color: row[3],
        quantity: parseInt(row[4], 10),
    }));

    // Assign variants to respective products
    products.forEach(product => {
        product.variants = variants.filter(variant => variant.productId === product.id);
    });

    return products;
}

exports.fetchProductByArtNumberG = async (artNumber) => {
    const sheets = await getSheetsClient();
    const range = "Products!A2:F"; // Ensure this range covers your product data

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return null;

    // Find the product with the matching artNumber
    const product = rows.find(row => row[2] === artNumber);

    if (!product) return null;
    

    return {
        id: product[0],
        name: product[1],
        artNumber: product[2],
        tax: product[3],
        discount: product[4],
        description: product[5],
    };
}

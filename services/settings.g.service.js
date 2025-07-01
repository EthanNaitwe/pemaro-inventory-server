const { getSheetsClient, SPREADSHEET_ID } = require("../config/googleSheets");

const SETTINGS_SHEET = "Settings"; // Change this to match your sheet's name

// Get all Settngs
async function getAllSettings() {
    const sheets = await getSheetsClient();
    // const settingResponse = await sheets.spreadsheets.values.get({
    //     spreadsheetId: SPREADSHEET_ID,
    //     range: `${SETTINGS_SHEET}!A:Z`, // Fetch all columns
    // });

    // const settingRows = settingResponse.data.values || [];

    // const headers = settingRows[0]; // Extract column headers
    // return settingRows.slice(1).map((row) => {
    //     let setting = {};
    //     headers.forEach((header, index) => {
    //         setting[header] = row[index] || "";
    //     });
    //     return setting;
    // });
    return {};
}

// Update a setting (by row index)
async function updateSetting(rowIndex, settingData) {
    const sheets = await getSheetsClient();
    const values = Object.values(settingData);

    const rowRange = `${SETTINGS_SHEET}!A${rowIndex + 2}:Z${rowIndex + 2}`; // Adjust for header row
    const response = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: rowRange,
        valueInputOption: "RAW",
        requestBody: { values: [values] },
    });

    return response.data;
}

module.exports = { getAllSettings, updateSetting };

require('dotenv').config();
const { google } = require('googleapis');

// Authenticate using a service account
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix newline issue
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Get Sheets API client
async function getSheetsClient() {
    const authClient = await auth.getClient();
    return google.sheets({ version: "v4", auth: authClient });
}

// // Append data to a specific sheet
// async function appendToSheet(sheets, spreadsheetId, range, values) {
//     try {
//         const response = await sheets.spreadsheets.values.append({
//             spreadsheetId,
//             range,
//             valueInputOption: 'RAW',
//             insertDataOption: 'INSERT_ROWS',
//             requestBody: { values },
//         });

//         return response.data;
//     } catch (error) {
//         console.error('Error appending data:', error);
//         throw new Error('Failed to append data to sheet');
//     }
// }
async function appendToSheet(sheets, spreadsheetId, range, values) {
    try {
        console.log(`📌 Appending to ${spreadsheetId} -> ${range}:`, values);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values },
        });

        console.log('✅ Data appended successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error appending data to sheet:', error.response?.data || error);
        throw new Error('Failed to append data to sheet');
    }
}

module.exports = { getSheetsClient, appendToSheet };

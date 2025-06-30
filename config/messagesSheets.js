// filepath: g:\Projects\WithPemaro\my-server-template\config\messagesSheets.js

require('dotenv').config();
const { google } = require('googleapis');

// Reusable function to get an authenticated sheets client
function getSheetsClient() {
    const {
        GOOGLE_SHEETS_CLIENT_EMAIL,
        GOOGLE_SHEETS_PRIVATE_KEY
    } = process.env;

    const auth = new google.auth.JWT(
        GOOGLE_SHEETS_CLIENT_EMAIL,
        null,
        GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    return google.sheets({ version: 'v4', auth });
}

// Get spreadsheet ID and sheet name from env
const GOOGLE_SHEETS_SPREADSHEET_ID = '1PoF2s2X79DGi1tmccVofwC7P2sQfpoA2uFCs6ycfXXI';
const SHEET_NAME = 'Kisyanga Subscriptions';

// Save a subscriber email to the sheet
async function saveSubscriberEmail(email, sheet) {
    const sheets = getSheetsClient();

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
            range: `${sheet}!A:Z`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [[email]],
            },
        });
        return true;
    } catch (error) {
        // console.error('Error saving subscriber email:', error);
        throw new Error(error);
    }
}

// Check if an email is already subscribed
async function isEmailSubscribed(email, sheet) {
    const sheets = getSheetsClient();

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
            range: `${sheet}!A:A`,
        });
        const emails = (response.data.values || []).flat();
        return emails.includes(email);
    } catch (error) {
        // console.error('Error checking subscriber email:', error);
        throw new Error(error);
    }
}

// Save a user's message to the sheet
async function saveMessageDetails(name, email, subject, message, sheet) {
    const sheets = getSheetsClient();

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
            range: `${sheet}!A:Z`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [[name, email, subject, message]],
            },
        });
        return true;
    } catch (error) {
        // console.error('Error saving subscriber email:', error);
        throw new Error(error);
    }
}

module.exports = { saveSubscriberEmail, isEmailSubscribed, saveMessageDetails };

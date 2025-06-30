const { getSheetsClient } = require('../config/googleSheets');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file


// Function to authenticate user
async function loginUser(email, password) {
    try {
        const sheets = await getSheetsClient();
        const range = "Users!A2:K"; // Adjust range to cover user data

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return { error: "No users found" };

        // Find the user by email
        const userRow = rows.find(row => row[6] === email);
        if (!userRow) return { error: "Invalid credentials" };

        // Extract user data
        const user = {
            id: userRow[0],
            surname: userRow[1],
            other_names: userRow[2],
            avatar: userRow[3],
            gender: userRow[4],
            birth_date: userRow[5],
            email: userRow[6],
            address: userRow[7],
            phone_number: userRow[8],
            password: userRow[9], // Hashed password
            role: userRow[10],
        };

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return { error: "Invalid credentialz" };

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        return { token, user: { id: user.id, email: user.email, surname: user.surname, other_names: user.other_names } };
    } catch (error) {
        console.error("Error during login:", error);
        throw new Error("Login failed");
    }
}


// Function to fetch user profile
async function getUserProfile(userId) {
    try {
        const sheets = await getSheetsClient();
        const range = "Users!A2:K"; // Adjust range to cover user data

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return null;

        // Find user by ID
        const userRow = rows.find(row => row[0] === userId);
        if (!userRow) return null;

        return {
            id: userRow[0],
            surname: userRow[1],
            other_names: userRow[2],
            avatar: userRow[3],
            gender: userRow[4],
            birth_date: userRow[5],
            email: userRow[6],
            address: userRow[7],
            phone_number: userRow[8],
            role: userRow[10],
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile");
    }
}

/**
 * Fetch all users from the Google Sheet
 */
async function getAllUsers() {
    try {
        const sheets = await getSheetsClient();
        const range = "Users!A2:L"; // Adjust range to cover user data

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return [];
        }

        // Convert rows to objects
        const users = rows.map(row => ({
            id: row[0],
            surname: row[1],
            other_names: row[2],
            avatar: row[3],
            gender: row[4],
            birth_date: row[5],
            email: row[6],
            address: row[7],
            phone_number: row[8],
            role: row[10],
            is_active: row[11] === "TRUE" // Convert string "TRUE"/"FALSE" to boolean,
        }));

        return users;
    } catch (error) {
        console.error("❌ Error fetching users:", error.response?.data || error);
        throw new Error("Failed to retrieve users from the sheet");
    }
}


module.exports = { loginUser, getUserProfile, getAllUsers };

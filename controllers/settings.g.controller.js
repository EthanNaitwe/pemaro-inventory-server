const { saveSubscriberEmail, isEmailSubscribed, saveMessageDetails } = require("../config/messagesSheets");
const settingsService = require("../services/settings.g.service");

// Get All Settings
async function getAllSettings(req, res) {
    try {
        const data = await settingsService.getAllSettings();

        // Convert string "TRUE"/"FALSE" to actual booleans
        const settings = Object.fromEntries(
            Object.entries(data[0]).map(([key, value]) => {
                if (value === "TRUE") return [key, true];
                if (value === "FALSE") return [key, false];
                return [key, value];
            })
        );

        res.status(200).json({ message: "Settings fetched successfully", settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Failed to retrieve settings" });
    }
}

// Update Settings
async function updateSetting(req, res) {
    try {
        const { rowIndex } = req.params;
        const settingData = req.body;
        await settingsService.updateSetting(parseInt(rowIndex), settingData);
        res.status(200).json({ message: "Setting updated successfully" });
    } catch (error) {
        // console.error("Error updating setting:", error);
        res.status(500).json({ error: "Failed to update setting" });
    }
}

// Add Subscriber
async function saveSubscriber(req, res) {
    try {
        const { email, sheet } = req.body;
        const alreadySubscribed = await isEmailSubscribed(email, sheet);
        if (!alreadySubscribed) {
            await saveSubscriberEmail(email, sheet);
            res.status(200).json({ message: "Subscriber added successfully" });
        } else {
            res.status(400).json({ message: "Email is already subscribed" });
        }
        return;
    } catch ({ message }) {
        // console.error("Error updating setting:", er  ror);
        res.status(500).json({ error: message });
    }
}

// Save Message Details
async function saveContactUsMessage(req, res) {
    try {
        const { name, email, subject, message, sheet } = req.body;
        await saveMessageDetails(name, email, subject, message, sheet);
        res.status(200).json({ message: "Message details added successfully" });
    } catch ({ message }) {
        // console.error("Error updating setting:", error);
        res.status(500).json({ error: message });
    }
}

module.exports = { getAllSettings, updateSetting, saveSubscriber, saveContactUsMessage };

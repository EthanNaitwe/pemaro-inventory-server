const { saveSubscriberEmail, isEmailSubscribed, saveMessageDetails } = require("../services/message.g.service");
const settingsService = require("../services/settings.g.service");

// Get All Settings
async function getAllSettings(req, res) {
    try {
        const settings = await settingsService.getAllSettings();
        res.status(200).json({ message: "Settings fetched successfully", settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Failed to retrieve settings" + error.message });
    }
}

// Update Settings
async function updateSetting(req, res) {
    try {
        await settingsService.updateSetting(req.body);
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

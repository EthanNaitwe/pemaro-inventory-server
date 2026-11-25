const userService = require('../services/user.g.service');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const result = await userService.loginUser(email, password);

        if (result.error) {
            return res.status(401).json({ message: result.error });
        }

        res.status(200).json({ message: "Login successful", token: result.token, user: result.user });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// Get user profile from token
exports.getProfile = async (req, res) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userService.getUserProfile(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ authUser: user });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile", error: error.message });
    }
};

/**
 * Controller to fetch all users
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const passwordService = require('../services/password.service');
const { sendError } = require('../config/http');

// POST /users/change-password  { currentPassword, newPassword }  (auth)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const { token } = await passwordService.changePassword(req.user.id, currentPassword, newPassword);
        res.status(200).json({ message: "Password changed successfully", token });
    } catch (error) {
        sendError(res, error, { fallback: "Failed to change password" });
    }
};

// POST /users/forgot-password  { email }
exports.forgotPassword = async (req, res) => {
    try {
        await passwordService.requestPasswordReset(req.body.email);
        // Same answer whether or not the account exists.
        res.status(200).json({ message: "If that email belongs to an account, a reset link has been sent." });
    } catch (error) {
        sendError(res, error, { fallback: "Failed to send reset email" });
    }
};

// POST /users/reset-password  { token, newPassword }
exports.resetPassword = async (req, res) => {
    try {
        await passwordService.resetPassword(req.body.token, req.body.newPassword);
        res.status(200).json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
        sendError(res, error, { fallback: "Failed to reset password" });
    }
};

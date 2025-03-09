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

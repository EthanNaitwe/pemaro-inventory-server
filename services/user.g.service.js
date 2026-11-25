const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file

const toPublicUser = (u) => ({
    id: u.id,
    surname: u.surname,
    other_names: u.otherNames,
    avatar: u.avatar,
    gender: u.gender,
    birth_date: u.birthDate,
    email: u.email,
    address: u.address,
    phone_number: u.phoneNumber,
    role: u.role,
    is_active: u.isActive,
});

// Function to authenticate user
async function loginUser(email, password) {
    try {
        const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
        if (!user) return { error: "Invalid credentials" };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return { error: "Invalid credentials" };

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        return { token, user: { id: user.id, email: user.email, surname: user.surname, other_names: user.otherNames } };
    } catch (error) {
        console.error("Error during login:", error);
        throw new Error("Login failed");
    }
}

// Function to fetch user profile
async function getUserProfile(userId) {
    try {
        const user = await prisma.user.findUnique({ where: { id: String(userId) } });
        return user ? toPublicUser(user) : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile");
    }
}

// Fetch all users
async function getAllUsers() {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
        return users.map(toPublicUser);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        throw new Error("Failed to retrieve users");
    }
}

module.exports = { loginUser, getUserProfile, getAllUsers };

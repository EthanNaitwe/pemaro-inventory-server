const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { DateTime } = require('luxon');
const prisma = require('../config/prisma');
const { role } = require('../config/format');

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file

const toPublicUser = (u) => ({
    id: u.id,
    surname: u.surname,
    other_names: u.otherNames,
    avatar: u.avatar,
    gender: u.gender,
    birth_date: u.birthDate ? DateTime.fromJSDate(u.birthDate, { zone: 'utc' }).toISODate() : null,
    email: u.email,
    address: u.address,
    phone_number: u.phoneNumber,
    role: role.toApi(u.role),
    is_active: u.isActive,
});

async function loginUser(email, password) {
    try {
        const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
        if (!user || !user.isActive) return { error: "Invalid credentials" };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return { error: "Invalid credentials" };

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        return { token, user: { id: user.id, email: user.email, surname: user.surname, other_names: user.otherNames } };
    } catch (error) {
        console.error("Error during login:", error);
        throw new Error("Login failed");
    }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getUserProfile(userId) {
    try {
        // Tokens issued before the UUID migration carry old ids.
        if (!UUID_RE.test(String(userId))) return null;
        const user = await prisma.user.findUnique({ where: { id: String(userId) } });
        return user ? toPublicUser(user) : null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile");
    }
}

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

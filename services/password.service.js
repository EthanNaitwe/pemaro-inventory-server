const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { sendMail } = require("../config/mailer");
const { HttpError } = require("../config/format");

const RESET_TTL_MINUTES = 30;
const MAX_RESETS_PER_WINDOW = 3; // per user
const RESET_WINDOW_MINUTES = 15;
const MIN_PASSWORD_LENGTH = 8;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

function assertStrongPassword(password) {
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    if (password.length > 72) throw new HttpError(400, "Password must be at most 72 characters"); // bcrypt limit
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        throw new HttpError(400, "Password must contain at least one letter and one number");
    }
}

const issueToken = (user) =>
    jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

/**
 * Logged-in user changes their own password. Returns a fresh token, since
 * changing the password invalidates every token issued before it.
 */
async function changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) throw new HttpError(400, "Current and new password are required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "User not found");

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        // 400, not 401: a wrong current password must not log the user out.
        throw new HttpError(400, "Current password is incorrect");
    }
    assertStrongPassword(newPassword);
    if (await bcrypt.compare(newPassword, user.password)) {
        throw new HttpError(400, "New password must be different from the current one");
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(newPassword, 10), passwordChangedAt: new Date() },
    });
    // Any outstanding reset links are no longer valid.
    await prisma.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });

    return { token: issueToken(updated) };
}

/**
 * Email a reset link. Always resolves the same way, whether or not the email
 * exists, so the endpoint can't be used to discover accounts.
 */
async function requestPasswordReset(email) {
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) throw new HttpError(400, "Email is required");

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user || !user.isActive) return;

    const since = new Date(Date.now() - RESET_WINDOW_MINUTES * 60 * 1000);
    const recent = await prisma.passwordResetToken.count({ where: { userId: user.id, createdAt: { gte: since } } });
    if (recent >= MAX_RESETS_PER_WINDOW) return; // silently rate-limited

    const token = crypto.randomBytes(32).toString("base64url");
    await prisma.$transaction([
        // Only the newest link works. Old ones are expired, not deleted, so
        // they still count towards the rate limit.
        prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }),
        prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(token),
                expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000),
            },
        }),
    ]);

    const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
    const link = `${base}/?reset_token=${encodeURIComponent(token)}`;
    const name = user.otherNames || user.surname || "there";

    await sendMail({
        to: user.email,
        subject: "Reset your password",
        text:
            `Hi ${name},\n\nSomeone (hopefully you) asked to reset your password.\n` +
            `Open this link within ${RESET_TTL_MINUTES} minutes to choose a new one:\n\n${link}\n\n` +
            "If you didn't ask for this, you can ignore this email; your password won't change.",
        html:
            `<p>Hi ${escapeHtml(name)},</p><p>Someone (hopefully you) asked to reset your password.</p>` +
            `<p><a href="${link}">Choose a new password</a> (link valid for ${RESET_TTL_MINUTES} minutes).</p>` +
            "<p>If you didn't ask for this, you can ignore this email; your password won't change.</p>",
    });
}

async function resetPassword(token, newPassword) {
    if (!token) throw new HttpError(400, "Reset token is required");
    assertStrongPassword(newPassword);

    const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash: hashToken(String(token)) },
        include: { user: true },
    });
    if (!record || record.usedAt || record.expiresAt < new Date() || !record.user.isActive) {
        throw new HttpError(400, "This reset link is invalid or has expired");
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: record.userId },
            data: { password: await bcrypt.hash(newPassword, 10), passwordChangedAt: new Date() },
        }),
        prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
        prisma.passwordResetToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: new Date() } }),
    ]);
}

const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = { changePassword, requestPasswordReset, resetPassword, MIN_PASSWORD_LENGTH };

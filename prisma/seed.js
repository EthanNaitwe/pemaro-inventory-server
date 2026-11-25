/**
 * Seed the admin user.
 *
 *   npm run db:seed
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD (+ optional ADMIN_SURNAME, ADMIN_OTHER_NAMES)
 * from .env. Safe to re-run: an existing admin is left alone unless
 * ADMIN_PASSWORD is set, in which case its password is reset to that value.
 * If ADMIN_PASSWORD is empty on first run, a random one is generated and printed once.
 */
require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function main() {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (!email) throw new Error("Set ADMIN_EMAIL in .env");

    const givenPassword = process.env.ADMIN_PASSWORD || "";
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing && !givenPassword) {
        console.log(`✔ Admin ${email} already exists; nothing changed.`);
        return;
    }

    const password = givenPassword || crypto.randomBytes(12).toString("base64url");
    const hash = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
        where: { email },
        update: { password: hash, role: "admin", isActive: true },
        create: {
            id: `USR-${Date.now()}`,
            email,
            password: hash,
            surname: process.env.ADMIN_SURNAME || "Admin",
            otherNames: process.env.ADMIN_OTHER_NAMES || null,
            role: "admin",
            isActive: true,
        },
    });

    console.log(`✔ Admin ${existing ? "password reset" : "created"}: ${email}`);
    if (!givenPassword) console.log(`  Generated password (shown once): ${password}`);
}

main()
    .catch((e) => { console.error("Seed failed:", e.message); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());

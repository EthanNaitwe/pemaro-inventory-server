/**
 * Seed reference data and the admin user.
 *
 *   npm run db:seed
 *
 * - Product categories / sub-categories and expense categories (idempotent:
 *   existing rows are kept, missing ones are added).
 * - Admin user from ADMIN_EMAIL / ADMIN_PASSWORD (+ optional ADMIN_SURNAME,
 *   ADMIN_OTHER_NAMES). An existing admin is left alone unless ADMIN_PASSWORD
 *   is set, in which case its password is reset. If ADMIN_PASSWORD is empty on
 *   first run, a random one is generated and printed once.
 */
require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const PRODUCT_CATEGORIES = {
    Foods: [
        "Break Fast", "Chips", "Rice", "Sauce", "Cakes", "Pizza", "Burgers", "Bites", "Pilao",
        "Half Chips", "Half Katogo", "Special Dishes", "Local Foods",
    ],
    Beverages: [
        "Milk Shakes", "Smoothies", "Juices", "Teas", "Herbal Teas", "Coffee", "Soft Drinks",
        "Moctails", "Cocktails", "Bottles", "Shots", "Beers", "Smokes",
    ],
};

const EXPENSE_CATEGORIES = [
    "Employee Benefits", "Entertainment", "Office Expenses & Postage", "Other Expenses", "Matooke",
    "Milk", "Water", "Fruits", "Spices", "Lemon", "Flavors", "Beef", "Goat", "Liver", "Market items",
    "Eggs", "Rice Super", "Rice Basmati",
];

async function seedCategories() {
    let added = 0;
    for (const [name, subs] of Object.entries(PRODUCT_CATEGORIES)) {
        const category = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
        const { count } = await prisma.subCategory.createMany({
            data: subs.map((sub) => ({ categoryId: category.id, name: sub })),
            skipDuplicates: true,
        });
        added += count;
    }
    const { count } = await prisma.expenseCategory.createMany({
        data: EXPENSE_CATEGORIES.map((name) => ({ name })),
        skipDuplicates: true,
    });
    console.log(`✔ Categories: ${added} sub-categories and ${count} expense categories added`);
}

async function seedAdmin() {
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
        update: { password: hash, role: "ADMIN", isActive: true },
        create: {
            email,
            password: hash,
            surname: process.env.ADMIN_SURNAME || "Admin",
            otherNames: process.env.ADMIN_OTHER_NAMES || null,
            role: "ADMIN",
            isActive: true,
        },
    });

    console.log(`✔ Admin ${existing ? "password reset" : "created"}: ${email}`);
    if (!givenPassword) console.log(`  Generated password (shown once): ${password}`);
}

seedCategories()
    .then(seedAdmin)
    .catch((e) => { console.error("Seed failed:", e.message); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());

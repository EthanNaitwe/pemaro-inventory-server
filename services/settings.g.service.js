const prisma = require("../config/prisma");

// Get all settings as a { key: value } object
async function getAllSettings() {
    const rows = await prisma.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// Upsert each key in settingData
async function updateSetting(settingData = {}) {
    const entries = Object.entries(settingData);
    await prisma.$transaction(
        entries.map(([key, value]) =>
            prisma.setting.upsert({
                where: { key },
                create: { key, value: String(value) },
                update: { value: String(value) },
            })
        )
    );
    return { updated: entries.length };
}

module.exports = { getAllSettings, updateSetting };

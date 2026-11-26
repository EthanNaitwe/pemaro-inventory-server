const prisma = require("../config/prisma");

// Settings the frontend reads (systemSettings). Used when a key isn't stored yet.
const DEFAULT_SETTINGS = {
    showAddProduct: true,
    showEditProduct: true,
    storeName: "",
    address1: "",
    address2: "",
};

// Values are stored as text; turn "true"/"false" back into booleans.
const parse = (value) => {
    const v = String(value).toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
    return value;
};

// Get all settings as a { key: value } object, defaults filled in
async function getAllSettings() {
    const rows = await prisma.setting.findMany();
    return {
        ...DEFAULT_SETTINGS,
        ...Object.fromEntries(rows.map((r) => [r.key, parse(r.value)])),
    };
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

module.exports = { getAllSettings, updateSetting, DEFAULT_SETTINGS };

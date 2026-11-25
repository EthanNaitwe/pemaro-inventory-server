// Conversions between database values and the shapes the frontend expects.
const { DateTime } = require("luxon");

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Africa/Kampala";

// Decimal (Prisma.Decimal) / null -> plain number
const money = (d) => (d === null || d === undefined ? 0 : Number(d));

// Date -> "dd/MM/yyyy" in the business timezone (the frontend compares these strings)
const displayDate = (date) =>
    date ? DateTime.fromJSDate(date).setZone(APP_TIMEZONE).toFormat("dd/MM/yyyy") : "";

// "dd/MM/yyyy" or ISO string -> Date (start of that day in the business timezone)
const parseDate = (value) => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    let dt = DateTime.fromFormat(String(value), "dd/MM/yyyy", { zone: APP_TIMEZONE });
    if (!dt.isValid) dt = DateTime.fromISO(String(value), { zone: APP_TIMEZONE });
    if (!dt.isValid) throw new Error(`Invalid date: ${value}`);
    return dt.toJSDate();
};

// Build a two-way map between enum values and the frontend's labels.
const enumMap = (pairs) => {
    const toApi = Object.fromEntries(pairs);
    const fromApi = Object.fromEntries(pairs.map(([db, api]) => [String(api).toLowerCase(), db]));
    return {
        toApi: (v) => toApi[v] ?? v,
        fromApi: (v, fallback) => {
            if (v === undefined || v === null || v === "") return fallback;
            const key = String(v).trim().toLowerCase();
            const found = fromApi[key] ?? (toApi[String(v).toUpperCase()] ? String(v).toUpperCase() : undefined);
            if (!found) throw new Error(`Invalid value "${v}"`);
            return found;
        },
        values: pairs.map(([, api]) => api),
    };
};

// The frontend checks role === "Stuff" / "Support"; keep those labels.
const role = enumMap([["ADMIN", "Admin"], ["STAFF", "Stuff"], ["SUPPORT", "Support"]]);

const paymentMethod = enumMap([
    ["CASH", "cash"],
    ["AIRTEL_MONEY", "airtel-mobile-money"],
    ["MTN_MOBILE_MONEY", "mtn-mobile-money"],
    ["VISA_CARD", "visa-card"],
    ["GLOVO", "glovo"],
]);

const saleStatus = enumMap([["COMPLETED", "Completed"], ["CANCELLED", "Cancelled"], ["REFUNDED", "Refunded"]]);
const paymentStatus = enumMap([["PAID", "Paid"], ["PARTIAL", "Partial"], ["UNPAID", "Unpaid"]]);
const expenseStatus = enumMap([["ACTIVE", "Active"], ["VOID", "Void"]]);

// Errors the client caused (bad input, missing rows) carry a status code.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

module.exports = {
    APP_TIMEZONE, money, displayDate, parseDate,
    role, paymentMethod, saleStatus, paymentStatus, expenseStatus, HttpError,
};

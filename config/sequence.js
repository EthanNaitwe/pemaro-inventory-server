// Atomic counters for human-readable codes (receipt numbers, WD/PT codes).
// One row per key in `counters`; INSERT ... ON CONFLICT increments it in a
// single statement, so concurrent requests never get the same number.

async function nextValue(db, key) {
    const [row] = await db.$queryRaw`
        INSERT INTO counters (key, value) VALUES (${key}, 1)
        ON CONFLICT (key) DO UPDATE SET value = counters.value + 1
        RETURNING value`;
    return Number(row.value);
}

const nextArtNumber = async (db) => `WD${await nextValue(db, "product_art_number")}`;
const nextExpenseRef = async (db) => `PT00${await nextValue(db, "expense_ref")}`;
const nextReceiptNo = (db) => nextValue(db, "sale_receipt_no");

module.exports = { nextValue, nextArtNumber, nextExpenseRef, nextReceiptNo };

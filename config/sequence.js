// Sequential, human-readable codes such as "WD12" (products) or "PT0012" (expenses).
// The next number is taken from the highest existing code, not the row count, so
// deletions never cause a reused code. `createWithNextCode` retries when two
// requests race for the same number (Prisma unique-violation P2002).

function nextCode(prefix, existingCodes) {
    const re = new RegExp(`^${prefix}(\\d+)$`);
    const max = existingCodes.reduce((m, code) => {
        const match = re.exec(code || "");
        return match ? Math.max(m, parseInt(match[1], 10)) : m;
    }, 0);
    return `${prefix}${max + 1}`;
}

async function createWithNextCode({ prefix, loadCodes, create, attempts = 5 }) {
    for (let i = 0; i < attempts; i++) {
        const code = nextCode(prefix, await loadCodes());
        try {
            return await create(code);
        } catch (error) {
            if (error.code !== "P2002" || i === attempts - 1) throw error;
        }
    }
}

module.exports = { nextCode, createWithNextCode };

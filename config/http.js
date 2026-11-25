// Turn service errors into HTTP responses. Errors with a .status are the
// client's fault (bad input, missing row); Prisma codes are mapped too.
const PRISMA_STATUS = {
    P2023: [400, "Invalid id"], // malformed UUID
    P2025: [404, "Not found"],
    P2002: [409, "Already exists"],
    P2003: [409, "Referenced record does not exist or is still in use"],
};

function sendError(res, error, { key = "message", fallback = "Something went wrong" } = {}) {
    if (error.status) return res.status(error.status).json({ [key]: error.message });
    const mapped = PRISMA_STATUS[error.code];
    if (mapped) return res.status(mapped[0]).json({ [key]: mapped[1] });
    console.error(error);
    return res.status(500).json({ [key]: fallback });
}

module.exports = { sendError };

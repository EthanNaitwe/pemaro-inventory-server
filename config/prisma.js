const { PrismaClient } = require("@prisma/client");

// Reuse one client across hot reloads / serverless invocations.
const prisma = globalThis.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

module.exports = prisma;

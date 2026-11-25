const prisma = require("../config/prisma");

// Categories with their sub-categories, in the shape the frontend's
// product form uses.
async function getProductCategories() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { subCategories: { orderBy: { name: "asc" } } },
    });
    return {
        categories: categories.map((c) => c.name),
        subCategories: categories.flatMap((c) =>
            c.subCategories.map((s) => ({ id: s.id, category: c.name, subcategory: s.name }))
        ),
    };
}

async function getExpenseCategories() {
    const rows = await prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });
    return rows.map((r) => r.name);
}

module.exports = { getProductCategories, getExpenseCategories };

const prisma = require("../config/prisma");

// `list` is what the frontend sends as `sheet` (e.g. "Kisyanga Subscriptions").

async function isEmailSubscribed(email, list) {
    const found = await prisma.subscriber.findUnique({
        where: { email_list: { email, list: list || "" } },
    });
    return Boolean(found);
}

async function saveSubscriberEmail(email, list) {
    await prisma.subscriber.create({ data: { email, list: list || "" } });
    return true;
}

async function saveMessageDetails(name, email, subject, message, list) {
    await prisma.contactMessage.create({ data: { name, email, subject, message, list } });
    return true;
}

module.exports = { saveSubscriberEmail, isEmailSubscribed, saveMessageDetails };

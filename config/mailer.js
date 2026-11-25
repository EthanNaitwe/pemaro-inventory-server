// Outgoing email over SMTP (Nodemailer).
// Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and MAIL_FROM.
// Without SMTP_HOST (local development) the message is printed to the
// console instead of being sent.
const nodemailer = require("nodemailer");

let transporter;
const getTransporter = () => {
    if (!process.env.SMTP_HOST) return null;
    if (!transporter) {
        const port = Number(process.env.SMTP_PORT) || 587;
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
    }
    return transporter;
};

async function sendMail({ to, subject, text, html }) {
    const t = getTransporter();
    if (!t) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("SMTP is not configured (SMTP_HOST missing)");
        }
        console.log(`\n📧 [dev mail, not sent] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
        return;
    }
    await t.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
    });
}

module.exports = { sendMail };

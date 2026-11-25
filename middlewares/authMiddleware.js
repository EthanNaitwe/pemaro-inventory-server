const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const reject = (res) => res.status(401).json({ message: 'Invalid token' });

module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    let payload;
    try {
        payload = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
        return reject(res);
    }

    try {
        // The user must still exist and be active, and the token must be newer
        // than their last password change.
        if (!UUID_RE.test(String(payload.id))) return reject(res);
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, email: true, isActive: true, passwordChangedAt: true },
        });
        if (!user || !user.isActive) return reject(res);
        if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
            return reject(res);
        }
        req.user = { id: user.id, email: user.email };
        next();
    } catch (error) {
        console.error('Auth check failed:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};

const express = require('express');
const userController = require('../controllers/user.g.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/change-password', authMiddleware, userController.changePassword);
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/', authMiddleware, userController.getAllUsers);

module.exports = router;

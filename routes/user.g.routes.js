const express = require('express');
const userController = require('../controllers/user.g.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/', userController.getAllUsers);

module.exports = router;

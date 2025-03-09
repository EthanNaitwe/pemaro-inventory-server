const express = require('express');
const userController = require('../controllers/user.g.controller');

const router = express.Router();

router.post('/login', userController.login);
router.get('/profile', userController.getProfile);

module.exports = router;

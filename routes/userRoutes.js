const express = require('express');
const { createUser, getAllUsers, loginUser } = require('../controllers');
const { validate, registerSchema, loginSchema } = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const { getProfile } = require('../controllers/user.controller');

const router = express.Router();

router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/all', authMiddleware, getAllUsers);
router.get('/profile', authMiddleware, getProfile);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

module.exports = router;

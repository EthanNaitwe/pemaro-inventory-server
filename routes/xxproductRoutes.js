const express = require('express');
const { createUser, getAllUsers, loginUser } = require('../controllers');
const { validate, registerSchema, loginSchema } = require('../middlewares/validate');

const router = express.Router();

router.post('/', validate(registerSchema), createUser);
router.get('/', validate(loginSchema), loginUser);
// router.get('/all', getAllUsers);
// router.get('/:id', userController.getUserById);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

module.exports = router;

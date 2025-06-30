const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settings.g.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { validate, emailSchema, messageSchema } = require('../middlewares/validate');

router.get('/', settingController.getAllSettings);
router.post('/subscribe', validate(emailSchema), settingController.saveSubscriber);
router.post('/message', validate(messageSchema), settingController.saveContactUsMessage);
router.put('/', settingController.updateSetting);

module.exports = router;

const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All merchant routes require authentication
router.use(authenticate);

router.post('/register', validate(schemas.merchantRegistration), merchantController.registerMerchant);
router.get('/profile', merchantController.getMerchantProfile);

module.exports = router;
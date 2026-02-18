const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All wallet routes require authentication
router.use(authenticate);

router.get('/', walletController.getWallet);
router.get('/balance', walletController.getBalance);
router.post('/topup', validate(schemas.topup), walletController.topup);

module.exports = router;
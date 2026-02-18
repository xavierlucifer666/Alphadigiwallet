const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All transaction routes require authentication
router.use(authenticate);

router.post('/transfer', validate(schemas.transfer), transactionController.transfer);
router.get('/', transactionController.getTransactions);
router.get('/:transactionId', transactionController.getTransactionById);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/transactions', adminController.getAllTransactions);
router.get('/merchants', adminController.getAllMerchants);
router.post('/merchants/:merchantId/approve', adminController.approveMerchant);
router.post('/merchants/:merchantId/reject', adminController.rejectMerchant);
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
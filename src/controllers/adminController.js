const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const { getConnection, sql } = require('../config/database');

exports.getAllUsers = async (req, res, next) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        u.user_id, u.email, u.first_name, u.last_name, u.phone, 
        u.role, u.status, u.created_at, u.last_login,
        w.wallet_id, w.balance, w.currency
      FROM Users u
      LEFT JOIN Wallets w ON u.user_id = w.user_id
      ORDER BY u.created_at DESC
    `);
    
    res.json({ users: result.recordset });
  } catch (error) {
    next(error);
  }
};

exports.getAllTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const transactions = await Transaction.getAll(limit, offset);
    
    res.json({
      transactions: transactions.map(t => ({
        transactionId: t.transaction_id,
        fromWalletId: t.from_wallet_id,
        toWalletId: t.to_wallet_id,
        amount: parseFloat(t.amount),
        type: t.type,
        status: t.status,
        reference: t.reference,
        description: t.description,
        createdAt: t.created_at
      })),
      pagination: { limit, offset }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllMerchants = async (req, res, next) => {
  try {
    const status = req.query.status;
    const merchants = await Merchant.getAll(status);
    
    res.json({ merchants });
  } catch (error) {
    next(error);
  }
};

exports.approveMerchant = async (req, res, next) => {
  try {
    const { merchantId } = req.params;
    
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    await Merchant.updateStatus(merchantId, 'active');
    
    res.json({ message: 'Merchant approved successfully' });
  } catch (error) {
    next(error);
  }
};

exports.rejectMerchant = async (req, res, next) => {
  try {
    const { merchantId } = req.params;
    
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    await Merchant.updateStatus(merchantId, 'rejected');
    
    res.json({ message: 'Merchant rejected' });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const pool = await getConnection();
    
    const stats = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Users) as totalUsers,
        (SELECT COUNT(*) FROM Wallets) as totalWallets,
        (SELECT COUNT(*) FROM Transactions) as totalTransactions,
        (SELECT COUNT(*) FROM Merchants WHERE status = 'active') as activeMerchants,
        (SELECT SUM(balance) FROM Wallets) as totalBalance
    `);
    
    res.json(stats.recordset[0]);
  } catch (error) {
    next(error);
  }
};
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const walletService = require('../services/walletService');
const logger = require('../config/logger');

exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.json({
      walletId: wallet.wallet_id,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency,
      status: wallet.status
    });
  } catch (error) {
    next(error);
  }
};

exports.getBalance = async (req, res, next) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    const balance = await Wallet.getBalance(wallet.wallet_id);
    
    res.json({
      balance: parseFloat(balance),
      currency: wallet.currency
    });
  } catch (error) {
    next(error);
  }
};

exports.topup = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const wallet = await Wallet.findByUserId(req.user.userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Simulate PSP topup
    const result = await walletService.processTopup(wallet.wallet_id, amount, paymentMethod);
    
    logger.info(`Topup processed: ${amount} for user ${req.user.userId}`);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};
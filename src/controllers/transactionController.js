const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const transactionService = require('../services/transactionService');
const logger = require('../config/logger');

exports.transfer = async (req, res, next) => {
  try {
    const { toWalletId, amount, description } = req.body;
    
    // Get sender wallet
    const fromWallet = await Wallet.findByUserId(req.user.userId);
    if (!fromWallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Verify recipient wallet exists
    const toWallet = await Wallet.findById(toWalletId);
    if (!toWallet) {
      return res.status(404).json({ error: 'Recipient wallet not found' });
    }
    
    // Check if trying to transfer to self
    if (fromWallet.wallet_id === toWalletId) {
      return res.status(400).json({ error: 'Cannot transfer to your own wallet' });
    }
    
    // Process transfer
    const result = await transactionService.processTransfer({
      fromWalletId: fromWallet.wallet_id,
      toWalletId,
      amount,
      description
    });
    
    logger.info(`Transfer completed: ${amount} from ${fromWallet.wallet_id} to ${toWalletId}`);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const wallet = await Wallet.findByUserId(req.user.userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await Transaction.getByWalletId(wallet.wallet_id, limit);
    
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
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Verify user owns this transaction
    const wallet = await Wallet.findByUserId(req.user.userId);
    if (transaction.from_wallet_id !== wallet.wallet_id && 
        transaction.to_wallet_id !== wallet.wallet_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({
      transactionId: transaction.transaction_id,
      fromWalletId: transaction.from_wallet_id,
      toWalletId: transaction.to_wallet_id,
      amount: parseFloat(transaction.amount),
      type: transaction.type,
      status: transaction.status,
      reference: transaction.reference,
      description: transaction.description,
      createdAt: transaction.created_at
    });
  } catch (error) {
    next(error);
  }
};
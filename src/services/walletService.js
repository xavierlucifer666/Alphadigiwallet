const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const pspSimulator = require('./pspSimulator');
const { v4: uuidv4 } = require('uuid');

exports.processTopup = async (walletId, amount, paymentMethod) => {
  try {
    // Simulate PSP payment processing
    const pspResult = await pspSimulator.processPayment({
      amount,
      paymentMethod,
      currency: 'USD'
    });
    
    if (!pspResult.success) {
      throw new Error('Payment processing failed');
    }
    
    // Create transaction record
    const transaction = await Transaction.create({
      fromWalletId: null,
      toWalletId: walletId,
      amount,
      type: 'topup',
      status: 'pending',
      reference: pspResult.referenceId,
      description: `Topup via ${paymentMethod}`
    });
    
    // Update wallet balance
    const newBalance = await Wallet.updateBalance(walletId, amount, 'credit');
    
    // Update transaction status
    await Transaction.updateStatus(transaction.transaction_id, 'completed');
    
    return {
      success: true,
      transactionId: transaction.transaction_id,
      amount: parseFloat(amount),
      newBalance: parseFloat(newBalance),
      reference: pspResult.referenceId
    };
  } catch (error) {
    if (transaction) {
      await Transaction.updateStatus(transaction.transaction_id, 'failed', error.message);
    }
    throw error;
  }
};
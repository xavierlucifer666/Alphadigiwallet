const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

exports.processTransfer = async ({ fromWalletId, toWalletId, amount, description }) => {
  let transaction;
  
  try {
    // Create transaction record
    transaction = await Transaction.create({
      fromWalletId,
      toWalletId,
      amount,
      type: 'transfer',
      status: 'pending',
      reference: uuidv4(),
      description: description || 'Wallet transfer'
    });
    
    // Check sender balance
    const senderBalance = await Wallet.getBalance(fromWalletId);
    if (parseFloat(senderBalance) < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }
    
    // Debit sender
    await Wallet.updateBalance(fromWalletId, amount, 'debit');
    
    // Credit recipient
    await Wallet.updateBalance(toWalletId, amount, 'credit');
    
    // Update transaction status
    await Transaction.updateStatus(transaction.transaction_id, 'completed');
    
    // Get updated balances
    const newSenderBalance = await Wallet.getBalance(fromWalletId);
    const newRecipientBalance = await Wallet.getBalance(toWalletId);
    
    return {
      success: true,
      transactionId: transaction.transaction_id,
      amount: parseFloat(amount),
      senderBalance: parseFloat(newSenderBalance),
      recipientBalance: parseFloat(newRecipientBalance),
      reference: transaction.reference
    };
  } catch (error) {
    if (transaction) {
      await Transaction.updateStatus(transaction.transaction_id, 'failed', error.message);
    }
    throw error;
  }
};
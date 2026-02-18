const { getConnection, sql } = require('../config/database');

class Transaction {
  static async create({
    fromWalletId,
    toWalletId,
    amount,
    type,
    status = 'pending',
    reference,
    description
  }) {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('fromWalletId', sql.UniqueIdentifier, fromWalletId)
      .input('toWalletId', sql.UniqueIdentifier, toWalletId)
      .input('amount', sql.Decimal(18, 2), amount)
      .input('type', sql.VarChar, type)
      .input('status', sql.VarChar, status)
      .input('reference', sql.VarChar, reference)
      .input('description', sql.VarChar, description)
      .query(`
        INSERT INTO Transactions (from_wallet_id, to_wallet_id, amount, type, status, reference, description)
        OUTPUT INSERTED.*
        VALUES (@fromWalletId, @toWalletId, @amount, @type, @status, @reference, @description)
      `);
    
    return result.recordset[0];
  }

  static async findById(transactionId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('transactionId', sql.UniqueIdentifier, transactionId)
      .query('SELECT * FROM Transactions WHERE transaction_id = @transactionId');
    
    return result.recordset[0];
  }

  static async updateStatus(transactionId, status, errorMessage = null) {
    const pool = await getConnection();
    
    await pool.request()
      .input('transactionId', sql.UniqueIdentifier, transactionId)
      .input('status', sql.VarChar, status)
      .input('errorMessage', sql.VarChar, errorMessage)
      .query(`
        UPDATE Transactions 
        SET status = @status, 
            error_message = @errorMessage,
            updated_at = GETDATE()
        WHERE transaction_id = @transactionId
      `);
  }

  static async getByWalletId(walletId, limit = 50) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('walletId', sql.UniqueIdentifier, walletId)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit) * FROM Transactions 
        WHERE from_wallet_id = @walletId OR to_wallet_id = @walletId
        ORDER BY created_at DESC
      `);
    
    return result.recordset;
  }

  static async getAll(limit = 100, offset = 0) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT * FROM Transactions 
        ORDER BY created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);
    
    return result.recordset;
  }
}

module.exports = Transaction;
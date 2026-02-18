const { getConnection, sql } = require('../config/database');

class Wallet {
  static async create(userId, currency = 'USD') {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('currency', sql.VarChar, currency)
      .query(`
        INSERT INTO Wallets (user_id, balance, currency, status)
        OUTPUT INSERTED.*
        VALUES (@userId, 0.00, @currency, 'active')
      `);
    
    return result.recordset[0];
  }

  static async findByUserId(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT * FROM Wallets WHERE user_id = @userId');
    
    return result.recordset[0];
  }

  static async findById(walletId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('walletId', sql.UniqueIdentifier, walletId)
      .query('SELECT * FROM Wallets WHERE wallet_id = @walletId');
    
    return result.recordset[0];
  }

  static async updateBalance(walletId, amount, operation = 'credit') {
    const pool = await getConnection();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();
      
      // Get current balance with lock
      const balanceResult = await transaction.request()
        .input('walletId', sql.UniqueIdentifier, walletId)
        .query('SELECT balance FROM Wallets WITH (UPDLOCK) WHERE wallet_id = @walletId');
      
      const currentBalance = balanceResult.recordset[0].balance;
      const newBalance = operation === 'credit' 
        ? parseFloat(currentBalance) + parseFloat(amount)
        : parseFloat(currentBalance) - parseFloat(amount);
      
      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }
      
      // Update balance
      await transaction.request()
        .input('walletId', sql.UniqueIdentifier, walletId)
        .input('newBalance', sql.Decimal(18, 2), newBalance)
        .query('UPDATE Wallets SET balance = @newBalance, updated_at = GETDATE() WHERE wallet_id = @walletId');
      
      await transaction.commit();
      return newBalance;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async getBalance(walletId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('walletId', sql.UniqueIdentifier, walletId)
      .query('SELECT balance FROM Wallets WHERE wallet_id = @walletId');
    
    return result.recordset[0]?.balance || 0;
  }
}

module.exports = Wallet;
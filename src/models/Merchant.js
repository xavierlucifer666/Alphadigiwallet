const { getConnection, sql } = require('../config/database');

class Merchant {
  static async create({
    userId,
    businessName,
    businessType,
    registrationNumber,
    contactEmail,
    contactPhone
  }) {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('businessName', sql.VarChar, businessName)
      .input('businessType', sql.VarChar, businessType)
      .input('registrationNumber', sql.VarChar, registrationNumber)
      .input('contactEmail', sql.VarChar, contactEmail)
      .input('contactPhone', sql.VarChar, contactPhone)
      .query(`
        INSERT INTO Merchants (user_id, business_name, business_type, registration_number, 
                               contact_email, contact_phone, status)
        OUTPUT INSERTED.*
        VALUES (@userId, @businessName, @businessType, @registrationNumber, 
                @contactEmail, @contactPhone, 'pending')
      `);
    
    return result.recordset[0];
  }

  static async findByUserId(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT * FROM Merchants WHERE user_id = @userId');
    
    return result.recordset[0];
  }

  static async findById(merchantId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('merchantId', sql.UniqueIdentifier, merchantId)
      .query('SELECT * FROM Merchants WHERE merchant_id = @merchantId');
    
    return result.recordset[0];
  }

  static async updateStatus(merchantId, status) {
    const pool = await getConnection();
    
    await pool.request()
      .input('merchantId', sql.UniqueIdentifier, merchantId)
      .input('status', sql.VarChar, status)
      .query(`
        UPDATE Merchants 
        SET status = @status, updated_at = GETDATE()
        WHERE merchant_id = @merchantId
      `);
  }

  static async getAll(status = null) {
    const pool = await getConnection();
    
    let query = 'SELECT * FROM Merchants';
    if (status) {
      query += ' WHERE status = @status';
    }
    query += ' ORDER BY created_at DESC';
    
    const request = pool.request();
    if (status) {
      request.input('status', sql.VarChar, status);
    }
    
    const result = await request.query(query);
    return result.recordset;
  }
}

module.exports = Merchant;
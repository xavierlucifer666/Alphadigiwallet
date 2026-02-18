const { getConnection, sql } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, firstName, lastName, phone }) {
    const pool = await getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .input('firstName', sql.VarChar, firstName)
      .input('lastName', sql.VarChar, lastName)
      .input('phone', sql.VarChar, phone)
      .query(`
        INSERT INTO Users (email, password, first_name, last_name, phone, role, status)
        OUTPUT INSERTED.*
        VALUES (@email, @password, @firstName, @lastName, @phone, 'user', 'active')
      `);
    
    return result.recordset[0];
  }

  static async findByEmail(email) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');
    
    return result.recordset[0];
  }

  static async findById(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT * FROM Users WHERE user_id = @userId');
    
    return result.recordset[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId) {
    const pool = await getConnection();
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('UPDATE Users SET last_login = GETDATE() WHERE user_id = @userId');
  }
}

module.exports = User;
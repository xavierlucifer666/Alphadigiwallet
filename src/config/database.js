const sql = require('mssql');
const logger = require('./logger');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    // instanceName: process.env.DB_INSTANCE, // 🔥 MUST ADD THIS by chat GPT
    encrypt: false,                          // Change to false for local
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      logger.info('✅ SQL Server connection established');
    }
    return pool;
  } catch (err) {
    logger.error('❌ Database connection error:', err);
    throw err;
  }
}

module.exports = { getConnection, sql };
const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');
const logger = require('../utils/logger');

async function initializeDatabase() {
  try {
    logger.info('Initializing database...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    logger.info('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  require('dotenv').config();
  initializeDatabase();
}

module.exports = initializeDatabase;

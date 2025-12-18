require('dotenv').config();

module.exports = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    env: process.env.PLAID_ENV || 'sandbox',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  server: {
    port: process.env.PORT || 3000,
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    jwtSecret: process.env.JWT_SECRET,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

require('dotenv').config();
const logger = require('./utils/logger');
const { startServer } = require('./api/server');
const TelegramBot = require('./bot');

async function main() {
  try {
    logger.info('Starting Telegram Plaid Bot...');

    // Validate required environment variables
    const requiredEnvVars = [
      'TELEGRAM_BOT_TOKEN',
      'PLAID_CLIENT_ID',
      'PLAID_SECRET',
      'DATABASE_URL',
      'ENCRYPTION_KEY',
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      process.exit(1);
    }

    // Validate encryption key length
    if (process.env.ENCRYPTION_KEY.length !== 32) {
      logger.error('ENCRYPTION_KEY must be exactly 32 characters');
      process.exit(1);
    }

    // Start Express server
    const server = await startServer();
    logger.info('Express server started');

    // Start Telegram bot
    const bot = new TelegramBot();
    await bot.start();
    logger.info('Telegram bot started');

    logger.info('🚀 Application started successfully!');

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} signal received: closing application`);
      
      try {
        // Close server
        if (server) {
          await new Promise((resolve) => server.close(resolve));
          logger.info('Express server closed');
        }

        // Bot is already handling graceful stop
        
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

main();

const { Telegraf } = require('telegraf');
const config = require('../config');
const logger = require('../utils/logger');

// Middleware
const authMiddleware = require('./middleware/auth');

// Commands
const startCommand = require('./commands/start');
const linkCommand = require('./commands/link');
const balanceCommand = require('./commands/balance');
const transactionsCommand = require('./commands/transactions');
const helpCommand = require('./commands/help');
const stripeBalanceCommand = require('./commands/stripe_balance');

class TelegramBot {
  constructor() {
    if (!config.telegram.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }

    this.bot = new Telegraf(config.telegram.botToken);
    this.setupMiddleware();
    this.setupCommands();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Apply auth middleware to all commands
    this.bot.use(authMiddleware);
  }

  setupCommands() {
    // Command handlers
    this.bot.command('start', startCommand);
    this.bot.command('link', linkCommand);
    this.bot.command('balance', balanceCommand);
    this.bot.command('transactions', transactionsCommand);
    this.bot.command('help', helpCommand);
    this.bot.command('stripe_balance', stripeBalanceCommand);

    // Keyboard button handlers
    this.bot.hears('💳 Link Account', linkCommand);
    this.bot.hears('💰 Balance', balanceCommand);
    this.bot.hears('📊 Transactions', transactionsCommand);
    this.bot.hears('❓ Help', helpCommand);

    // Default message handler
    this.bot.on('text', async (ctx) => {
      await ctx.reply(
        'I didn\'t understand that command. Use /help to see available commands.'
      );
    });
  }

  setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      logger.error('Bot error:', err);
      ctx.reply('An error occurred. Please try again later.');
    });
  }

  async start() {
    try {
      await this.bot.launch();
      logger.info('Telegram bot started successfully');
      
      // Enable graceful stop
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));
    } catch (error) {
      logger.error('Failed to start Telegram bot:', error);
      throw error;
    }
  }

  async stop(signal) {
    logger.info(`${signal} signal received: closing bot`);
    this.bot.stop(signal);
  }
}

module.exports = TelegramBot;

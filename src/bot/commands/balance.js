const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');

const balanceCommand = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    
    await ctx.reply('🔄 Fetching your account balances...');

    // Call API to get accounts
    const response = await axios.get(
      `${config.server.apiBaseUrl}/api/plaid/accounts/${telegramId}`
    );

    const { accounts } = response.data;

    if (!accounts || accounts.length === 0) {
      await ctx.reply(
        '📭 No bank accounts connected yet.\n\nUse /link to connect your bank account.'
      );
      return;
    }

    let message = '💰 *Your Account Balances:*\n\n';

    accounts.forEach((account, index) => {
      const balance = account.balance !== null ? `$${account.balance.toFixed(2)}` : 'N/A';
      const available = account.available !== null ? `$${account.available.toFixed(2)}` : 'N/A';
      
      message += `${index + 1}. *${account.name}*\n`;
      message += `   Institution: ${account.institution}\n`;
      message += `   Type: ${account.type}${account.subtype ? ` (${account.subtype})` : ''}\n`;
      message += `   Current Balance: ${balance}\n`;
      message += `   Available: ${available}\n\n`;
    });

    await ctx.replyWithMarkdown(message);
    
    logger.info(`Balance fetched for user ${telegramId}`);
  } catch (error) {
    logger.error('Error in balance command:', error);
    
    if (error.response?.status === 404) {
      await ctx.reply('❌ User not found. Please use /start first.');
    } else {
      await ctx.reply('❌ Failed to fetch balances. Please try again later.');
    }
  }
};

module.exports = balanceCommand;

const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');

const stripeBalanceCommand = async (ctx) => {
  try {
    await ctx.reply('🔄 Fetching your Stripe balance...');

    // Call API to get Stripe balance
    const response = await axios.get(
      `${config.server.apiBaseUrl}/api/stripe/balance`
    );

    const { balance } = response.data;

    if (!balance) {
      await ctx.reply('❌ Unable to retrieve Stripe balance.');
      return;
    }

    let message = '💰 *Your Stripe Balance:*\n\n';

    if (balance.available && balance.available.length > 0) {
      message += '*Available:*\n';
      balance.available.forEach((item) => {
        const amount = (item.amount / 100).toFixed(2);
        message += `  ${item.currency.toUpperCase()}: ${amount}\n`;
      });
      message += '\n';
    }

    if (balance.pending && balance.pending.length > 0) {
      message += '*Pending:*\n';
      balance.pending.forEach((item) => {
        const amount = (item.amount / 100).toFixed(2);
        message += `  ${item.currency.toUpperCase()}: ${amount}\n`;
      });
      message += '\n';
    }

    message += `Mode: ${balance.livemode ? 'Live' : 'Test'}`;

    await ctx.replyWithMarkdown(message);
    
    logger.info(`Stripe balance fetched for user ${ctx.from.id}`);
  } catch (error) {
    logger.error('Error in stripe_balance command:', error);
    
    if (error.response?.data?.message) {
      await ctx.reply(`❌ ${error.response.data.message}`);
    } else {
      await ctx.reply('❌ Failed to fetch Stripe balance. Please ensure Stripe is configured correctly.');
    }
  }
};

module.exports = stripeBalanceCommand;

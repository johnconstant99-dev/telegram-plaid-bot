const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');

const transactionsCommand = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    
    await ctx.reply('🔄 Fetching your recent transactions...');

    // Default to last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Call API to get transactions
    const response = await axios.get(
      `${config.server.apiBaseUrl}/api/plaid/transactions/${telegramId}`,
      {
        params: {
          start_date: startDateStr,
          end_date: endDate,
        }
      }
    );

    const { transactions } = response.data;

    if (!transactions || transactions.length === 0) {
      await ctx.reply(
        '📭 No transactions found.\n\nMake sure you have connected a bank account with /link'
      );
      return;
    }

    // Limit to 10 most recent transactions for display
    const recentTransactions = transactions.slice(0, 10);

    let message = '📊 *Recent Transactions (Last 30 Days):*\n\n';

    recentTransactions.forEach((txn, index) => {
      const amount = txn.amount > 0 
        ? `-$${txn.amount.toFixed(2)}` // Positive amounts are debits
        : `+$${Math.abs(txn.amount).toFixed(2)}`; // Negative amounts are credits
      
      message += `${index + 1}. *${txn.name}*\n`;
      message += `   Amount: ${amount}\n`;
      message += `   Date: ${txn.date}\n`;
      message += `   Institution: ${txn.institution}\n`;
      if (txn.pending) {
        message += `   Status: ⏳ Pending\n`;
      }
      message += '\n';
    });

    if (transactions.length > 10) {
      message += `_Showing 10 of ${transactions.length} transactions_`;
    }

    await ctx.replyWithMarkdown(message);
    
    logger.info(`Transactions fetched for user ${telegramId}`);
  } catch (error) {
    logger.error('Error in transactions command:', error);
    
    if (error.response?.status === 404) {
      await ctx.reply('❌ User not found. Please use /start first.');
    } else {
      await ctx.reply('❌ Failed to fetch transactions. Please try again later.');
    }
  }
};

module.exports = transactionsCommand;

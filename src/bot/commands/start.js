const { Markup } = require('telegraf');

const startCommand = async (ctx) => {
  const firstName = ctx.from.first_name || 'there';
  
  const welcomeMessage = `
👋 Welcome to the Telegram Plaid Bot, ${firstName}!

I help you connect your bank accounts and view your financial information securely.

🔐 Your data is encrypted and stored safely.

Available commands:
/link - Connect your bank account
/balance - View account balances
/transactions - View recent transactions
/help - Show help information

Get started by connecting your bank account with /link
  `.trim();

  await ctx.reply(
    welcomeMessage,
    Markup.keyboard([
      ['💳 Link Account', '💰 Balance'],
      ['📊 Transactions', '❓ Help']
    ])
    .resize()
  );
};

module.exports = startCommand;

const helpCommand = async (ctx) => {
  const helpMessage = `
ℹ️ *Telegram Plaid Bot - Help*

*Available Commands:*

/start - Welcome message and setup
/link - Connect your bank account via Plaid
/balance - View all your account balances
/transactions - View recent transactions (last 30 days)
/stripe_balance - View your Stripe account balance
/help - Show this help message

*How to Use:*

1️⃣ Start by using /start to initialize the bot
2️⃣ Use /link to connect your bank account
3️⃣ Complete the Plaid Link authentication flow
4️⃣ View your /balance and /transactions anytime
5️⃣ Use /stripe_balance to check your Stripe account balance

*Security:*
🔐 All tokens are encrypted using AES-256-GCM
🔒 Your credentials are never stored
✅ Plaid uses bank-level security

*Sandbox Testing:*
For testing, use these credentials:
- Institution: First Platypus Bank
- Username: user_good
- Password: pass_good

*Support:*
If you encounter any issues, please contact support.

*Privacy:*
We only store necessary data to provide the service.
Your bank credentials are never stored.
  `.trim();

  await ctx.replyWithMarkdown(helpMessage);
};

module.exports = helpCommand;

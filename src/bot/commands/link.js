const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');

const linkCommand = async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    
    await ctx.reply('🔄 Generating your bank linking URL...');

    // Call API to create link token
    const response = await axios.post(
      `${config.server.apiBaseUrl}/api/plaid/create-link-token`,
      { telegram_id: telegramId }
    );

    const { link_token } = response.data;

    // In production, you would use Plaid Link web/mobile flow
    // For this implementation, we'll provide instructions
    const message = `
🔗 To connect your bank account:

1. Go to Plaid Link (in a real implementation, this would be a web interface)
2. Use this link token: \`${link_token}\`
3. Complete the bank authentication
4. You'll receive a public token
5. Use /exchange command with the public token

Note: In a production environment, this would be a seamless web-based flow.

For testing in Plaid Sandbox:
- Use institution "First Platypus Bank"
- Username: user_good
- Password: pass_good

Once you complete the Plaid Link flow and get a public_token, send it back to the bot.
    `.trim();

    await ctx.replyWithMarkdown(message);
    
    logger.info(`Link token created for user ${telegramId}`);
  } catch (error) {
    logger.error('Error in link command:', error);
    await ctx.reply('❌ Failed to create link token. Please try again later.');
  }
};

module.exports = linkCommand;

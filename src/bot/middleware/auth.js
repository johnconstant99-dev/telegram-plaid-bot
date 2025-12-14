const userService = require('../../services/userService');
const logger = require('../../utils/logger');

const authMiddleware = async (ctx, next) => {
  try {
    const telegramUser = ctx.from;
    
    if (!telegramUser) {
      return ctx.reply('Authentication failed. Please try again.');
    }

    // Create or update user
    const user = await userService.findOrCreateUser(telegramUser);
    
    // Attach user to context
    ctx.state.user = user;
    
    logger.info(`User authenticated: ${telegramUser.id} (${telegramUser.username})`);
    
    await next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    ctx.reply('An error occurred. Please try again later.');
  }
};

module.exports = authMiddleware;

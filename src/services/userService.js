const User = require('../models/User');
const logger = require('../utils/logger');

class UserService {
  async findOrCreateUser(telegramUser) {
    try {
      const { id: telegram_id, username, first_name, last_name } = telegramUser;
      
      let user = await User.findByTelegramId(telegram_id);
      
      if (!user) {
        logger.info(`Creating new user: ${telegram_id}`);
        user = await User.create({
          telegram_id,
          username,
          first_name,
          last_name,
        });
      } else {
        // Update user info if changed
        await User.update(telegram_id, {
          username,
          first_name,
          last_name,
        });
        user = await User.findByTelegramId(telegram_id);
      }
      
      return user;
    } catch (error) {
      logger.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  async getUserByTelegramId(telegramId) {
    return await User.findByTelegramId(telegramId);
  }

  async updateUser(telegramId, data) {
    return await User.update(telegramId, data);
  }
}

module.exports = new UserService();

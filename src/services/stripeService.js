const stripe = require('stripe');
const config = require('../config');
const logger = require('../utils/logger');

class StripeService {
  constructor() {
    if (!config.stripe.secretKey) {
      logger.warn('Stripe secret key not configured');
      this.client = null;
    } else {
      // Set your secret key. Remember to switch to your live secret key in production.
      // See your keys here: https://dashboard.stripe.com/apikeys
      this.client = stripe(config.stripe.secretKey);
    }
  }

  async getBalance(context) {
    try {
      if (!this.client) {
        throw new Error('Stripe client not initialized. Please configure STRIPE_SECRET_KEY.');
      }

      logger.info('Retrieving Stripe balance');
      
      // Retrieve balance with optional context
      const stripeAccount = context || config.stripe.context;
      const options = stripeAccount ? { stripeAccount } : {};
      const balance = await this.client.balance.retrieve(options);
      
      return {
        success: true,
        balance: {
          available: balance.available,
          pending: balance.pending,
          livemode: balance.livemode,
        },
      };
    } catch (error) {
      logger.error('Error retrieving Stripe balance:', error);
      throw new Error(`Failed to retrieve balance: ${error.message}`);
    }
  }
}

module.exports = new StripeService();

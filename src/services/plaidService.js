const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const config = require('../config');
const logger = require('../utils/logger');
const User = require('../models/User');
const PlaidConnection = require('../models/PlaidConnection');
const { PlaidError } = require('../utils/errorHandler');

class PlaidService {
  constructor() {
    const configuration = new Configuration({
      basePath: PlaidEnvironments[config.plaid.env],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': config.plaid.clientId,
          'PLAID-SECRET': config.plaid.secret,
        },
      },
    });

    this.client = new PlaidApi(configuration);
  }

  async createLinkToken(telegramId) {
    try {
      const user = await User.findByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }

      const request = {
        user: {
          client_user_id: user.id.toString(),
        },
        client_name: 'Telegram Plaid Bot',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
      };

      logger.info(`Creating link token for telegram_id: ${telegramId}`);
      const response = await this.client.linkTokenCreate(request);
      
      return {
        link_token: response.data.link_token,
        expiration: response.data.expiration,
      };
    } catch (error) {
      logger.error('Error creating link token:', error);
      throw new PlaidError('Failed to create link token', error.response?.data?.error_code);
    }
  }

  async exchangePublicToken(publicToken, telegramId) {
    try {
      const user = await User.findByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`Exchanging public token for telegram_id: ${telegramId}`);
      const response = await this.client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const { access_token, item_id } = response.data;

      // Get institution info
      const itemResponse = await this.client.itemGet({
        access_token,
      });

      const institutionId = itemResponse.data.item.institution_id;
      
      let institutionName = 'Unknown';
      if (institutionId) {
        try {
          const instResponse = await this.client.institutionsGetById({
            institution_id: institutionId,
            country_codes: ['US'],
          });
          institutionName = instResponse.data.institution.name;
        } catch (error) {
          logger.error('Error fetching institution name:', error);
        }
      }

      // Store connection
      await PlaidConnection.create({
        user_id: user.id,
        access_token,
        item_id,
        institution_name: institutionName,
        institution_id: institutionId,
      });

      return {
        success: true,
        institution_name: institutionName,
      };
    } catch (error) {
      logger.error('Error exchanging public token:', error);
      throw new PlaidError('Failed to exchange token', error.response?.data?.error_code);
    }
  }

  async getAccounts(telegramId) {
    try {
      const user = await User.findByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }

      const connections = await PlaidConnection.getAllByUserId(user.id);
      
      if (connections.length === 0) {
        return { accounts: [] };
      }

      const allAccounts = [];

      for (const connection of connections) {
        try {
          const response = await this.client.accountsBalanceGet({
            access_token: connection.access_token,
          });

          const accounts = response.data.accounts.map(account => ({
            name: account.name,
            official_name: account.official_name,
            balance: account.balances.current,
            available: account.balances.available,
            type: account.type,
            subtype: account.subtype,
            institution: connection.institution_name,
          }));

          allAccounts.push(...accounts);
        } catch (error) {
          logger.error(`Error fetching accounts for item ${connection.item_id}:`, error);
          if (error.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
            // Item needs to be re-linked
            continue;
          }
        }
      }

      return { accounts: allAccounts };
    } catch (error) {
      logger.error('Error getting accounts:', error);
      throw new PlaidError('Failed to fetch accounts', error.response?.data?.error_code);
    }
  }

  async getTransactions(telegramId, startDate, endDate) {
    try {
      const user = await User.findByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }

      const connections = await PlaidConnection.getAllByUserId(user.id);
      
      if (connections.length === 0) {
        return { transactions: [] };
      }

      // Default to last 30 days
      if (!startDate) {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        startDate = date.toISOString().split('T')[0];
      }
      
      if (!endDate) {
        endDate = new Date().toISOString().split('T')[0];
      }

      const allTransactions = [];

      for (const connection of connections) {
        try {
          const response = await this.client.transactionsGet({
            access_token: connection.access_token,
            start_date: startDate,
            end_date: endDate,
          });

          const transactions = response.data.transactions.map(txn => ({
            transaction_id: txn.transaction_id,
            name: txn.name,
            amount: txn.amount,
            date: txn.date,
            category: txn.category,
            pending: txn.pending,
            institution: connection.institution_name,
          }));

          allTransactions.push(...transactions);
        } catch (error) {
          logger.error(`Error fetching transactions for item ${connection.item_id}:`, error);
          if (error.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
            continue;
          }
        }
      }

      // Sort by date, newest first
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      return { transactions: allTransactions };
    } catch (error) {
      logger.error('Error getting transactions:', error);
      throw new PlaidError('Failed to fetch transactions', error.response?.data?.error_code);
    }
  }

  async handleWebhook(webhookData) {
    try {
      const { webhook_type, webhook_code, item_id } = webhookData;
      
      logger.info(`Received webhook: ${webhook_type} - ${webhook_code} for item ${item_id}`);

      // Handle different webhook types
      switch (webhook_type) {
        case 'TRANSACTIONS':
          if (webhook_code === 'INITIAL_UPDATE' || webhook_code === 'HISTORICAL_UPDATE' || webhook_code === 'DEFAULT_UPDATE') {
            // Transactions are ready to fetch
            logger.info(`Transactions ready for item ${item_id}`);
          }
          break;
        
        case 'ITEM':
          if (webhook_code === 'ERROR') {
            logger.error(`Item error for ${item_id}:`, webhookData.error);
          }
          break;
        
        default:
          logger.info(`Unhandled webhook type: ${webhook_type}`);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling webhook:', error);
      throw error;
    }
  }
}

module.exports = new PlaidService();

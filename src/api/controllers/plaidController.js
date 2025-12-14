const plaidService = require('../services/plaidService');
const { asyncHandler } = require('../utils/errorHandler');

const createLinkToken = asyncHandler(async (req, res) => {
  const { telegram_id } = req.body;

  if (!telegram_id) {
    return res.status(400).json({
      success: false,
      message: 'telegram_id is required',
    });
  }

  const result = await plaidService.createLinkToken(telegram_id);
  
  res.json({
    success: true,
    ...result,
  });
});

const exchangeToken = asyncHandler(async (req, res) => {
  const { public_token, telegram_id } = req.body;

  if (!public_token || !telegram_id) {
    return res.status(400).json({
      success: false,
      message: 'public_token and telegram_id are required',
    });
  }

  const result = await plaidService.exchangePublicToken(public_token, telegram_id);
  
  res.json(result);
});

const getAccounts = asyncHandler(async (req, res) => {
  const { telegram_id } = req.params;

  if (!telegram_id) {
    return res.status(400).json({
      success: false,
      message: 'telegram_id is required',
    });
  }

  const result = await plaidService.getAccounts(parseInt(telegram_id));
  
  res.json({
    success: true,
    ...result,
  });
});

const getTransactions = asyncHandler(async (req, res) => {
  const { telegram_id } = req.params;
  const { start_date, end_date } = req.query;

  if (!telegram_id) {
    return res.status(400).json({
      success: false,
      message: 'telegram_id is required',
    });
  }

  const result = await plaidService.getTransactions(
    parseInt(telegram_id),
    start_date,
    end_date
  );
  
  res.json({
    success: true,
    ...result,
  });
});

module.exports = {
  createLinkToken,
  exchangeToken,
  getAccounts,
  getTransactions,
};

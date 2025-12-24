const stripeService = require('../../services/stripeService');
const { asyncHandler } = require('../../utils/errorHandler');

const getBalance = asyncHandler(async (req, res) => {
  const { context } = req.query;

  const result = await stripeService.getBalance(context);
  
  res.json(result);
});

module.exports = {
  getBalance,
};

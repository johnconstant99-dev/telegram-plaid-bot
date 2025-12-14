const plaidService = require('../services/plaidService');
const { asyncHandler } = require('../utils/errorHandler');

const handleWebhook = asyncHandler(async (req, res) => {
  const webhookData = req.body;
  
  await plaidService.handleWebhook(webhookData);
  
  res.json({ received: true });
});

module.exports = {
  handleWebhook,
};

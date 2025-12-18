const express = require('express');
const router = express.Router();
const plaidController = require('../controllers/plaidController');

router.post('/create-link-token', plaidController.createLinkToken);
router.post('/exchange-token', plaidController.exchangeToken);
router.get('/accounts/:telegram_id', plaidController.getAccounts);
router.get('/transactions/:telegram_id', plaidController.getTransactions);

module.exports = router;

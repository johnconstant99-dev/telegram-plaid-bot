const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/plaid', webhookController.handleWebhook);

module.exports = router;

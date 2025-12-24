const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

router.get('/balance', stripeController.getBalance);

module.exports = router;

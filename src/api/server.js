const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');
const { errorHandler } = require('../utils/errorHandler');

const plaidRoutes = require('./routes/plaid');
const webhookRoutes = require('./routes/webhook');
const stripeRoutes = require('./routes/stripe');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/plaid', plaidRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/stripe', stripeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

function startServer() {
  const PORT = config.server.port;
  
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, (err) => {
      if (err) {
        logger.error('Failed to start server:', err);
        reject(err);
      } else {
        logger.info(`Server running on port ${PORT}`);
        resolve(server);
      }
    });
  });
}

module.exports = { app, startServer };

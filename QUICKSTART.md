# Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL
- Telegram Bot Token (from BotFather)
- Plaid API credentials
- dotenvx installed globally or via npm

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/johnconstant99-dev/telegram-plaid-bot.git
cd telegram-plaid-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

**For Local Development:**
```bash
cp .env.example .env
# Edit .env with your development values
nano .env
```

**For Production/Staging:**
```bash
# Generate encryption keys
npm run env:keygen

# Create encrypted production environment
dotenvx set TELEGRAM_BOT_TOKEN "your_token" -f .env.production
dotenvx set PLAID_CLIENT_ID "your_client_id" -f .env.production
dotenvx set PLAID_SECRET "your_secret" -f .env.production
dotenvx set DATABASE_URL "postgresql://user:pass@host:5432/db" -f .env.production

# Store keys in .env.keys (NEVER commit)
```

### 4. Initialize Database
```bash
npm run init-db
```

### 5. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Running in Different Environments

### Development
```bash
npm run dev
```

### Production with Encryption
```bash
DOTENV_PRIVATE_KEY_PRODUCTION="your_key" npm run env:run npm start
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot authentication token | ✅ |
| `PLAID_CLIENT_ID` | Plaid API client ID | ✅ |
| `PLAID_SECRET` | Plaid API secret | ✅ |
| `PLAID_ENV` | Plaid environment (sandbox/production) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `STRIPE_SECRET_KEY` | Stripe API key (if using payments) | ❌ |

## Project Structure
```
src/
├── index.js                 # Entry point
├── bot/                     # Telegram bot implementation
├── api/                     # Express REST API
├── services/                # Business logic
├── models/                  # Database models
├── database/                # DB setup
├── config/                  # Configuration
└── utils/                   # Utilities
```

## Available Commands
```bash
npm start              # Start production server
npm run dev            # Start with auto-reload
npm run init-db        # Initialize database
npm run env:keygen     # Generate encryption keys
npm run env:set        # Set encrypted variables
npm run env:list       # List environment variables
npm run env:run        # Run commands with decrypted vars
```

## Documentation
- [Environment Setup](./docs/ENVIRONMENT_SETUP.md) - Detailed encryption setup
- [Copilot Instructions](../.github/copilot-instructions.md) - Development guidelines

## Troubleshooting

### Bot doesn't respond
- Check `TELEGRAM_BOT_TOKEN` is correct
- Verify bot is running: `npm run dev`
- Check logs: `tail logs/app.log`

### Database connection fails
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Run `npm run init-db` to initialize schema

### Plaid API errors
- Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` are correct
- Check if using sandbox vs production environment
- Review Plaid API error codes in logs

## Support
For issues, check the [GitHub Issues](https://github.com/johnconstant99-dev/telegram-plaid-bot/issues)

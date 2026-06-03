# README

Telegram Plaid Bot - Secure Banking Integration for Telegram

![JavaScript](https://img.shields.io/badge/JavaScript-94.7%25-f7df1e?logo=javascript)
![PLpgSQL](https://img.shields.io/badge/PLpgSQL-5%25-336791?logo=postgresql)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🤖 Overview

A secure Telegram bot that integrates with Plaid's banking API, allowing users to:
- Connect their bank accounts directly through Telegram
- View real-time financial data
- Manage banking information securely
- Execute financial operations via chat interface

**Technology Stack:**
- **Runtime:** Node.js 18+ (CommonJS)
- **Bot Framework:** Telegraf 4.x
- **API:** Express.js 4.x
- **Banking:** Plaid API v18
- **Database:** PostgreSQL with connection pooling
- **Security:** AES-256-GCM encryption + dotenvx
- **Containerization:** Docker & Docker Compose

## ✨ Features

- 🔐 **Secure Authentication** - OAuth2 with encrypted token storage
- 🏦 **Bank Integration** - Direct Plaid API connectivity
- 💬 **Chat Interface** - Natural Telegram bot interaction
- 📊 **Real-time Data** - Live account balances and transactions
- 🔒 **Encrypted Secrets** - dotenvx for environment management
- 📦 **Container Ready** - Docker & docker-compose support
- 🪵 **Structured Logging** - Winston logging throughout
- ⚡ **Rate Limited** - Express rate-limiting middleware

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Docker (optional)
- Telegram Bot Token ([Get one](https://t.me/BotFather))
- Plaid API Key ([Sign up](https://plaid.com))

### Installation

```bash
# Clone repository
git clone https://github.com/johnconstant99-dev/telegram-plaid-bot.git
cd telegram-plaid-bot

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Initialize database
npm run init-db

# Start development server
npm run dev
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## 📋 Environment Configuration

Create `.env` file with required variables:

```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret

# Plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/telegram_plaid_bot

# Server
NODE_ENV=development
PORT=3000
```

For **production**, use encrypted environment management:
```bash
npm run env:keygen                    # Generate keys
dotenvx set VAR "value" -f .env.production  # Set encrypted vars
```

See [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) for details.

## 🏗️ Project Structure

```
src/
├── index.js                    # Application entry point
├── bot/                        # Telegram bot implementation
│   ├── index.js               # Bot initialization
│   ├── commands/              # Command handlers
│   └── middleware/            # Bot middleware
├── api/                       # Express REST API
│   ├── server.js              # Server configuration
│   ├── routes/                # Route definitions
│   └── controllers/           # Request handlers
├── services/                  # Business logic
│   ├── plaidService.js        # Plaid API wrapper
│   ├── userService.js         # User management
│   ├── encryptionService.js   # Token encryption
│   └── stripeService.js       # Payment processing
├── models/                    # Database models
│   ├── User.js                # User model
│   └── PlaidConnection.js     # Bank connection model
├── database/                  # Database setup
│   ├── connection.js          # PostgreSQL pool
│   ├── init.sql               # Schema definition
│   └── init.js                # Init script
├── config/                    # Configuration
│   └── index.js               # Config management
└── utils/                     # Utilities
    ├── logger.js              # Winston logger
    └── errorHandler.js        # Error handling
```

## 📚 Available Commands

```bash
# Development
npm start              # Start production server
npm run dev            # Start with auto-reload (nodemon)
npm run init-db        # Initialize database schema

# Environment Management
npm run env:keygen     # Generate encryption keys
npm run env:set        # Set encrypted variables
npm run env:list       # List all environment variables
npm run env:run        # Run commands with decrypted env
```

## 🔐 Security

- **Encryption:** All sensitive tokens encrypted with AES-256-GCM
- **Environment:** dotenvx for secure secret management
- **Database:** Connection pooling with parameterized queries
- **API:** Rate limiting, CORS, Helmet for security headers
- **Keys:** Private keys stored securely, never committed

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 📖 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - New developer setup guide
- [docs/ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) - Environment & encryption guide
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Development standards

## 🔄 CI/CD

GitHub Actions workflow automatically:
- ✅ Tests code on push to Main
- 🔍 Validates encrypted environment files
- 🏗️ Builds application
- 🚀 Prepares for deployment

See `.github/workflows/deploy.yml` for configuration.

## 🤝 Contributing

1. Follow the [Copilot Instructions](./.github/copilot-instructions.md)
2. Use CommonJS modules (`require`/`module.exports`)
3. Implement async/await with try-catch
4. Add Winston logging, not console.log
5. Test locally before pushing

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- [GitHub Issues](https://github.com/johnconstant99-dev/telegram-plaid-bot/issues)
- [Telegram Documentation](https://core.telegram.org/bots)
- [Plaid API Docs](https://plaid.com/docs)

## 👤 Author

**johnconstant99-dev**
- GitHub: [@johnconstant99-dev](https://github.com/johnconstant99-dev)

---

**Made with ❤️ for secure financial data management**

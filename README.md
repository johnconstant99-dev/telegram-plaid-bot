# Telegram Plaid Bot

A full-stack application that integrates a Telegram bot with Plaid's banking API, allowing users to securely connect their bank accounts and view financial information directly through Telegram.

## 🌟 Features

- **Telegram Bot Interface**
  - Interactive command-based navigation
  - User-friendly keyboard buttons
  - Real-time account balance viewing
  - Transaction history retrieval
  - Secure user authentication

- **Plaid Banking Integration**
  - Secure bank account linking via Plaid Link
  - Multi-account support
  - Real-time balance fetching
  - Transaction history (last 30 days)
  - Webhook support for updates

- **Security & Privacy**
  - AES-256-GCM encryption for access tokens
  - Environment-based configuration
  - Rate limiting protection
  - No credential storage
  - Bank-level security through Plaid

- **Robust Backend**
  - RESTful API with Express.js
  - PostgreSQL database with connection pooling
  - Comprehensive error handling
  - Winston logging system
  - Docker support for easy deployment

## 🎯 How It Works - Telegram as Your GUI

Unlike traditional web apps, this bot uses **Telegram as the entire user interface**:

- **No frontend code needed** - Telegram handles all UI rendering
- **Cross-platform** - Works on iOS, Android, Web, Desktop automatically  
- **Built-in auth** - Telegram manages user identity
- **Rich UI** - Buttons, keyboards, inline menus provided by Telegram
- **Users interact via chat** - Simple commands like `/balance` or `/transactions`

The flow: `User's Telegram App → Your Bot → Express API → PostgreSQL + Plaid → Bank Data`

📘 **For complete deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn** package manager
- **Telegram Bot Token** (from [@BotFather](https://t.me/botfather))
- **Plaid Account** (Sign up at [Plaid.com](https://plaid.com))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/telegram-plaid-bot.git
cd telegram-plaid-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Telegram Bot Token (get from @BotFather)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Plaid Credentials (from Plaid Dashboard)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # Use 'sandbox' for testing, 'production' for live

# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/telegram_plaid

# Server Configuration
PORT=3000
API_BASE_URL=http://localhost:3000

# Security (IMPORTANT: Change these!)
ENCRYPTION_KEY=your_32_character_encryption_key_here
JWT_SECRET=your_jwt_secret_here

# Logging
LOG_LEVEL=info
```

**Important Security Notes:**
- `ENCRYPTION_KEY` must be exactly 32 characters
- Never commit `.env` file to version control
- Use strong, random values for encryption keys
- In production, use environment variables or secrets management

### 4. Set Up Database

#### Option A: Manual Setup

Create the database:

```bash
createdb telegram_plaid
```

Initialize the schema:

```bash
npm run init-db
```

#### Option B: Docker Setup (Recommended)

```bash
docker-compose up -d db
```

The database will be automatically initialized with the schema.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This uses nodemon for automatic reloading on file changes.

### Production Mode

```bash
npm start
```

### Using Docker

Build and run everything with Docker Compose:

```bash
docker-compose up -d
```

Stop the application:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f app
```

## 💬 Available Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and initialization |
| `/link` | Connect your bank account via Plaid |
| `/balance` | View all connected account balances |
| `/transactions` | View recent transactions (last 30 days) |
| `/help` | Display help information |

### Keyboard Shortcuts

The bot also provides interactive buttons:
- 💳 **Link Account** - Same as `/link`
- 💰 **Balance** - Same as `/balance`
- 📊 **Transactions** - Same as `/transactions`
- ❓ **Help** - Same as `/help`

## 🔌 API Documentation

### Endpoints

#### Create Link Token
```http
POST /api/plaid/create-link-token
Content-Type: application/json

{
  "telegram_id": 123456789
}

Response:
{
  "success": true,
  "link_token": "link-sandbox-xxx",
  "expiration": "2024-01-01T12:00:00Z"
}
```

#### Exchange Public Token
```http
POST /api/plaid/exchange-token
Content-Type: application/json

{
  "public_token": "public-sandbox-xxx",
  "telegram_id": 123456789
}

Response:
{
  "success": true,
  "institution_name": "Chase"
}
```

#### Get Accounts
```http
GET /api/plaid/accounts/:telegram_id

Response:
{
  "success": true,
  "accounts": [
    {
      "name": "Plaid Checking",
      "balance": 100.00,
      "available": 95.00,
      "type": "depository",
      "subtype": "checking",
      "institution": "Chase"
    }
  ]
}
```

#### Get Transactions
```http
GET /api/plaid/transactions/:telegram_id?start_date=2024-01-01&end_date=2024-01-31

Response:
{
  "success": true,
  "transactions": [
    {
      "transaction_id": "xxx",
      "name": "Uber",
      "amount": 12.50,
      "date": "2024-01-15",
      "category": ["Transportation"],
      "pending": false,
      "institution": "Chase"
    }
  ]
}
```

#### Webhook Handler
```http
POST /api/webhook/plaid
Content-Type: application/json

{
  "webhook_type": "TRANSACTIONS",
  "webhook_code": "DEFAULT_UPDATE",
  "item_id": "xxx"
}

Response:
{
  "received": true
}
```

### Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🧪 Testing in Sandbox

Plaid provides a sandbox environment for testing without real bank connections.

### Sandbox Test Credentials

When using Plaid Link in sandbox mode:

1. **Institution**: Search for "First Platypus Bank"
2. **Username**: `user_good`
3. **Password**: `pass_good`
4. **MFA**: `1234` (if prompted)

### Testing the Flow

1. Start the bot with `/start`
2. Use `/link` to get a link token
3. In a real implementation, you'd complete Plaid Link flow in a web interface
4. The bot will guide you through the connection process
5. Use `/balance` to view connected accounts
6. Use `/transactions` to see transaction history

## 🗂️ Project Structure

```
telegram-plaid-bot/
├── src/
│   ├── bot/                      # Telegram bot
│   │   ├── index.js              # Bot initialization
│   │   ├── commands/             # Command handlers
│   │   │   ├── start.js
│   │   │   ├── link.js
│   │   │   ├── balance.js
│   │   │   ├── transactions.js
│   │   │   └── help.js
│   │   └── middleware/           # Bot middleware
│   │       └── auth.js
│   ├── api/                      # Express API
│   │   ├── server.js             # Server setup
│   │   ├── routes/               # Route definitions
│   │   │   ├── plaid.js
│   │   │   └── webhook.js
│   │   └── controllers/          # Request handlers
│   │       ├── plaidController.js
│   │       └── webhookController.js
│   ├── services/                 # Business logic
│   │   ├── plaidService.js       # Plaid API wrapper
│   │   ├── userService.js        # User operations
│   │   └── encryptionService.js  # Token encryption
│   ├── models/                   # Data models
│   │   ├── User.js
│   │   └── PlaidConnection.js
│   ├── database/                 # Database setup
│   │   ├── connection.js         # DB connection pool
│   │   ├── init.sql              # Schema definition
│   │   └── init.js               # Initialization script
│   ├── config/                   # Configuration
│   │   └── index.js
│   ├── utils/                    # Utilities
│   │   ├── logger.js             # Winston logger
│   │   └── errorHandler.js       # Error handling
│   └── index.js                  # Application entry point
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT.md                 # Complete deployment guide
└── README.md
```

## 🚀 Deployment

This application can be deployed to various platforms. The Telegram bot serves as your GUI - no frontend deployment needed!

### Quick Deploy Options

1. **Heroku** (Easiest for beginners)
   ```bash
   heroku create my-telegram-bot
   heroku addons:create heroku-postgresql:mini
   git push heroku main
   ```

2. **DigitalOcean/VPS** (Best for production)
   - Install Node.js, PostgreSQL, PM2
   - Clone repo, configure .env
   - Start with `pm2 start src/index.js`

3. **Docker** (Recommended)
   ```bash
   docker-compose up -d
   ```

### Essential Steps for Any Platform

1. **Get Telegram Bot Token**: Talk to [@BotFather](https://t.me/botfather) on Telegram
2. **Get Plaid Credentials**: Sign up at [Plaid.com](https://plaid.com)
3. **Set Environment Variables**: Copy `.env.example` and fill in your credentials
4. **Initialize Database**: Run `npm run init-db`
5. **Start Application**: The bot will be your GUI automatically!

📘 **For detailed deployment instructions (cloud, VPS, Docker, monitoring), see [DEPLOYMENT.md](DEPLOYMENT.md)**

## 🔐 Security Best Practices

### Implemented Security Measures

1. **Token Encryption**
   - All Plaid access tokens encrypted with AES-256-GCM
   - Unique initialization vectors for each encryption
   - Authentication tags for integrity verification

2. **Environment Security**
   - All secrets in environment variables
   - `.env` excluded from version control
   - Validation of required environment variables on startup

3. **API Security**
   - Helmet.js for HTTP security headers
   - CORS configured for controlled access
   - Rate limiting (60 requests/minute per IP)
   - Input validation on all endpoints

4. **Database Security**
   - Parameterized queries prevent SQL injection
   - Connection pooling with timeouts
   - CASCADE deletes for data integrity

5. **Error Handling**
   - No sensitive data in error messages
   - Production mode hides stack traces
   - Comprehensive logging without secrets

6. **Production Recommendations**
   - Use HTTPS for all communications
   - Set up SSL/TLS for database connections
   - Implement proper secrets management (AWS Secrets Manager, etc.)
   - Enable webhook signature verification
   - Regular security audits
   - Keep dependencies updated

## 🐛 Troubleshooting

### Common Issues

#### Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check bot is running: `docker-compose ps` or check process
- Review logs: `docker-compose logs app` or `tail -f combined.log`

#### Database Connection Errors
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check database exists: `psql -l`
- Run database initialization: `npm run init-db`

#### Plaid API Errors
- Verify `PLAID_CLIENT_ID` and `PLAID_SECRET`
- Check `PLAID_ENV` matches your credentials (sandbox/production)
- Review Plaid error codes in logs
- Ensure test credentials are correct for sandbox

#### Encryption Errors
- `ENCRYPTION_KEY` must be exactly 32 characters
- Don't change key after encrypting tokens (they'll be unreadable)
- If needed, generate new key: `node -e "console.log(crypto.randomBytes(16).toString('hex'))"`

#### Rate Limiting
- Default: 60 requests/minute
- Adjust in `src/api/server.js` if needed
- Wait or increase limit for legitimate high-volume use

### Logs

Check application logs:
```bash
# Combined logs
tail -f combined.log

# Error logs only
tail -f error.log

# Docker logs
docker-compose logs -f app
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update README for new features
- Test thoroughly before submitting
- Keep commits focused and descriptive

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Plaid](https://plaid.com) for the banking API
- [Telegraf](https://telegraf.js.org) for the Telegram bot framework
- [Express](https://expressjs.com) for the web framework
- All contributors and supporters

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [Plaid API Documentation](https://plaid.com/docs)
- Review [Telegraf Documentation](https://telegraf.js.org)

## ⚠️ Disclaimer

This bot handles sensitive financial information. Always:
- Use in compliance with local regulations
- Implement additional security measures for production
- Never store or log sensitive user data
- Follow Plaid's terms of service
- Obtain proper user consent
- Keep all dependencies updated

---

**Happy Banking! 🏦**

# Copilot Instructions for Telegram Plaid Bot

## Project Overview

This is a Telegram bot integrated with Plaid's banking API that allows users to securely connect bank accounts and view financial information directly through Telegram. The bot uses Telegram as the GUI interface - no frontend code needed.

**Technology Stack:**
- **Runtime:** Node.js 18+ with CommonJS modules
- **Bot Framework:** Telegraf 4.x
- **API:** Express.js 4.x with RESTful endpoints
- **Banking Integration:** Plaid API v18
- **Database:** PostgreSQL with connection pooling (pg library)
- **Security:** AES-256-GCM encryption for access tokens
- **Logging:** Winston for structured logging
- **Containerization:** Docker with docker-compose

**Architecture Flow:**
`User's Telegram App → Telegram Bot (Telegraf) → Express API → PostgreSQL + Plaid API → Bank Data`

## Project Structure

```
src/
├── index.js                     # Application entry point with startup validation
├── bot/                         # Telegram bot implementation
│   ├── index.js                 # Bot initialization and setup
│   ├── commands/                # Command handlers (/start, /link, /balance, etc.)
│   └── middleware/              # Bot middleware (auth, etc.)
├── api/                         # Express REST API
│   ├── server.js                # Server setup with middleware
│   ├── routes/                  # Route definitions
│   └── controllers/             # Request handlers
├── services/                    # Business logic layer
│   ├── plaidService.js          # Plaid API wrapper
│   ├── userService.js           # User operations
│   ├── encryptionService.js     # Token encryption/decryption
│   └── stripeService.js         # Payment processing
├── models/                      # Data models
│   ├── User.js                  # User model with database methods
│   └── PlaidConnection.js       # Bank connection model
├── database/                    # Database setup
│   ├── connection.js            # PostgreSQL connection pool
│   ├── init.sql                 # Schema definition
│   └── init.js                  # Database initialization script
├── config/                      # Configuration management
│   └── index.js                 # Environment-based config
└── utils/                       # Utility functions
    ├── logger.js                # Winston logger configuration
    └── errorHandler.js          # Error handling utilities
```

## Build & Run Commands

### Development
```bash
npm run dev          # Start with nodemon (auto-reload)
npm run init-db      # Initialize database schema
```

### Production
```bash
npm start            # Start application in production mode
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f app        # View application logs
docker-compose down               # Stop all services
```

## Coding Standards & Conventions

### JavaScript Style
- **Module System:** CommonJS (`require`/`module.exports`)
- **Async/Await:** Prefer async/await over promises and callbacks
- **Error Handling:** Always use try-catch blocks in async functions
- **Logging:** Use Winston logger (`logger.info()`, `logger.error()`) instead of `console.log()`
- **Comments:** Add comments only for complex logic; code should be self-documenting

### Code Organization
- **Services:** Business logic goes in `/services` directory
- **Controllers:** HTTP request handling in `/api/controllers`
- **Models:** Database interactions in `/models` with static methods
- **Commands:** Telegram bot commands in `/bot/commands`, one file per command
- **Middleware:** Reusable middleware in respective directories (`/bot/middleware`, `/api/middleware`)

### Naming Conventions
- **Files:** camelCase for JavaScript files (e.g., `userService.js`, `plaidController.js`)
- **Classes:** PascalCase (e.g., `PlaidService`, `User`)
- **Functions:** camelCase (e.g., `createLinkToken`, `findByTelegramId`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `TELEGRAM_BOT_TOKEN`, `PLAID_ENV`)
- **Database Tables:** snake_case (e.g., `users`, `plaid_connections`, `transactions_cache`)

### Function Structure
- Keep functions focused and single-purpose
- Use descriptive parameter names
- Return early for error conditions
- Always log errors with context before throwing

### Example Service Method:
```javascript
async createLinkToken(telegramId) {
  try {
    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`Creating link token for telegram_id: ${telegramId}`);
    const response = await this.client.linkTokenCreate(request);
    
    return {
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    };
  } catch (error) {
    logger.error('Error creating link token:', error);
    throw new PlaidError('Failed to create link token', error.response?.data?.error_code);
  }
}
```

## Security Best Practices

### Critical Security Rules
1. **Never commit secrets:** All sensitive data must be in environment variables
2. **Encrypt access tokens:** All Plaid access tokens MUST be encrypted using `encryptionService` before storing in database
3. **Validate environment variables:** Check required env vars on startup (see `src/index.js`)
4. **Encryption key length:** `ENCRYPTION_KEY` must be exactly 32 characters
5. **Use parameterized queries:** Always use parameterized queries to prevent SQL injection
6. **No sensitive data in logs:** Never log tokens, passwords, or sensitive user data
7. **Error messages:** Don't expose sensitive information in error messages sent to users

### Security Patterns Used
- **AES-256-GCM** encryption with unique IVs for each encryption
- **Authentication tags** for integrity verification
- **Helmet.js** for HTTP security headers
- **CORS** configured for controlled access
- **Rate limiting** (60 requests/minute per IP)
- **Input validation** on all endpoints

### Encryption Implementation
The `encryptionService` provides transparent encryption/decryption:
```javascript
const encryptionService = new EncryptionService();

// Encrypt before storing
const encrypted = encryptionService.encrypt(accessToken);
await db.query(
  'INSERT INTO plaid_connections (user_id, access_token) VALUES ($1, $2)',
  [userId, encrypted]
);

// Decrypt when retrieving
const connection = await db.query('SELECT * FROM plaid_connections WHERE user_id = $1', [userId]);
const decrypted = encryptionService.decrypt(connection.rows[0].access_token);
```

**Important:** Plaid access tokens MUST always be encrypted before storing.

### When Adding New Features
- If handling tokens or secrets, use `encryptionService`
- If adding API endpoints, apply rate limiting middleware
- If storing user data, ensure proper sanitization
- If adding database queries, use parameterized queries only

## Database Guidelines

### Schema
The database uses PostgreSQL with three main tables:
- **users:** Telegram user information (telegram_id is unique identifier)
- **plaid_connections:** Bank connection tokens (encrypted access_token)
- **transactions_cache:** Cached transaction data

### Model Methods
Models use static methods for database operations. All queries use parameterized arguments ($1, $2, etc.) to prevent SQL injection:
```javascript
// Example: Finding a user by telegram ID
static async findByTelegramId(telegramId) {
  const result = await db.query(
    'SELECT * FROM users WHERE telegram_id = $1',
    [telegramId]  // Parameter passed separately
  );
  return result.rows[0] || null;
}

// Example: Creating/updating a user with ON CONFLICT
static async create(userData) {
  const { telegram_id, username, first_name, last_name } = userData;
  const result = await db.query(
    `INSERT INTO users (telegram_id, username, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (telegram_id) DO UPDATE
     SET username = $2, first_name = $3, last_name = $4, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [telegram_id, username, first_name, last_name]
  );
  return result.rows[0];
}
```

### Best Practices
- Use CASCADE deletes to maintain referential integrity
- Always use connection pooling (pre-configured in `database/connection.js`)
- Use indexes on frequently queried columns
- Handle database errors gracefully with proper logging
- Never construct query strings with concatenation or template literals

## Configuration Management

### Config Pattern
All environment-based configuration is centralized in `src/config/index.js`:
```javascript
module.exports = {
  telegram: { botToken: process.env.TELEGRAM_BOT_TOKEN },
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    env: process.env.PLAID_ENV || 'sandbox',
  },
  database: { url: process.env.DATABASE_URL },
  server: {
    port: process.env.PORT || 3000,
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  security: { encryptionKey: process.env.ENCRYPTION_KEY },
  logging: { level: process.env.LOG_LEVEL || 'info' },
};
```

Import and use in all modules: `const config = require('../config');`

This centralizes configuration, making defaults clear and dependencies explicit.

## Telegram Bot Patterns

### Command Structure
Each command is in its own file in `/bot/commands/`:
```javascript
const commandName = async (ctx) => {
  // Command logic here
  await ctx.reply('Response message');
};

module.exports = commandName;
```

### User Interface
- Use `Markup.keyboard()` for persistent keyboard buttons
- Use `Markup.inlineKeyboard()` for one-time action buttons
- Format messages with emojis for better UX
- Always provide helpful error messages

### Bot Registration
Commands are registered in `/bot/index.js`:
```javascript
this.bot.command('commandname', commandHandler);
```

### Cross-Component Data Flow
Commands call Express API endpoints via `axios`:
```javascript
// In /bot/commands/link.js
const response = await axios.post(
  `${config.server.apiBaseUrl}/api/plaid/create-link-token`,
  { telegram_id: ctx.from.id }
);
```

This pattern keeps bot logic thin and delegates business logic to services accessed via REST API.

## API Patterns

### Controller Structure & Error Handling
Controllers use `asyncHandler` wrapper for automatic error handling:
```javascript
const { asyncHandler } = require('../../utils/errorHandler');

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
```

This pattern eliminates redundant try-catch blocks in every controller.

### Response Format
All API responses follow this structure:
```javascript
{
  "success": true/false,
  "data": { ... },        // On success
  "error": "message"      // On failure
}
```

## Testing

Currently, there is no formal test suite in this project. When implementing tests:
- Place test files in a `test/` or `__tests__/` directory
- Use a testing framework like Jest or Mocha
- Test services independently with mocked dependencies
- Test API endpoints with supertest
- Test database operations with a test database

## Common Workflows

### Adding a New Telegram Command
1. Create command file in `/bot/commands/`
2. Implement command handler function
3. Export the handler
4. Register in `/bot/index.js`
5. Update README.md with new command documentation

### Adding a New API Endpoint
1. Create/update route file in `/api/routes/`
2. Create controller method in `/api/controllers/`
3. Implement business logic in appropriate service
4. Add input validation
5. Apply middleware (rate limiting, etc.)
6. Test endpoint manually
7. Update API documentation in README.md

### Adding a New Database Table
1. Add CREATE TABLE statement to `/database/init.sql`
2. Add indexes for frequently queried columns
3. Create model file in `/models/` with static methods
4. Update relevant services to use new model
5. Run `npm run init-db` to apply schema changes

## Environment Variables

Required variables (validated on startup):
- `TELEGRAM_BOT_TOKEN` - From @BotFather on Telegram
- `PLAID_CLIENT_ID` - From Plaid Dashboard
- `PLAID_SECRET` - From Plaid Dashboard
- `DATABASE_URL` - PostgreSQL connection string
- `ENCRYPTION_KEY` - Exactly 32 characters for AES-256

Optional with defaults:
- `PLAID_ENV` - Default: 'sandbox' (options: 'sandbox', 'development', 'production')
- `PORT` - Default: 3000
- `API_BASE_URL` - Default: http://localhost:3000
- `LOG_LEVEL` - Default: 'info'

## Troubleshooting

### Common Issues
1. **Bot not responding:** Check `TELEGRAM_BOT_TOKEN` and ensure bot is running
2. **Database errors:** Verify `DATABASE_URL` and ensure database is initialized
3. **Plaid API errors:** Check `PLAID_CLIENT_ID`, `PLAID_SECRET`, and `PLAID_ENV` match
4. **Encryption errors:** Ensure `ENCRYPTION_KEY` is exactly 32 characters

### Logging
- Application logs to `combined.log` (all levels)
- Error logs to `error.log` (errors only)
- Use `docker-compose logs -f app` for Docker deployments
- Log level controlled by `LOG_LEVEL` environment variable

## Dependencies

### Production Dependencies
- `telegraf` - Telegram bot framework
- `express` - Web server framework
- `plaid` - Plaid API client
- `pg` - PostgreSQL driver
- `dotenv` - Environment variable management
- `express-rate-limit` - API rate limiting
- `helmet` - Security middleware
- `cors` - CORS middleware
- `winston` - Logging framework
- `axios` - HTTP client
- `stripe` - Payment processing

### Development Dependencies
- `nodemon` - Auto-reload during development

### Adding New Dependencies
- Only add dependencies when necessary; prefer built-in Node.js modules
- Check for security vulnerabilities before adding
- Update package.json with specific version ranges
- Run `npm install` and commit package-lock.json

## Additional Notes

- **No frontend code:** Telegram app serves as the entire UI
- **Cross-platform:** Works on iOS, Android, Web, Desktop automatically
- **Sandbox testing:** Use Plaid sandbox credentials for development
- **Graceful shutdown:** Application handles SIGTERM and SIGINT signals
- **Webhook support:** Ready for Plaid webhook integration
- **Docker-ready:** Includes Dockerfile and docker-compose.yml

## References

- Main README: `/README.md` - Complete setup and usage guide
- Deployment Guide: `/DEPLOYMENT.md` - Detailed deployment instructions
- Environment Template: `/.env.example` - All required environment variables
- Database Schema: `/src/database/init.sql` - Complete database structure

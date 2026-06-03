# Environment Configuration Guide

This project uses **dotenvx** for secure environment variable management with encryption support.

## Overview

- **Development**: `.env` (unencrypted, local only)
- **Staging**: `.env.staging` (encrypted)
- **Production**: `.env.production` (encrypted)
- **Keys**: `.env.keys` (private decryption keys - NEVER commit)

## Setup Instructions

### 1. Install dotenvx

```bash
npm install -D dotenvx
# or globally
npm install -g dotenvx
```

### 2. Generate Encryption Keys

```bash
dotenvx keygen
```

This generates a base64-encoded private key. Save it somewhere secure.

### 3. Create Local Development Environment

```bash
cp .env.example .env
# Edit .env with your local development values
nano .env
```

### 4. Create Staging Environment (Encrypted)

```bash
# Create .env.staging with your staging values
dotenvx set TELEGRAM_BOT_TOKEN "your_staging_token" -f .env.staging
dotenvx set PLAID_CLIENT_ID "your_staging_plaid_id" -f .env.staging
dotenvx set PLAID_SECRET "your_staging_plaid_secret" -f .env.staging
dotenvx set DATABASE_URL "postgresql://staging_user:pass@staging-host:5432/db" -f .env.staging
# ... add other variables
```

### 5. Create Production Environment (Encrypted)

```bash
dotenvx set TELEGRAM_BOT_TOKEN "your_production_token" -f .env.production
dotenvx set PLAID_CLIENT_ID "your_production_plaid_id" -f .env.production
dotenvx set PLAID_SECRET "your_production_plaid_secret" -f .env.production
dotenvx set DATABASE_URL "postgresql://prod_user:pass@prod-host:5432/db" -f .env.production
# ... add other variables
```

### 6. Store Private Keys

Create `.env.keys` locally (NEVER commit):

```bash
# .env.keys
DOTENV_PRIVATE_KEY_STAGING="your_staging_key_from_keygen"
DOTENV_PRIVATE_KEY_PRODUCTION="your_production_key_from_keygen"
```

Add to `.gitignore` ✓ (already configured)

### 7. Verify Setup

```bash
# Load and display variables (redacted)
dotenvx ls

# Test with Node.js
dotenvx run -- node -e "console.log(process.env.TELEGRAM_BOT_TOKEN)"
```

## Running the Application

### Development
```bash
npm run dev
# or with dotenvx explicitly
dotenvx run -- npm run dev
```

### Staging
```bash
DOTENV_PRIVATE_KEY_STAGING="your_key" dotenvx run -f .env.staging -- npm start
```

### Production
```bash
DOTENV_PRIVATE_KEY_PRODUCTION="your_key" dotenvx run -f .env.production -- npm start
```

## GitHub Actions Integration

### Using Encrypted Variables in CI/CD

1. **Store Private Keys as GitHub Secrets**:
   - Go to: Settings → Secrets and variables → Actions
   - Add: `DOTENV_PRIVATE_KEY_PRODUCTION`
   - Add: `DOTENV_PRIVATE_KEY_STAGING`

2. **Use in Workflows**:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
        run: dotenvx run -f .env.production -- npm run build
      
      - name: Deploy
        env:
          DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
        run: dotenvx run -f .env.production -- npm start
```

## Security Best Practices

✅ **DO:**
- Store `.env.keys` securely (password manager, vault, etc.)
- Rotate encryption keys regularly
- Use different keys for each environment
- Restrict access to `.env.keys` in your local environment
- Document which team members have access to which environments
- Review `.env.*` files before committing (they're encrypted)

❌ **DON'T:**
- Commit `.env.keys` to version control
- Share private keys via email or chat
- Use the same key for multiple environments
- Store keys in code comments
- Commit unencrypted `.env` files with real secrets

## Troubleshooting

### "Error: DOTENV_PRIVATE_KEY_* not found"
- Ensure the private key is set in environment or `.env.keys`
- Verify the key format (base64)
- Check environment variable name matches file name (PRODUCTION, STAGING, etc.)

### Variables not loading
```bash
# Debug: Check which file is being loaded
dotenvx ls -f .env.production

# Verbose output
dotenvx run -f .env.production --debug -- node index.js
```

### Regenerate keys
```bash
# Generate new key (old encrypted values become unreadable)
dotenvx keygen

# Re-encrypt .env files with new key
dotenvx set VAR_NAME "value" -f .env.production
```

## Resources

- [dotenvx Documentation](https://dotenvx.sh)
- [dotenvx GitHub](https://github.com/dotenvx/dotenvx)
- [Environment Variables Best Practices](https://12factor.net/config)

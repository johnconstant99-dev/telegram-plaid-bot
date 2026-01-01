# Telegram Plaid Bot - Complete Deployment Guide

This guide explains how to deploy the Telegram bot application from development to production, with special focus on using Telegram as the GUI/interface.

## 🎯 Understanding Telegram as the GUI

Unlike traditional web applications with HTML/CSS interfaces, this application uses **Telegram as the entire user interface**. Here's how it works:

### Why Telegram as GUI?

1. **No Frontend Development Needed** - Telegram handles all UI rendering
2. **Cross-Platform** - Works on iOS, Android, Web, Desktop automatically
3. **Built-in Authentication** - Telegram handles user identity
4. **Push Notifications** - Free, real-time updates
5. **Rich UI Components** - Buttons, keyboards, inline menus
6. **Secure** - End-to-end encryption built-in

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S TELEGRAM APP                  │
│  (This is your GUI - iOS/Android/Web/Desktop)          │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  /start                                       │     │
│  │  👋 Welcome! Choose an action:               │     │
│  │  ┌──────────────┬──────────────┐            │     │
│  │  │ 💳 Link Acc  │ 💰 Balance   │            │     │
│  │  └──────────────┴──────────────┘            │     │
│  │  ┌──────────────┬──────────────┐            │     │
│  │  │ 📊 Trans     │ ❓ Help      │            │     │
│  │  └──────────────┴──────────────┘            │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                         ↕️
              (Telegram Bot API)
                         ↕️
┌─────────────────────────────────────────────────────────┐
│              YOUR DEPLOYED APPLICATION                  │
│                                                         │
│  ┌────────────────┐         ┌─────────────────┐       │
│  │  Telegram Bot  │ ←────→  │  Express API    │       │
│  │  (Telegraf)    │         │  (REST)         │       │
│  └────────────────┘         └─────────────────┘       │
│                                     ↕️                  │
│                              ┌─────────────────┐       │
│                              │   PostgreSQL    │       │
│                              │   (Data Store)  │       │
│                              └─────────────────┘       │
└─────────────────────────────────────────────────────────┘
                         ↕️
                  (Plaid API)
                         ↕️
               ┌─────────────────┐
               │   Bank APIs     │
               └─────────────────┘
```

## 📱 Step 1: Create Your Telegram Bot (GUI Setup)

This is the equivalent of "building your frontend" - but Telegram does it for you!

### 1.1 Talk to BotFather

1. Open Telegram and search for `@BotFather`
2. Start a chat and send: `/newbot`
3. Follow the prompts:
   - **Bot Name**: "Aminskid Banking Assistant" (user-facing name)
   - **Bot Username**: "Aminskid_bot" (must end with 'bot')

4. You'll receive a token like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **SAVE THIS TOKEN** - This is your `TELEGRAM_BOT_TOKEN`

### 1.2 Customize Your Bot (Optional)

```
/setdescription - Set bot description
/setabouttext - Set about text  
/setuserpic - Set bot profile picture
/setcommands - Set command list
```

Example commands setup:
```
start - Initialize the bot and show main menu
link - Connect your bank account
balance - View account balances
transactions - View recent transactions
help - Show help information
```

### 1.3 Test Your Bot

Before deploying, search for your bot in Telegram and send `/start`. It won't respond yet (we haven't deployed the code), but you should be able to find it.

## 🚀 Step 2: Choose Your Deployment Method

You have 3 main options:

### Option A: Cloud Deployment (Recommended for Production)

Best for: Production use, 24/7 availability, scalability

**Popular Platforms:**
- **Heroku** (Easiest)
- **DigitalOcean** (Good balance)
- **AWS EC2** (Most flexible)
- **Google Cloud Run** (Serverless)
- **Railway** (Modern, easy)
- **Fly.io** (Global edge deployment)

### Option B: VPS Deployment

Best for: Full control, cost-effective for long-term

**Providers:**
- DigitalOcean Droplets ($5-10/month)
- Linode
- Vultr
- Hetzner

### Option C: Home Server / Local Development

Best for: Testing, development, private use

**Requirements:**
- Stable internet connection
- Port forwarding (for webhooks)
- Dynamic DNS (if IP changes)

## 🌐 Step 3: Deploy to Cloud (Heroku Example)

### 3.1 Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### 3.2 Login and Create App

```bash
heroku login
heroku create my-telegram-plaid-bot
```

### 3.3 Add PostgreSQL Database

```bash
heroku addons:create heroku-postgresql:mini
```

This automatically sets `DATABASE_URL` environment variable.

### 3.4 Set Environment Variables

```bash
# Telegram Bot Token (from BotFather)
heroku config:set TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Plaid Credentials (from https://dashboard.plaid.com)
heroku config:set PLAID_CLIENT_ID=your_client_id
heroku config:set PLAID_SECRET=your_secret
heroku config:set PLAID_ENV=sandbox  # or 'production'

# Server Configuration
heroku config:set PORT=3000
heroku config:set API_BASE_URL=https://my-telegram-plaid-bot.herokuapp.com

# Security - Generate random 32-character key
heroku config:set ENCRYPTION_KEY=$(openssl rand -hex 16)
heroku config:set JWT_SECRET=$(openssl rand -hex 32)

# Logging
heroku config:set LOG_LEVEL=info
```

### 3.5 Deploy

```bash
git push heroku main
```

### 3.6 Initialize Database

```bash
heroku run npm run init-db
```

### 3.7 Check Logs

```bash
heroku logs --tail
```

You should see:
```
Telegram bot started successfully
Server running on port 3000
Database connection established
```

### 3.8 Test Your Bot!

1. Open Telegram
2. Find your bot (search for username)
3. Send `/start`
4. You should see the welcome message with buttons!

## 🖥️ Step 4: Deploy to VPS (DigitalOcean Example)

### 4.1 Create a Droplet

1. Sign up at DigitalOcean
2. Create Droplet: Ubuntu 22.04, Basic Plan ($6/month)
3. Choose datacenter region closest to your users
4. Add SSH key for secure access

### 4.2 Connect to Your Server

```bash
ssh root@your_server_ip
```

### 4.3 Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2

# Install Docker (optional, for Docker deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 4.4 Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE telegram_plaid;
CREATE USER botuser WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE telegram_plaid TO botuser;
\q
```

### 4.5 Clone and Setup Application

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone https://github.com/yourusername/telegram-plaid-bot.git
cd telegram-plaid-bot

# Install dependencies
npm install --production

# Create .env file
cat > .env << 'EOF'
TELEGRAM_BOT_TOKEN=your_token_here
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
DATABASE_URL=postgresql://botuser:secure_password_here@localhost:5432/telegram_plaid
PORT=3000
API_BASE_URL=http://your_server_ip:3000
ENCRYPTION_KEY=your_32_character_key_here_abcd
JWT_SECRET=your_jwt_secret_here
LOG_LEVEL=info
EOF

# Initialize database
npm run init-db
```

### 4.6 Start with PM2

```bash
# Start application
pm2 start src/index.js --name telegram-plaid-bot

# Save PM2 configuration
pm2 save

# Setup auto-start on system reboot
pm2 startup
# Follow the command it outputs

# View logs
pm2 logs telegram-plaid-bot

# Monitor
pm2 monit
```

### 4.7 Setup Firewall

```bash
# Allow SSH
ufw allow ssh

# Allow HTTP/HTTPS (for webhooks)
ufw allow 80
ufw allow 443

# Allow your app port
ufw allow 3000

# Enable firewall
ufw enable
```

### 4.8 Setup Nginx (Optional, for HTTPS)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/telegram-bot << 'EOF'
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install SSL with Let's Encrypt
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your_domain.com
```

## 🐳 Step 5: Deploy with Docker (Easiest!)

### 5.1 Using Docker Compose (Local or VPS)

```bash
# Clone repository
git clone https://github.com/yourusername/telegram-plaid-bot.git
cd telegram-plaid-bot

# Create .env file
cp .env.example .env
# Edit .env with your credentials
nano .env

# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Initialize database (if not auto-initialized)
docker-compose exec app npm run init-db
```

That's it! Your bot is running.

### 5.2 Docker Commands

```bash
# Stop
docker-compose down

# Restart
docker-compose restart

# View status
docker-compose ps

# Access app shell
docker-compose exec app sh

# View database
docker-compose exec db psql -U postgres telegram_plaid
```

## 🔧 Step 6: Monitoring and Maintenance

### Check if Bot is Running

```bash
# PM2
pm2 status

# Docker
docker-compose ps

# Heroku
heroku ps
```

### View Logs

```bash
# PM2
pm2 logs telegram-plaid-bot

# Docker
docker-compose logs -f app

# Heroku
heroku logs --tail

# Direct (if running with npm start)
tail -f combined.log
tail -f error.log
```

### Restart Application

```bash
# PM2
pm2 restart telegram-plaid-bot

# Docker
docker-compose restart app

# Heroku
heroku restart
```

### Update Application

```bash
# Pull latest code
git pull origin main

# PM2
npm install --production
pm2 restart telegram-plaid-bot

# Docker
docker-compose down
docker-compose build
docker-compose up -d

# Heroku
git push heroku main
```

## 📊 Step 7: Testing Your Deployment

### 7.1 Test Bot Commands

Open Telegram and test each command:

1. **`/start`** - Should show welcome message with buttons
2. **`/help`** - Should show help information
3. **`/link`** - Should generate link token
4. **`/balance`** - Should say "no accounts connected"
5. **`/transactions`** - Should say "no transactions found"

### 7.2 Test API Endpoints

```bash
# Health check
curl https://your-app-url.com/health

# Create link token (replace telegram_id)
curl -X POST https://your-app-url.com/api/plaid/create-link-token \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123456789}'

# Get accounts
curl https://your-app-url.com/api/plaid/accounts/123456789
```

### 7.3 Test Plaid Integration (Sandbox)

1. Send `/link` to your bot
2. Follow the instructions to use Plaid Link
3. In sandbox, use these credentials:
   - Institution: "First Platypus Bank"
   - Username: `user_good`
   - Password: `pass_good`
4. After linking, test `/balance` and `/transactions`

## 🎨 Customizing the Telegram GUI

### Interactive Keyboards

The bot uses inline keyboards for better UX. Edit `src/bot/commands/start.js`:

```javascript
const { Markup } = require('telegraf');

await ctx.reply(
  'Choose an action:',
  Markup.keyboard([
    ['💳 Link Account', '💰 Balance'],
    ['📊 Transactions', '❓ Help']
  ]).resize()
);
```

### Inline Buttons

For action buttons within messages:

```javascript
await ctx.reply(
  'Select time period:',
  Markup.inlineKeyboard([
    [Markup.button.callback('Last 7 days', 'trans_7d')],
    [Markup.button.callback('Last 30 days', 'trans_30d')],
    [Markup.button.callback('Last 90 days', 'trans_90d')]
  ])
);
```

### Rich Formatting

Use Markdown or HTML:

```javascript
// Markdown
await ctx.replyWithMarkdown('*Bold* _italic_ `code`');

// HTML
await ctx.replyWithHTML('<b>Bold</b> <i>italic</i> <code>code</code>');
```

## 🔐 Production Checklist

Before going live:

- [ ] Use `PLAID_ENV=production` (after Plaid approval)
- [ ] Generate new, secure `ENCRYPTION_KEY` (32 chars)
- [ ] Generate new `JWT_SECRET`
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure monitoring (UptimeRobot, Pingdom)
- [ ] Set up error alerting
- [ ] Test all commands thoroughly
- [ ] Review security settings
- [ ] Set up log rotation
- [ ] Document environment variables
- [ ] Create backup/restore procedures

## 🚨 Troubleshooting

### Bot Not Responding

```bash
# Check if app is running
pm2 status  # or docker-compose ps

# Check logs for errors
pm2 logs  # or docker-compose logs

# Check bot token
echo $TELEGRAM_BOT_TOKEN

# Restart
pm2 restart telegram-plaid-bot
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
systemctl status postgresql  # VPS
docker-compose ps db  # Docker

# Test connection
psql $DATABASE_URL

# Check credentials in .env
```

### Plaid Errors

```bash
# Verify credentials
echo $PLAID_CLIENT_ID
echo $PLAID_SECRET

# Check environment
echo $PLAID_ENV  # Should be 'sandbox' or 'production'

# Test Plaid connectivity
curl https://sandbox.plaid.com/link/token/create
```

## 📈 Scaling Considerations

### For High Traffic

1. **Multiple Instances**: Use PM2 cluster mode
   ```bash
   pm2 start src/index.js -i max
   ```

2. **Load Balancer**: Use Nginx for multiple app instances

3. **Database Optimization**:
   - Connection pooling (already implemented)
   - Read replicas for queries
   - Caching with Redis

4. **CDN**: For any static assets or webhook endpoints

### Monitoring Tools

- **Application**: PM2, New Relic, DataDog
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Loggly, Papertrail, ELK Stack
- **Database**: pg_stat_statements, pgAdmin

## 🎓 Next Steps

1. **Add Features**:
   - Spending analysis
   - Budget alerts
   - Recurring transaction detection
   - Multi-language support

2. **Improve UX**:
   - Add more inline keyboards
   - Rich message formatting
   - Charts/graphs (using chart APIs)
   - Transaction categorization

3. **Security Enhancements**:
   - Two-factor authentication
   - IP whitelisting
   - Rate limiting per user
   - Audit logging

## 📚 Additional Resources

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Plaid Documentation](https://plaid.com/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Docker Documentation](https://docs.docker.com/)

---

**Remember**: Telegram IS your GUI. Users interact with your app entirely through their Telegram client. No web frontend needed! 🚀

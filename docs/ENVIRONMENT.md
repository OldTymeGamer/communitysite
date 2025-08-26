# 🔧 Environment Configuration Guide

This guide covers detailed environment variable configuration for the RedM/FiveM community website.

## 📋 Environment Variables Overview

The application uses environment variables for configuration. Copy `.env.example` to `.env.local` and configure the following variables:

## 🔐 Discord Integration

### Discord Application Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token

### Required Discord Variables
```env
# Discord Bot Token (from Bot section)
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Discord Guild (Server) ID
DISCORD_GUILD_ID=your_discord_server_id

# OAuth Application Credentials (from OAuth2 section)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Admin Role IDs (comma-separated)
DISCORD_ADMIN_ROLE_IDS=role_id_1,role_id_2,role_id_3

# OAuth Redirect URI
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/callback/discord
```

### Getting Discord IDs
- **Guild ID**: Enable Developer Mode in Discord → Right-click server → Copy ID
- **Role IDs**: Server Settings → Roles → Right-click role → Copy ID
- **Client ID/Secret**: Discord Developer Portal → Your App → OAuth2

## 🔑 Authentication Configuration

```env
# NextAuth Secret (generate a random string)
NEXTAUTH_SECRET=your_nextauth_secret_here

# NextAuth URL (your domain)
NEXTAUTH_URL=https://yourdomain.com
```

### Generating NextAuth Secret
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🎮 Game Server Integration (RedM/FiveM)

```env
# Server API Key (if your server supports it)
SERVER_API_KEY=your_server_api_key_here

# Game Server Connection Details
GAME_SERVER_IP=your_server_ip
GAME_SERVER_PORT=30120
```

## 🗄️ Database Configuration

```env
# MongoDB Connection String
MONGODB_URI=mongodb://username:password@host:port/database

# Examples:
# Local: mongodb://localhost:27017/community
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/community
# Docker: mongodb://mongo:27017/community
```

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string

## 📧 Email Configuration

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password (not your regular password)

### Other SMTP Providers
```env
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587

# Custom SMTP
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
```

## 🌍 Environment-Specific Configuration

### Development (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord
MONGODB_URI=mongodb://localhost:27017/community_dev
```

### Production (.env.local)
```env
NEXTAUTH_URL=https://your-community.com
DISCORD_REDIRECT_URI=https://your-community.com/api/auth/callback/discord
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/community
```

### Staging (.env.local)
```env
NEXTAUTH_URL=https://staging.your-community.com
DISCORD_REDIRECT_URI=https://staging.your-community.com/api/auth/callback/discord
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/community_staging
```

## 🔒 Security Best Practices

### Environment File Security
- Never commit `.env.local` to version control
- Use different secrets for each environment
- Rotate secrets regularly
- Use strong, random passwords

### Secret Generation
```bash
# Generate random secrets
openssl rand -hex 32
openssl rand -base64 32
node -e "console.log(require('crypto').randomUUID())"
```

### File Permissions
```bash
# Secure environment file permissions
chmod 600 .env.local
chown www-data:www-data .env.local
```

## 🧪 Testing Configuration

### Test Environment Variables
```env
# Use test database
MONGODB_URI=mongodb://localhost:27017/community_test

# Disable external services in tests
DISCORD_BOT_TOKEN=test_token
SMTP_HOST=localhost
```

### Validation Script
Create a script to validate your environment:

```javascript
// scripts/validate-env.js
const requiredVars = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'MONGODB_URI'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

console.log('✅ All required environment variables are set');
```

## 🔍 Troubleshooting

### Common Issues

**Discord OAuth not working:**
- Check redirect URI matches exactly
- Verify client ID and secret
- Ensure bot has proper permissions

**Database connection failed:**
- Verify connection string format
- Check network connectivity
- Confirm database exists

**Email not sending:**
- Test SMTP credentials
- Check firewall/port blocking
- Verify app password (for Gmail)

### Debug Mode
Enable debug logging:
```env
DEBUG=true
NODE_ENV=development
```

### Environment Validation
```bash
# Check if all required variables are set
npm run validate-env

# Test database connection
npm run test-db

# Test email configuration
npm run test-email
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Nodemailer Documentation](https://nodemailer.com/)

---

*For deployment-specific environment configuration, see the [Deployment Guide](./DEPLOYMENT.md).*
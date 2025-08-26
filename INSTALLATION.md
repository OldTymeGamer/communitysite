# 📦 Installation Guide

This guide provides detailed instructions for installing the Community Website on Linux servers.

## 🚀 Quick Installation (Recommended)

The fastest way to get your community website running:

```bash
# Clone the repository
git clone https://github.com/OldTymeGamer/communitysite
cd communitysite

# Run the automated installer
chmod +x install.sh
sudo ./install.sh
```

The installer will guide you through the entire process with interactive prompts.

## 📋 What the Installer Does

### 1. System Detection
- Automatically detects your Linux distribution
- Supports Ubuntu, Debian, CentOS, RHEL, Rocky Linux, Fedora, Arch Linux
- Installs appropriate packages for your system

### 2. Package Installation
- **Node.js 18+** - Latest LTS version from NodeSource
- **npm** - Node package manager
- **Nginx** - Web server and reverse proxy
- **Git** - Version control (if not already installed)
- **Certbot** - SSL certificate management
- **Build tools** - Required for native npm modules

### 3. Interactive Configuration
The installer will prompt you for:

- **Application name** (default: communitysite)
- **Port number** (default: 3000)
- **SSL setup** (recommended for production)
- **Domain name** (if SSL enabled)
- **Admin email** (for SSL certificates)

### 4. Environment Setup
- Creates application directory (`/var/www/your-app-name`)
- Sets up proper user permissions for `www-data`
- Fixes npm permission issues automatically
- Installs PM2 process manager
- Copies and builds your application

### 5. Web Server Configuration
- Configures Nginx as reverse proxy
- Sets up security headers
- Enables gzip compression
- Configures static file caching
- Sets up SSL if requested

### 6. SSL Certificate (Optional)
- Automatically requests Let's Encrypt certificate
- Configures HTTPS redirects
- Sets up auto-renewal

### 7. Process Management
- Configures PM2 for application management
- Sets up automatic restart on failure
- Configures startup scripts
- Creates log rotation

### 8. Security & Monitoring
- Configures firewall (UFW/firewalld)
- Sets up health monitoring
- Creates backup scripts
- Applies security best practices

## 🔧 Manual Installation

If you prefer to install manually or need custom configuration:

### Prerequisites

Install required packages for your distribution:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y curl wget gnupg2 software-properties-common

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git ufw certbot python3-certbot-nginx build-essential
```

**CentOS/RHEL/Rocky Linux:**
```bash
sudo yum update -y
sudo yum install -y curl wget gnupg2

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs nginx git firewalld certbot python3-certbot-nginx gcc-c++ make
```

**Arch Linux:**
```bash
sudo pacman -Syu --noconfirm
sudo pacman -S --noconfirm nodejs npm nginx git ufw certbot certbot-nginx base-devel
```

### Manual Setup Steps

1. **Clone and prepare application:**
   ```bash
   git clone https://github.com/OldTymeGamer/communitysite
   cd communitysite
   sudo mkdir -p /var/www/communitysite
   sudo cp -r ./* /var/www/communitysite/
   sudo chown -R www-data:www-data /var/www/communitysite
   ```

2. **Fix npm permissions:**
   ```bash
   sudo mkdir -p /var/www/.npm-global
   sudo chown -R www-data:www-data /var/www/.npm-global
   sudo -u www-data npm config set prefix '/var/www/.npm-global'
   echo 'export PATH="/var/www/.npm-global/bin:$PATH"' | sudo tee /var/www/.bashrc
   ```

3. **Install PM2 and dependencies:**
   ```bash
   sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install -g pm2'
   cd /var/www/communitysite
   sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install'
   sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm run build'
   ```

4. **Configure environment:**
   ```bash
   sudo cp /var/www/communitysite/.env.example /var/www/communitysite/.env.local
   sudo chown www-data:www-data /var/www/communitysite/.env.local
   sudo nano /var/www/communitysite/.env.local  # Edit with your settings
   ```

5. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/communitysite
   # Add your Nginx configuration (see example below)
   sudo ln -s /etc/nginx/sites-available/communitysite /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   ```

6. **Start services:**
   ```bash
   cd /var/www/communitysite
   sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && pm2 start ecosystem.config.js'
   sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && pm2 save'
   sudo systemctl enable nginx
   sudo systemctl start nginx
   ```

## 📝 Configuration Files

### Environment Variables (.env.local)

```env
# Discord OAuth
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_guild_id
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_ADMIN_ROLE_IDS=role_id_1,role_id_2

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://yourdomain.com
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/callback/discord

# Game Server Configuration
SERVER_API_KEY=your_server_api_key_here
GAME_SERVER_IP=your_server_ip
GAME_SERVER_PORT=30120

# Database
MONGODB_URI=mongodb://localhost:27017/community
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### PM2 Ecosystem Configuration

```javascript
module.exports = {
  apps: [{
    name: 'communitysite',
    script: 'server.js',
    cwd: '/var/www/communitysite',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/communitysite/error.log',
    out_file: '/var/log/communitysite/out.log',
    log_file: '/var/log/communitysite/combined.log',
    time: true
  }]
}
```

## 🔧 Post-Installation

### 1. Configure Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to OAuth2 → General
4. Add redirect URIs:
   - `https://yourdomain.com/api/auth/callback/discord`
   - `http://localhost:3000/api/auth/callback/discord` (for development)
5. Copy Client ID and Client Secret to your `.env.local`

### 2. Set up MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Get connection string and add to `.env.local`

**Option B: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Use connection string: mongodb://localhost:27017/community
```

### 3. Configure SMTP Email

**Gmail Example:**
1. Enable 2-factor authentication
2. Generate app password
3. Use settings:
   - Host: smtp.gmail.com
   - Port: 465
   - User: your-email@gmail.com
   - Pass: your-app-password

### 4. Test Installation

```bash
# Check application status
sudo -u www-data pm2 status

# View logs
sudo -u www-data pm2 logs communitysite

# Test website
curl -I http://localhost:3000
curl -I https://yourdomain.com  # if SSL configured
```

## 🚨 Troubleshooting

For common issues and solutions, see [DEPLOYMENT-TROUBLESHOOTING.md](./DEPLOYMENT-TROUBLESHOOTING.md).

### Quick Fixes

**Application won't start:**
```bash
sudo -u www-data pm2 logs communitysite
sudo -u www-data pm2 restart communitysite
```

**Nginx issues:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Permission issues:**
```bash
sudo chown -R www-data:www-data /var/www/communitysite
sudo chown -R www-data:www-data /var/www/.npm-global
```

## 📞 Support

If you need help:

1. Check the [troubleshooting guide](./DEPLOYMENT-TROUBLESHOOTING.md)
2. Review the logs for error messages
3. Create an issue on GitHub with:
   - Your OS and version
   - Error messages
   - Steps you've tried
   - Output from diagnostic commands

---

**Happy hosting! 🚀**
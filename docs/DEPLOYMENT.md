# Lost Trail RP Community Website - Deployment Guide

This guide covers the complete deployment of the Lost Trail RP community website with Nginx reverse proxy, SSL certificates, and production optimizations.

## Prerequisites

- Ubuntu 20.04+ or Debian 11+ server
- Root access or sudo privileges
- Domain name pointing to your server (losttrailrp.com)
- At least 2GB RAM and 20GB storage

## Quick Deployment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd LostTrail
   ```

2. **Make deployment script executable:**
   ```bash
   chmod +x deploy.sh
   ```

3. **Run deployment script:**
   ```bash
   sudo ./deploy.sh
   ```

The script will automatically:
- Install all required packages (Node.js, Nginx, Certbot)
- Configure Nginx with SSL
- Set up systemd service
- Configure firewall
- Set up monitoring and backups

## Manual Deployment Steps

If you prefer manual deployment or need to customize the process:

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx nodejs npm git curl ufw certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/losttrailrp
sudo chown www-data:www-data /var/www/losttrailrp

# Copy application files
sudo cp -r ./* /var/www/losttrailrp/
sudo chown -R www-data:www-data /var/www/losttrailrp

# Install dependencies and build
cd /var/www/losttrailrp
sudo -u www-data npm install
sudo -u www-data npm run build
```

### 3. Environment Configuration

Create `/var/www/losttrailrp/.env.local`:

```bash
# RedM API Key for server sync
REDM_API_KEY=your_redm_api_key_here
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_guild_id
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_ADMIN_ROLE_IDS=role_id_1,role_id_2
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://losttrailrp.com
DISCORD_REDIRECT_URI=https://losttrailrp.com/api/auth/callback/discord

REDM_SERVER_IP=173.208.177.138
REDM_SERVER_PORT=30126

MONGODB_URI=your_mongodb_connection_string

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

### 4. Nginx Configuration

```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/losttrailrp
sudo ln -s /etc/nginx/sites-available/losttrailrp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

### 5. SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d losttrailrp.com -d www.losttrailrp.com
```

### 6. Systemd Service

```bash
# Copy service file
sudo cp losttrailrp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable losttrailrp
sudo systemctl start losttrailrp
```

### 7. Firewall Configuration

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

## Configuration Files

### Nginx Configuration (`nginx.conf`)

The provided Nginx configuration includes:
- SSL/TLS termination with modern security settings
- HTTP to HTTPS redirect
- Static file caching
- Rate limiting for API endpoints
- Security headers
- Gzip compression
- Reverse proxy to Next.js application

### Systemd Service (`losttrailrp.service`)

The systemd service configuration provides:
- Automatic restart on failure
- Security hardening
- Proper logging
- Environment variable management

### Environment Variables

Key environment variables that need to be configured:

- `REDM_API_KEY`: API key for RedM server integration
- `DISCORD_BOT_TOKEN`: Discord bot token for authentication
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `SMTP_*`: Email configuration for notifications

## Monitoring and Maintenance

### Service Status

```bash
# Check application status
sudo systemctl status losttrailrp

# Check Nginx status
sudo systemctl status nginx

# View application logs
sudo journalctl -u losttrailrp -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Automatic Monitoring

The deployment script sets up automatic monitoring that:
- Checks service health every 5 minutes
- Automatically restarts failed services
- Monitors disk and memory usage
- Logs issues to `/var/log/losttrailrp/monitor.log`

### Backups

Automatic daily backups are configured to:
- Backup application files
- Backup Nginx configuration
- Retain backups for 7 days
- Store backups in `/var/backups/losttrailrp/`

### Manual Backup

```bash
# Run backup manually
sudo /usr/local/bin/losttrailrp-backup.sh
```

## Troubleshooting

### Common Issues

1. **Application won't start:**
   ```bash
   sudo journalctl -u losttrailrp -n 50
   ```

2. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   ```

3. **SSL certificate issues:**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **Database connection issues:**
   - Check MongoDB URI in environment variables
   - Verify network connectivity to MongoDB

5. **Discord authentication issues:**
   - Verify Discord application settings
   - Check redirect URIs match configuration

### Performance Optimization

1. **Enable HTTP/2:**
   - Already configured in nginx.conf

2. **Database optimization:**
   - Ensure MongoDB indexes are properly set
   - Monitor query performance

3. **CDN integration:**
   - Consider using Cloudflare for static assets
   - Configure appropriate cache headers

### Security Considerations

1. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade
   sudo npm audit fix
   ```

2. **SSL certificate renewal:**
   - Certbot automatically renews certificates
   - Monitor renewal logs: `sudo journalctl -u certbot.timer`

3. **Firewall rules:**
   - Regularly review UFW rules
   - Monitor access logs for suspicious activity

4. **Environment variables:**
   - Keep sensitive data in environment files
   - Never commit secrets to version control

## Support

For deployment issues or questions:
1. Check the logs first
2. Review this documentation
3. Check the GitHub repository for updates
4. Contact the development team

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
cd /var/www/losttrailrp
sudo git pull origin main

# Install new dependencies
sudo -u www-data npm install

# Rebuild application
sudo -u www-data npm run build

# Restart service
sudo systemctl restart losttrailrp
```

### SSL Certificate Renewal

Certificates are automatically renewed by certbot. To check renewal status:

```bash
sudo certbot certificates
sudo systemctl status certbot.timer
```

This deployment configuration provides a robust, secure, and scalable foundation for the Lost Trail RP community website.
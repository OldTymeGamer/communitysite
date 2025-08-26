#!/bin/bash

# Lost Trail RP Community Website Deployment Script
# This script handles the complete deployment of the Next.js application with Nginx

set -e

# Configuration
APP_NAME="losttrailrp"
APP_DIR="/var/www/losttrailrp"
NGINX_CONF="/etc/nginx/sites-available/losttrailrp"
NGINX_ENABLED="/etc/nginx/sites-enabled/losttrailrp"
SERVICE_FILE="/etc/systemd/system/losttrailrp.service"
USER="www-data"
GROUP="www-data"

echo "🚀 Starting deployment of Lost Trail RP Community Website..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
apt install -y nginx nodejs npm git curl ufw certbot python3-certbot-nginx

# Install PM2 for process management (alternative to systemd)
sudo -u $USER bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install -g pm2'

# Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
chown $USER:$GROUP $APP_DIR

# Stop existing services
echo "🛑 Stopping existing services..."
systemctl stop nginx || true
systemctl stop $APP_NAME || true
pm2 stop $APP_NAME || true

# Copy application files
echo "📋 Copying application files..."
cp -r ./* $APP_DIR/
chown -R $USER:$GROUP $APP_DIR

# Fix npm permissions
echo "🔧 Fixing npm permissions..."
mkdir -p /var/www/.npm-global
chown -R $USER:$GROUP /var/www/.npm-global
sudo -u $USER npm config set prefix '/var/www/.npm-global'
if [ -d "/var/www/.npm" ]; then
    chown -R $USER:$GROUP /var/www/.npm
fi
sudo -u $USER bash -c 'echo "prefix=/var/www/.npm-global" > /var/www/.npmrc'

# Install dependencies and build
echo "🔨 Installing dependencies and building application..."
cd $APP_DIR
sudo -u $USER bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install'
sudo -u $USER bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm run build'

# Copy Nginx configuration
echo "🌐 Configuring Nginx..."
cp nginx.conf $NGINX_CONF
ln -sf $NGINX_CONF $NGINX_ENABLED

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Copy systemd service file
echo "⚙️ Setting up systemd service..."
cp losttrailrp.service $SERVICE_FILE
systemctl daemon-reload
systemctl enable $APP_NAME

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80
ufw allow 443

# SSL Certificate setup (Let's Encrypt)
echo "🔒 Setting up SSL certificate..."
# Note: Replace with your actual domain
DOMAIN="losttrailrp.com"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Start services
echo "🚀 Starting services..."
systemctl start $APP_NAME
systemctl start nginx

# Enable services to start on boot
systemctl enable nginx
systemctl enable $APP_NAME

# Check service status
echo "✅ Checking service status..."
systemctl status $APP_NAME --no-pager
systemctl status nginx --no-pager

# Setup log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/losttrailrp << EOF
/var/log/nginx/access.log /var/log/nginx/error.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Setup PM2 startup (alternative process manager)
echo "🔄 Setting up PM2 startup..."
sudo -u $USER bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && pm2 start '$APP_DIR'/ecosystem.config.js'
sudo -u $USER bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && pm2 save'
sudo -u $USER bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && pm2 startup systemd -u '$USER' --hp /var/www'

# Create ecosystem.config.js for PM2
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'losttrailrp',
    script: 'server.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/losttrailrp/error.log',
    out_file: '/var/log/losttrailrp/out.log',
    log_file: '/var/log/losttrailrp/combined.log',
    time: true
  }]
}
EOF

# Create log directory
mkdir -p /var/log/losttrailrp
chown $USER:$GROUP /var/log/losttrailrp

# Setup monitoring script
echo "📊 Setting up monitoring..."
cat > /usr/local/bin/losttrailrp-monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script for Lost Trail RP website

APP_NAME="losttrailrp"
LOG_FILE="/var/log/losttrailrp/monitor.log"

# Check if application is running
if ! systemctl is-active --quiet $APP_NAME; then
    echo "$(date): $APP_NAME service is down, attempting restart..." >> $LOG_FILE
    systemctl restart $APP_NAME
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx service is down, attempting restart..." >> $LOG_FILE
    systemctl restart nginx
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "$(date): Disk usage is at ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
    echo "$(date): Memory usage is at ${MEM_USAGE}%" >> $LOG_FILE
fi
EOF

chmod +x /usr/local/bin/losttrailrp-monitor.sh

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/losttrailrp-monitor.sh") | crontab -

# Setup backup script
echo "💾 Setting up backup script..."
cat > /usr/local/bin/losttrailrp-backup.sh << 'EOF'
#!/bin/bash
# Backup script for Lost Trail RP website

BACKUP_DIR="/var/backups/losttrailrp"
APP_DIR="/var/www/losttrailrp"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Backup Nginx configuration
cp /etc/nginx/sites-available/losttrailrp $BACKUP_DIR/nginx_$DATE.conf

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.conf" -mtime +7 -delete

echo "$(date): Backup completed - $BACKUP_DIR/app_$DATE.tar.gz"
EOF

chmod +x /usr/local/bin/losttrailrp-backup.sh

# Add backup to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/losttrailrp-backup.sh") | crontab -

# Final status check
echo "🎉 Deployment completed!"
echo ""
echo "📊 Service Status:"
echo "=================="
systemctl status $APP_NAME --no-pager -l
echo ""
systemctl status nginx --no-pager -l
echo ""
echo "🌐 Website should be accessible at:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "📝 Logs can be found at:"
echo "   Application: journalctl -u $APP_NAME -f"
echo "   Nginx: tail -f /var/log/nginx/access.log"
echo "   Monitor: tail -f /var/log/losttrailrp/monitor.log"
echo ""
echo "🔧 Useful commands:"
echo "   Restart app: systemctl restart $APP_NAME"
echo "   Restart nginx: systemctl restart nginx"
echo "   View logs: journalctl -u $APP_NAME -f"
echo "   Check status: systemctl status $APP_NAME"
echo ""
echo "✅ Deployment successful!"
EOF
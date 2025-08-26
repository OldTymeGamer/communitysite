#!/bin/bash

# Interactive Community Website Deployment Script
# This script provides a guided deployment experience with user input

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
DEFAULT_APP_NAME="communitysite"
DEFAULT_DOMAIN="example.com"
DEFAULT_EMAIL="admin@example.com"
DEFAULT_PORT="3000"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Function to prompt for user input
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        echo -e "${CYAN}$prompt${NC} ${YELLOW}(default: $default)${NC}: "
    else
        echo -e "${CYAN}$prompt${NC}: "
    fi
    
    read -r input
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi
    
    eval "$var_name='$input'"
}

# Function to prompt for yes/no
prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    
    while true; do
        if [ "$default" = "y" ]; then
            echo -e "${CYAN}$prompt${NC} ${YELLOW}(Y/n)${NC}: "
        else
            echo -e "${CYAN}$prompt${NC} ${YELLOW}(y/N)${NC}: "
        fi
        
        read -r yn
        
        if [ -z "$yn" ]; then
            yn="$default"
        fi
        
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Function to detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    
    print_info "Detected OS: $OS $VER"
}

# Function to install packages based on OS
install_packages() {
    print_header "Installing System Dependencies"
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        print_info "Installing packages for Ubuntu/Debian..."
        apt update
        apt install -y nodejs npm nginx git curl ufw certbot python3-certbot-nginx build-essential
        
        # Check Node.js version
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_warning "Node.js version is too old. Installing Node.js 18..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
        fi
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]]; then
        print_info "Installing packages for CentOS/RHEL/Rocky..."
        yum update -y
        yum install -y nodejs npm nginx git curl firewalld certbot python3-certbot-nginx gcc-c++ make
        
    elif [[ "$OS" == *"Arch"* ]]; then
        print_info "Installing packages for Arch Linux..."
        pacman -Syu --noconfirm
        pacman -S --noconfirm nodejs npm nginx git curl ufw certbot certbot-nginx base-devel
        
    else
        print_error "Unsupported operating system: $OS"
        print_info "Please install the following packages manually:"
        print_info "- nodejs (18+), npm, nginx, git, curl, certbot, python3-certbot-nginx"
        if ! prompt_yes_no "Continue anyway?" "n"; then
            exit 1
        fi
    fi
    
    print_status "System packages installed successfully"
}

# Function to fix npm permissions
fix_npm_permissions() {
    print_header "Fixing npm Permission Issues"
    
    # Create npm global directory for www-data user
    mkdir -p /var/www/.npm-global
    chown -R www-data:www-data /var/www/.npm-global
    
    # Set npm config for www-data user
    sudo -u www-data npm config set prefix '/var/www/.npm-global'
    
    # Fix existing npm cache permissions
    if [ -d "/var/www/.npm" ]; then
        chown -R www-data:www-data /var/www/.npm
    fi
    
    # Create .npmrc for www-data user
    sudo -u www-data bash -c 'echo "prefix=/var/www/.npm-global" > /var/www/.npmrc'
    
    print_status "npm permissions fixed"
}

# Function to install PM2
install_pm2() {
    print_header "Installing PM2 Process Manager"
    
    # Install PM2 globally for www-data user
    sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install -g pm2'
    
    # Add PM2 to PATH for www-data
    echo 'export PATH="/var/www/.npm-global/bin:$PATH"' >> /var/www/.bashrc
    
    print_status "PM2 installed successfully"
}

# Function to collect configuration
collect_config() {
    print_header "Configuration Setup"
    
    echo ""
    print_info "Please provide the following information for your deployment:"
    echo ""
    
    prompt_input "Application name" "$DEFAULT_APP_NAME" "APP_NAME"
    prompt_input "Domain name (without www)" "$DEFAULT_DOMAIN" "DOMAIN"
    prompt_input "Admin email address" "$DEFAULT_EMAIL" "ADMIN_EMAIL"
    prompt_input "Application port" "$DEFAULT_PORT" "APP_PORT"
    
    # Derived values
    APP_DIR="/var/www/$APP_NAME"
    NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
    NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"
    SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"
    
    echo ""
    print_info "Configuration Summary:"
    echo "  App Name: $APP_NAME"
    echo "  Domain: $DOMAIN"
    echo "  App Directory: $APP_DIR"
    echo "  Port: $APP_PORT"
    echo "  Admin Email: $ADMIN_EMAIL"
    echo ""
    
    if ! prompt_yes_no "Is this configuration correct?" "y"; then
        print_info "Please run the script again with correct information."
        exit 1
    fi
}

# Function to setup environment file
setup_environment() {
    print_header "Environment Configuration"
    
    if [ -f ".env.example" ]; then
        print_info "Found .env.example file. Creating .env.local..."
        cp .env.example .env.local
        
        print_info "Please edit the .env.local file with your configuration:"
        print_info "- Discord OAuth credentials"
        print_info "- MongoDB connection string"
        print_info "- SMTP email settings"
        print_info "- Game server details"
        
        if prompt_yes_no "Would you like to edit the environment file now?" "y"; then
            ${EDITOR:-nano} .env.local
        fi
    else
        print_warning "No .env.example file found. You'll need to create .env.local manually."
    fi
}

# Function to deploy application
deploy_application() {
    print_header "Deploying Application"
    
    # Create application directory
    print_info "Creating application directory..."
    mkdir -p "$APP_DIR"
    chown www-data:www-data "$APP_DIR"
    
    # Stop existing services
    print_info "Stopping existing services..."
    systemctl stop nginx || true
    systemctl stop "$APP_NAME" || true
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 stop $APP_NAME" || true
    
    # Copy application files
    print_info "Copying application files..."
    cp -r ./* "$APP_DIR/"
    chown -R www-data:www-data "$APP_DIR"
    
    # Install dependencies and build
    print_info "Installing dependencies and building application..."
    cd "$APP_DIR"
    
    # Set PATH for www-data user and install dependencies
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && npm install"
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && npm run build"
    
    print_status "Application deployed successfully"
}

# Function to configure Nginx
configure_nginx() {
    print_header "Configuring Nginx"
    
    # Create Nginx configuration
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuration will be added by certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location /_next/static {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Favicon
    location /favicon.ico {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
    
    # Enable site
    ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if nginx -t; then
        print_status "Nginx configuration is valid"
    else
        print_error "Nginx configuration is invalid"
        exit 1
    fi
}

# Function to setup systemd service
setup_systemd_service() {
    print_header "Setting up Systemd Service"
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=$APP_NAME Community Website
Documentation=https://nextjs.org/docs
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
Environment=PATH=/var/www/.npm-global/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$APP_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "$APP_NAME"
    
    print_status "Systemd service configured"
}

# Function to setup PM2
setup_pm2() {
    print_header "Setting up PM2 Process Manager"
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    error_file: '/var/log/$APP_NAME/error.log',
    out_file: '/var/log/$APP_NAME/out.log',
    log_file: '/var/log/$APP_NAME/combined.log',
    time: true
  }]
}
EOF
    
    # Create log directory
    mkdir -p "/var/log/$APP_NAME"
    chown www-data:www-data "/var/log/$APP_NAME"
    
    # Start PM2
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && cd $APP_DIR && pm2 start ecosystem.config.js"
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 save"
    
    # Setup PM2 startup
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 startup systemd -u www-data --hp /var/www"
    
    print_status "PM2 configured and started"
}

# Function to configure firewall
configure_firewall() {
    print_header "Configuring Firewall"
    
    if command -v ufw >/dev/null 2>&1; then
        ufw --force enable
        ufw allow ssh
        ufw allow 'Nginx Full'
        ufw allow 80
        ufw allow 443
        print_status "UFW firewall configured"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_status "Firewalld configured"
    else
        print_warning "No firewall detected. Please configure your firewall manually."
    fi
}

# Function to setup SSL
setup_ssl() {
    print_header "Setting up SSL Certificate"
    
    if prompt_yes_no "Would you like to set up SSL with Let's Encrypt?" "y"; then
        print_info "Setting up SSL certificate for $DOMAIN..."
        
        # Start nginx first
        systemctl start nginx
        
        if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL"; then
            print_status "SSL certificate installed successfully"
        else
            print_warning "SSL certificate installation failed. You can set it up manually later."
        fi
    else
        print_info "Skipping SSL setup. You can configure it manually later."
    fi
}

# Function to start services
start_services() {
    print_header "Starting Services"
    
    # Start application service
    systemctl start "$APP_NAME"
    systemctl start nginx
    
    # Check service status
    if systemctl is-active --quiet "$APP_NAME"; then
        print_status "Application service is running"
    else
        print_error "Application service failed to start"
        print_info "Check logs with: journalctl -u $APP_NAME -f"
    fi
    
    if systemctl is-active --quiet nginx; then
        print_status "Nginx service is running"
    else
        print_error "Nginx service failed to start"
        print_info "Check logs with: journalctl -u nginx -f"
    fi
}

# Function to setup monitoring
setup_monitoring() {
    print_header "Setting up Monitoring"
    
    # Create monitoring script
    cat > "/usr/local/bin/$APP_NAME-monitor.sh" << EOF
#!/bin/bash
# Monitoring script for $APP_NAME

APP_NAME="$APP_NAME"
LOG_FILE="/var/log/$APP_NAME/monitor.log"

# Check if application is running
if ! systemctl is-active --quiet \$APP_NAME; then
    echo "\$(date): \$APP_NAME service is down, attempting restart..." >> \$LOG_FILE
    systemctl restart \$APP_NAME
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "\$(date): Nginx service is down, attempting restart..." >> \$LOG_FILE
    systemctl restart nginx
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 90 ]; then
    echo "\$(date): Disk usage is at \${DISK_USAGE}%" >> \$LOG_FILE
fi

# Check memory usage
MEM_USAGE=\$(free | awk 'NR==2{printf "%.2f", \$3*100/\$2}')
if (( \$(echo "\$MEM_USAGE > 90" | bc -l) )); then
    echo "\$(date): Memory usage is at \${MEM_USAGE}%" >> \$LOG_FILE
fi
EOF
    
    chmod +x "/usr/local/bin/$APP_NAME-monitor.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/$APP_NAME-monitor.sh") | crontab -
    
    print_status "Monitoring script installed"
}

# Function to display final information
display_final_info() {
    print_header "Deployment Complete!"
    
    echo ""
    print_status "Your community website has been deployed successfully!"
    echo ""
    print_info "🌐 Website URLs:"
    echo "   http://$DOMAIN"
    echo "   http://www.$DOMAIN"
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        echo "   https://$DOMAIN"
        echo "   https://www.$DOMAIN"
    fi
    echo ""
    print_info "📝 Useful Commands:"
    echo "   Restart app:     systemctl restart $APP_NAME"
    echo "   Restart nginx:   systemctl restart nginx"
    echo "   View app logs:   journalctl -u $APP_NAME -f"
    echo "   View nginx logs: tail -f /var/log/nginx/access.log"
    echo "   PM2 status:      sudo -u www-data pm2 status"
    echo ""
    print_info "📁 Important Paths:"
    echo "   App directory:   $APP_DIR"
    echo "   Nginx config:    $NGINX_CONF"
    echo "   Service file:    $SERVICE_FILE"
    echo "   Environment:     $APP_DIR/.env.local"
    echo ""
    print_warning "🔧 Next Steps:"
    echo "1. Edit $APP_DIR/.env.local with your configuration"
    echo "2. Restart the application: systemctl restart $APP_NAME"
    echo "3. Test your website in a browser"
    echo "4. Configure your Discord application OAuth settings"
    echo ""
}

# Main execution
main() {
    print_header "Interactive Community Website Deployment"
    echo ""
    print_info "This script will guide you through deploying your community website."
    print_info "It will install all required dependencies and configure your server."
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
    
    # Detect OS
    detect_os
    
    # Collect configuration
    collect_config
    
    # Install system packages
    install_packages
    
    # Fix npm permissions
    fix_npm_permissions
    
    # Install PM2
    install_pm2
    
    # Setup environment
    setup_environment
    
    # Deploy application
    deploy_application
    
    # Configure Nginx
    configure_nginx
    
    # Setup systemd service
    setup_systemd_service
    
    # Setup PM2 (alternative to systemd)
    setup_pm2
    
    # Configure firewall
    configure_firewall
    
    # Setup SSL
    setup_ssl
    
    # Start services
    start_services
    
    # Setup monitoring
    setup_monitoring
    
    # Display final information
    display_final_info
}

# Run main function
main "$@"
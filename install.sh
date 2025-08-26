#!/bin/bash

# Community Website Installation Script
# One-command installation for Linux servers with interactive configuration

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
DEFAULT_PORT="3000"

# Global variables
APP_NAME=""
APP_PORT=""
APP_DIR=""
DOMAIN=""
ADMIN_EMAIL=""
SETUP_SSL=false
OS_TYPE=""
DISTRO=""

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

print_step() {
    echo -e "${CYAN}📋 $1${NC}"
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

# Function to detect OS and distribution
detect_os() {
    print_step "Detecting operating system..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_TYPE=$ID
        DISTRO=$NAME
    elif type lsb_release >/dev/null 2>&1; then
        OS_TYPE=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
        DISTRO=$(lsb_release -sd)
    else
        OS_TYPE=$(uname -s | tr '[:upper:]' '[:lower:]')
        DISTRO="Unknown"
    fi
    
    print_info "Detected: $DISTRO"
    
    # Normalize OS type
    case $OS_TYPE in
        ubuntu|debian)
            OS_TYPE="debian"
            ;;
        centos|rhel|rocky|almalinux|fedora)
            OS_TYPE="redhat"
            ;;
        arch|manjaro)
            OS_TYPE="arch"
            ;;
        *)
            print_warning "Unsupported OS: $OS_TYPE"
            print_info "Supported: Ubuntu, Debian, CentOS, RHEL, Rocky Linux, Fedora, Arch Linux"
            if ! prompt_yes_no "Continue anyway?" "n"; then
                exit 1
            fi
            ;;
    esac
}

# Function to install system packages
install_system_packages() {
    print_step "Installing system packages..."
    
    case $OS_TYPE in
        debian)
            print_info "Installing packages for Debian/Ubuntu..."
            apt update
            apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
            
            # Install Node.js 18
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt install -y nodejs
            
            # Install other packages
            apt install -y nginx git ufw certbot python3-certbot-nginx build-essential
            ;;
            
        redhat)
            print_info "Installing packages for RedHat/CentOS/Fedora..."
            
            if command -v dnf >/dev/null 2>&1; then
                PKG_MANAGER="dnf"
            else
                PKG_MANAGER="yum"
            fi
            
            $PKG_MANAGER update -y
            $PKG_MANAGER install -y curl wget gnupg2
            
            # Install Node.js 18
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
            $PKG_MANAGER install -y nodejs
            
            # Install other packages
            $PKG_MANAGER install -y nginx git firewalld certbot python3-certbot-nginx gcc-c++ make
            ;;
            
        arch)
            print_info "Installing packages for Arch Linux..."
            pacman -Syu --noconfirm
            pacman -S --noconfirm nodejs npm nginx git ufw certbot certbot-nginx base-devel
            ;;
            
        *)
            print_error "Package installation not supported for $OS_TYPE"
            print_info "Please install manually: nodejs (18+), npm, nginx, git, certbot"
            if ! prompt_yes_no "Continue anyway?" "n"; then
                exit 1
            fi
            ;;
    esac
    
    # Verify Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version $NODE_VERSION is too old. Need 18+"
        exit 1
    fi
    
    print_status "System packages installed successfully"
    print_info "Node.js version: $(node --version)"
    print_info "npm version: $(npm --version)"
}

# Function to collect configuration from user
collect_configuration() {
    print_header "Configuration Setup"
    
    echo ""
    print_info "Let's configure your community website installation."
    echo ""
    
    # Basic configuration
    prompt_input "Application name" "$DEFAULT_APP_NAME" "APP_NAME"
    prompt_input "Application port" "$DEFAULT_PORT" "APP_PORT"
    
    # Derived paths
    APP_DIR="/var/www/$APP_NAME"
    
    echo ""
    print_info "SSL Certificate Setup (recommended for production)"
    if prompt_yes_no "Would you like to set up SSL with Let's Encrypt?" "y"; then
        SETUP_SSL=true
        prompt_input "Domain name (without www, e.g., example.com)" "" "DOMAIN"
        prompt_input "Admin email for SSL certificate" "" "ADMIN_EMAIL"
        
        if [ -z "$DOMAIN" ] || [ -z "$ADMIN_EMAIL" ]; then
            print_error "Domain and email are required for SSL setup"
            exit 1
        fi
    fi
    
    echo ""
    print_info "Configuration Summary:"
    echo "  App Name: $APP_NAME"
    echo "  App Port: $APP_PORT"
    echo "  App Directory: $APP_DIR"
    if [ "$SETUP_SSL" = true ]; then
        echo "  Domain: $DOMAIN"
        echo "  SSL: Enabled"
        echo "  Admin Email: $ADMIN_EMAIL"
    else
        echo "  SSL: Disabled"
    fi
    echo ""
    
    if ! prompt_yes_no "Is this configuration correct?" "y"; then
        print_info "Please run the script again with correct information."
        exit 1
    fi
}

# Function to setup application user and directories
setup_application_environment() {
    print_step "Setting up application environment..."
    
    # Create application directory
    mkdir -p "$APP_DIR"
    
    # Ensure www-data user exists and has proper setup
    if ! id "www-data" &>/dev/null; then
        useradd -r -s /bin/bash -d /var/www -m www-data
    fi
    
    # Create www-data home directory if it doesn't exist
    if [ ! -d "/var/www" ]; then
        mkdir -p /var/www
        chown www-data:www-data /var/www
    fi
    
    # Set up npm environment for www-data
    mkdir -p /var/www/.npm-global
    chown -R www-data:www-data /var/www/.npm-global
    
    # Configure npm for www-data user
    sudo -u www-data npm config set prefix '/var/www/.npm-global'
    
    # Create .bashrc for www-data with PATH
    echo 'export PATH="/var/www/.npm-global/bin:$PATH"' > /var/www/.bashrc
    chown www-data:www-data /var/www/.bashrc
    
    # Fix any existing npm permission issues
    if [ -d "/var/www/.npm" ]; then
        chown -R www-data:www-data /var/www/.npm
    fi
    
    print_status "Application environment configured"
}

# Function to install PM2
install_pm2() {
    print_step "Installing PM2 process manager..."
    
    # Install PM2 globally for www-data user
    sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install -g pm2'
    
    print_status "PM2 installed successfully"
}

# Function to deploy application
deploy_application() {
    print_step "Deploying application files..."
    
    # Stop any existing services
    systemctl stop nginx || true
    systemctl stop "$APP_NAME" || true
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 stop $APP_NAME" || true
    
    # Copy application files
    cp -r ./* "$APP_DIR/"
    chown -R www-data:www-data "$APP_DIR"
    
    # Install dependencies
    print_info "Installing npm dependencies..."
    cd "$APP_DIR"
    sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install'
    
    # Build application
    print_info "Building application..."
    sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm run build'
    
    print_status "Application deployed successfully"
}

# Function to setup environment configuration
setup_environment_config() {
    print_step "Setting up environment configuration..."
    
    if [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env.local"
        chown www-data:www-data "$APP_DIR/.env.local"
        
        print_info "Environment file created at $APP_DIR/.env.local"
        print_warning "You'll need to configure the following in .env.local:"
        echo "  - Discord OAuth credentials"
        echo "  - MongoDB connection string"
        echo "  - SMTP email settings"
        echo "  - Game server details"
        echo ""
        
        if prompt_yes_no "Would you like to edit the environment file now?" "y"; then
            ${EDITOR:-nano} "$APP_DIR/.env.local"
        fi
    else
        print_warning "No .env.example found. You'll need to create .env.local manually."
    fi
}

# Function to configure Nginx
configure_nginx() {
    print_step "Configuring Nginx..."
    
    # Create Nginx configuration
    NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
    
    if [ "$SETUP_SSL" = true ]; then
        # Configuration with SSL placeholder
        cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS (will be configured by certbot)
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
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /favicon.ico {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
    else
        # HTTP only configuration
        cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name localhost;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
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
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /favicon.ico {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
    fi
    
    # Enable site
    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$APP_NAME"
    
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

# Function to setup PM2 configuration
setup_pm2_config() {
    print_step "Setting up PM2 configuration..."
    
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
    
    print_status "PM2 configuration created"
}

# Function to configure firewall
configure_firewall() {
    print_step "Configuring firewall..."
    
    case $OS_TYPE in
        debian|arch)
            if command -v ufw >/dev/null 2>&1; then
                ufw --force enable
                ufw allow ssh
                ufw allow 'Nginx Full'
                ufw allow 80
                ufw allow 443
                print_status "UFW firewall configured"
            else
                print_warning "UFW not available. Please configure firewall manually."
            fi
            ;;
            
        redhat)
            if command -v firewall-cmd >/dev/null 2>&1; then
                systemctl enable firewalld
                systemctl start firewalld
                firewall-cmd --permanent --add-service=ssh
                firewall-cmd --permanent --add-service=http
                firewall-cmd --permanent --add-service=https
                firewall-cmd --reload
                print_status "Firewalld configured"
            else
                print_warning "Firewalld not available. Please configure firewall manually."
            fi
            ;;
    esac
}

# Function to setup SSL certificate
setup_ssl_certificate() {
    if [ "$SETUP_SSL" = true ]; then
        print_step "Setting up SSL certificate..."
        
        # Start nginx first
        systemctl start nginx
        
        # Wait a moment for nginx to start
        sleep 2
        
        print_info "Requesting SSL certificate for $DOMAIN..."
        if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL"; then
            print_status "SSL certificate installed successfully"
        else
            print_warning "SSL certificate installation failed."
            print_info "You can set it up manually later with:"
            print_info "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
        fi
    fi
}

# Function to start services
start_services() {
    print_step "Starting services..."
    
    # Start PM2 application
    cd "$APP_DIR"
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 start ecosystem.config.js"
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 save"
    
    # Setup PM2 startup
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 startup systemd -u www-data --hp /var/www" | grep -E '^sudo' | bash || true
    
    # Start nginx
    systemctl enable nginx
    systemctl start nginx
    
    # Check services
    sleep 3
    
    if sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 list" | grep -q "$APP_NAME"; then
        print_status "Application is running"
    else
        print_error "Application failed to start"
        print_info "Check logs with: sudo -u www-data pm2 logs $APP_NAME"
    fi
    
    if systemctl is-active --quiet nginx; then
        print_status "Nginx is running"
    else
        print_error "Nginx failed to start"
        print_info "Check logs with: journalctl -u nginx -f"
    fi
}

# Function to setup monitoring
setup_monitoring() {
    print_step "Setting up monitoring..."
    
    # Create monitoring script
    cat > "/usr/local/bin/$APP_NAME-monitor.sh" << EOF
#!/bin/bash
# Monitoring script for $APP_NAME

APP_NAME="$APP_NAME"
LOG_FILE="/var/log/$APP_NAME/monitor.log"

# Check if PM2 process is running
if ! sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 list" | grep -q "\$APP_NAME.*online"; then
    echo "\$(date): \$APP_NAME is down, attempting restart..." >> \$LOG_FILE
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 restart \$APP_NAME"
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "\$(date): Nginx is down, attempting restart..." >> \$LOG_FILE
    systemctl restart nginx
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 90 ]; then
    echo "\$(date): Disk usage is at \${DISK_USAGE}%" >> \$LOG_FILE
fi
EOF
    
    chmod +x "/usr/local/bin/$APP_NAME-monitor.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/$APP_NAME-monitor.sh") | crontab -
    
    print_status "Monitoring script installed"
}

# Function to display final information
display_completion_info() {
    print_header "Installation Complete! 🎉"
    
    echo ""
    print_status "Your community website has been successfully installed!"
    echo ""
    
    if [ "$SETUP_SSL" = true ]; then
        print_info "🌐 Your website is available at:"
        echo "   https://$DOMAIN"
        echo "   https://www.$DOMAIN"
    else
        print_info "🌐 Your website is available at:"
        echo "   http://localhost:$APP_PORT"
        echo "   http://$(hostname -I | awk '{print $1}'):$APP_PORT"
    fi
    
    echo ""
    print_info "📁 Important Paths:"
    echo "   App Directory: $APP_DIR"
    echo "   Environment File: $APP_DIR/.env.local"
    echo "   Nginx Config: /etc/nginx/sites-available/$APP_NAME"
    echo "   Logs: /var/log/$APP_NAME/"
    
    echo ""
    print_info "🔧 Management Commands:"
    echo "   Check status:    sudo -u www-data pm2 status"
    echo "   View logs:       sudo -u www-data pm2 logs $APP_NAME"
    echo "   Restart app:     sudo -u www-data pm2 restart $APP_NAME"
    echo "   Restart nginx:   systemctl restart nginx"
    
    echo ""
    print_warning "🔧 Next Steps:"
    echo "1. Edit $APP_DIR/.env.local with your configuration:"
    echo "   - Discord OAuth credentials"
    echo "   - MongoDB connection string"
    echo "   - SMTP email settings"
    echo "   - Game server details"
    echo ""
    echo "2. Restart the application:"
    echo "   sudo -u www-data pm2 restart $APP_NAME"
    echo ""
    echo "3. Test your website in a browser"
    echo ""
    echo "4. Configure your Discord application OAuth settings"
    
    if [ "$SETUP_SSL" = false ]; then
        echo ""
        print_info "💡 To add SSL later, run:"
        echo "   sudo certbot --nginx"
    fi
    
    echo ""
    print_status "Installation completed successfully! 🚀"
}

# Main installation function
main() {
    print_header "Community Website Installation Script"
    echo ""
    print_info "This script will install and configure your community website."
    print_info "It will guide you through the entire setup process."
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        print_info "Make sure you're in the directory containing package.json"
        exit 1
    fi
    
    # Run installation steps
    detect_os
    collect_configuration
    install_system_packages
    setup_application_environment
    install_pm2
    deploy_application
    setup_environment_config
    configure_nginx
    setup_pm2_config
    configure_firewall
    setup_ssl_certificate
    start_services
    setup_monitoring
    display_completion_info
}

# Run main function
main "$@"
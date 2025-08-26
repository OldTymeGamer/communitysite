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
            apt install -y nginx git ufw certbot python3-certbot-nginx build-essential dnsutils openssl
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
            $PKG_MANAGER install -y nginx git firewalld certbot python3-certbot-nginx gcc-c++ make bind-utils openssl
            ;;
            
        arch)
            print_info "Installing packages for Arch Linux..."
            pacman -Syu --noconfirm
            pacman -S --noconfirm nodejs npm nginx git ufw certbot certbot-nginx base-devel bind openssl
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

# Function to collect all configuration from user
collect_configuration() {
    while true; do
        collect_all_config
        display_config_summary
        
        if prompt_yes_no "Is all configuration correct?" "y"; then
            break
        else
            modify_configuration
        fi
    done
}

# Function to collect all configuration
collect_all_config() {
    print_header "Configuration Setup"
    
    echo ""
    print_info "Let's configure your community website installation."
    print_info "You'll be prompted for all required settings."
    echo ""
    
    # Basic application configuration
    print_step "Basic Application Settings"
    prompt_input "Application name" "$DEFAULT_APP_NAME" "APP_NAME"
    prompt_input "Application port" "$DEFAULT_PORT" "APP_PORT"
    
    # Derived paths
    APP_DIR="/var/www/$APP_NAME"
    
    # SSL Configuration
    echo ""
    print_step "SSL Certificate Setup (recommended for production)"
    if prompt_yes_no "Would you like to set up SSL with Let's Encrypt?" "y"; then
        SETUP_SSL=true
        prompt_input "Domain name (without www, e.g., example.com)" "" "DOMAIN"
        prompt_input "Admin email for SSL certificate" "" "ADMIN_EMAIL"
        
        if [ -z "$DOMAIN" ] || [ -z "$ADMIN_EMAIL" ]; then
            print_error "Domain and email are required for SSL setup"
            exit 1
        fi
        
        # Set NEXTAUTH_URL based on SSL
        NEXTAUTH_URL="https://$DOMAIN"
    else
        SETUP_SSL=false
        NEXTAUTH_URL="http://localhost:$APP_PORT"
    fi
    
    # Generate NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    
    # Database Configuration
    echo ""
    print_step "Database Configuration"
    print_info "MongoDB connection string (local or cloud like MongoDB Atlas)"
    print_info "Examples:"
    print_info "  Local: mongodb://localhost:27017/community"
    print_info "  Atlas: mongodb+srv://username:password@cluster.mongodb.net/community"
    prompt_input "MongoDB URI" "mongodb://localhost:27017/community" "MONGODB_URI"
    
    # Discord Configuration
    echo ""
    print_step "Discord OAuth & Bot Configuration"
    print_info "You'll need to create a Discord application at: https://discord.com/developers/applications"
    echo ""
    prompt_input "Discord Client ID" "" "DISCORD_CLIENT_ID"
    prompt_input "Discord Client Secret" "" "DISCORD_CLIENT_SECRET"
    prompt_input "Discord Bot Token" "" "DISCORD_BOT_TOKEN"
    prompt_input "Discord Guild ID (your server ID)" "" "DISCORD_GUILD_ID"
    prompt_input "Discord Admin Role IDs (comma-separated)" "" "DISCORD_ADMIN_ROLE_IDS"
    
    # Game Server Configuration
    echo ""
    print_step "Game Server Configuration (RedM/FiveM)"
    prompt_input "Game Server IP" "" "GAME_SERVER_IP"
    prompt_input "Game Server Port" "30120" "GAME_SERVER_PORT"
    prompt_input "Server API Key (if required)" "" "SERVER_API_KEY"
    
    # Email Configuration
    echo ""
    print_step "Email Configuration (SMTP)"
    print_info "For Gmail: Use smtp.gmail.com with an App Password (not your regular password)"
    print_info "Other providers: SendGrid, Mailgun, Outlook, etc."
    echo ""
    prompt_input "SMTP Host" "smtp.gmail.com" "SMTP_HOST"
    prompt_input "SMTP Port" "587" "SMTP_PORT"
    prompt_input "SMTP Username/Email" "" "SMTP_USER"
    prompt_input "SMTP Password (App Password for Gmail)" "" "SMTP_PASS"
    prompt_input "From Email Address" "$SMTP_USER" "SMTP_FROM"
}

# Function to display configuration summary
display_config_summary() {
    echo ""
    print_header "Configuration Summary"
    echo ""
    
    print_info "📋 Application Settings:"
    echo "  1. App Name: $APP_NAME"
    echo "  2. App Port: $APP_PORT"
    echo "  3. App Directory: $APP_DIR"
    echo "  4. NextAuth URL: $NEXTAUTH_URL"
    echo "  5. NextAuth Secret: ${NEXTAUTH_SECRET:0:20}... (generated)"
    
    echo ""
    print_info "🌐 SSL & Domain:"
    if [ "$SETUP_SSL" = true ]; then
        echo "  6. SSL: Enabled"
        echo "  7. Domain: $DOMAIN"
        echo "  8. Admin Email: $ADMIN_EMAIL"
    else
        echo "  6. SSL: Disabled"
        echo "  7. Domain: Not configured"
        echo "  8. Admin Email: Not configured"
    fi
    
    echo ""
    print_info "🗄️ Database:"
    echo "  9. MongoDB URI: $MONGODB_URI"
    
    echo ""
    print_info "🎮 Discord Configuration:"
    echo "  10. Client ID: ${DISCORD_CLIENT_ID:-'Not set'}"
    echo "  11. Client Secret: ${DISCORD_CLIENT_SECRET:0:10}... (hidden)"
    echo "  12. Bot Token: ${DISCORD_BOT_TOKEN:0:10}... (hidden)"
    echo "  13. Guild ID: ${DISCORD_GUILD_ID:-'Not set'}"
    echo "  14. Admin Role IDs: ${DISCORD_ADMIN_ROLE_IDS:-'Not set'}"
    
    echo ""
    print_info "🎯 Game Server:"
    echo "  15. Server IP: ${GAME_SERVER_IP:-'Not set'}"
    echo "  16. Server Port: ${GAME_SERVER_PORT:-'Not set'}"
    echo "  17. API Key: ${SERVER_API_KEY:0:10}... (hidden)"
    
    echo ""
    print_info "📧 Email (SMTP):"
    echo "  18. SMTP Host: ${SMTP_HOST:-'Not set'}"
    echo "  19. SMTP Port: ${SMTP_PORT:-'Not set'}"
    echo "  20. SMTP User: ${SMTP_USER:-'Not set'}"
    echo "  21. SMTP Password: ${SMTP_PASS:0:5}... (hidden)"
    echo "  22. From Email: ${SMTP_FROM:-'Not set'}"
    
    echo ""
}

# Function to modify specific configuration items
modify_configuration() {
    echo ""
    print_info "Which setting would you like to change?"
    print_info "Enter the number (1-22) or 'done' to finish:"
    
    while true; do
        read -p "Setting to change (1-22 or 'done'): " choice
        
        case $choice in
            1) prompt_input "Application name" "$APP_NAME" "APP_NAME"; APP_DIR="/var/www/$APP_NAME" ;;
            2) prompt_input "Application port" "$APP_PORT" "APP_PORT" ;;
            3) print_info "App directory is automatically set based on app name" ;;
            4) print_info "NextAuth URL is automatically set based on SSL/domain configuration" ;;
            5) 
                if prompt_yes_no "Generate new NextAuth secret?" "y"; then
                    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
                    print_info "New secret generated"
                fi
                ;;
            6) 
                if prompt_yes_no "Enable SSL?" "$SETUP_SSL"; then
                    SETUP_SSL=true
                    if [ -z "$DOMAIN" ]; then
                        prompt_input "Domain name" "" "DOMAIN"
                    fi
                    if [ -z "$ADMIN_EMAIL" ]; then
                        prompt_input "Admin email" "" "ADMIN_EMAIL"
                    fi
                    NEXTAUTH_URL="https://$DOMAIN"
                else
                    SETUP_SSL=false
                    NEXTAUTH_URL="http://localhost:$APP_PORT"
                fi
                ;;
            7) prompt_input "Domain name" "$DOMAIN" "DOMAIN"; NEXTAUTH_URL="https://$DOMAIN" ;;
            8) prompt_input "Admin email" "$ADMIN_EMAIL" "ADMIN_EMAIL" ;;
            9) prompt_input "MongoDB URI" "$MONGODB_URI" "MONGODB_URI" ;;
            10) prompt_input "Discord Client ID" "$DISCORD_CLIENT_ID" "DISCORD_CLIENT_ID" ;;
            11) prompt_input "Discord Client Secret" "$DISCORD_CLIENT_SECRET" "DISCORD_CLIENT_SECRET" ;;
            12) prompt_input "Discord Bot Token" "$DISCORD_BOT_TOKEN" "DISCORD_BOT_TOKEN" ;;
            13) prompt_input "Discord Guild ID" "$DISCORD_GUILD_ID" "DISCORD_GUILD_ID" ;;
            14) prompt_input "Discord Admin Role IDs" "$DISCORD_ADMIN_ROLE_IDS" "DISCORD_ADMIN_ROLE_IDS" ;;
            15) prompt_input "Game Server IP" "$GAME_SERVER_IP" "GAME_SERVER_IP" ;;
            16) prompt_input "Game Server Port" "$GAME_SERVER_PORT" "GAME_SERVER_PORT" ;;
            17) prompt_input "Server API Key" "$SERVER_API_KEY" "SERVER_API_KEY" ;;
            18) prompt_input "SMTP Host" "$SMTP_HOST" "SMTP_HOST" ;;
            19) prompt_input "SMTP Port" "$SMTP_PORT" "SMTP_PORT" ;;
            20) prompt_input "SMTP User" "$SMTP_USER" "SMTP_USER" ;;
            21) prompt_input "SMTP Password" "$SMTP_PASS" "SMTP_PASS" ;;
            22) prompt_input "From Email" "$SMTP_FROM" "SMTP_FROM" ;;
            done|DONE) break ;;
            *) print_error "Invalid choice. Enter 1-22 or 'done'" ;;
        esac
        
        echo ""
        print_info "Setting updated. Enter another number or 'done' to finish:"
    done
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
    
    # Fix npm cache permissions (common issue)
    if [ -d "/root/.npm" ]; then
        print_info "Fixing npm cache permissions..."
        chown -R www-data:www-data /root/.npm 2>/dev/null || true
    fi
    
    # Create npm cache directory for www-data
    mkdir -p /var/www/.npm
    chown -R www-data:www-data /var/www/.npm
    
    # Set npm cache directory for www-data
    sudo -u www-data npm config set cache '/var/www/.npm'
    
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
    
    # Create .env.local with all collected configuration
    cat > "$APP_DIR/.env.local" << EOF
# NextAuth Configuration
NEXTAUTH_URL=$NEXTAUTH_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Database
MONGODB_URI=$MONGODB_URI

# Discord OAuth & Bot Configuration
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET=$DISCORD_CLIENT_SECRET
DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN
DISCORD_GUILD_ID=$DISCORD_GUILD_ID
DISCORD_ADMIN_ROLE_IDS=$DISCORD_ADMIN_ROLE_IDS

# Game Server Configuration (RedM/FiveM)
SERVER_API_KEY=$SERVER_API_KEY
GAME_SERVER_IP=$GAME_SERVER_IP
GAME_SERVER_PORT=$GAME_SERVER_PORT

# Public environment variables (accessible in browser)
NEXT_PUBLIC_GAME_SERVER_IP=$GAME_SERVER_IP
NEXT_PUBLIC_GAME_SERVER_PORT=$GAME_SERVER_PORT

# Email Configuration (for verification and password reset)
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM
EOF
    
    # Set proper ownership and permissions
    chown www-data:www-data "$APP_DIR/.env.local"
    chmod 600 "$APP_DIR/.env.local"
    
    print_status "Environment configuration file created successfully"
    print_info "Configuration saved to: $APP_DIR/.env.local"
    print_info "File permissions set to 600 (secure)"
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

# Function to validate DNS before SSL setup
validate_dns() {
    if [ "$SETUP_SSL" = true ]; then
        print_step "Validating DNS configuration..."
        
        # Get server's public IP
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || curl -s icanhazip.com 2>/dev/null)
        
        if [ -z "$SERVER_IP" ]; then
            print_warning "Could not determine server's public IP address"
            print_info "Please ensure your domain $DOMAIN points to this server"
            if ! prompt_yes_no "Continue with SSL setup anyway?" "n"; then
                print_info "Skipping SSL setup. You can set it up manually later."
                SETUP_SSL=false
                return
            fi
        else
            print_info "Server IP: $SERVER_IP"
            
            # Check if domain resolves to this server
            DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | tail -n1)
            WWW_DOMAIN_IP=$(dig +short "www.$DOMAIN" 2>/dev/null | tail -n1)
            
            if [ -z "$DOMAIN_IP" ]; then
                print_warning "Domain $DOMAIN does not resolve to any IP address"
                print_info "Please ensure your DNS records are configured:"
                print_info "  A record: $DOMAIN -> $SERVER_IP"
                print_info "  A record: www.$DOMAIN -> $SERVER_IP"
                if ! prompt_yes_no "Continue with SSL setup anyway?" "n"; then
                    print_info "Skipping SSL setup. You can set it up manually later."
                    SETUP_SSL=false
                    return
                fi
            elif [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
                print_warning "Domain $DOMAIN resolves to $DOMAIN_IP but server IP is $SERVER_IP"
                print_info "Please update your DNS records:"
                print_info "  A record: $DOMAIN -> $SERVER_IP"
                print_info "  A record: www.$DOMAIN -> $SERVER_IP"
                if ! prompt_yes_no "Continue with SSL setup anyway?" "n"; then
                    print_info "Skipping SSL setup. You can set it up manually later."
                    SETUP_SSL=false
                    return
                fi
            else
                print_status "DNS validation successful - $DOMAIN resolves to $SERVER_IP"
                
                # Check www subdomain
                if [ -n "$WWW_DOMAIN_IP" ] && [ "$WWW_DOMAIN_IP" != "$SERVER_IP" ]; then
                    print_warning "www.$DOMAIN resolves to $WWW_DOMAIN_IP instead of $SERVER_IP"
                    print_info "Consider updating: A record: www.$DOMAIN -> $SERVER_IP"
                fi
            fi
        fi
    fi
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
            print_info "Your website is now available at: https://$DOMAIN"
        else
            print_warning "SSL certificate installation failed."
            print_info "This is usually due to DNS not pointing to this server yet."
            print_info "You can set it up manually later with:"
            print_info "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
            print_info "Your website is available at: http://$SERVER_IP"
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
    print_status "✅ Configuration Complete:"
    echo "   - Environment file configured: $APP_DIR/.env.local"
    echo "   - All settings applied automatically"
    echo "   - Application ready to use"
    echo ""
    
    print_info "🔧 Next Steps:"
    echo "1. Configure your Discord application OAuth settings:"
    echo "   - Go to: https://discord.com/developers/applications"
    echo "   - Add redirect URI: $NEXTAUTH_URL/api/auth/callback/discord"
    echo ""
    echo "2. Test your website in a browser"
    echo ""
    echo "3. If you need to modify settings later:"
    echo "   - Edit: $APP_DIR/.env.local"
    echo "   - Restart: sudo -u www-data pm2 restart $APP_NAME"
    
    if [ "$SETUP_SSL" = false ]; then
        echo ""
        print_info "💡 To add SSL later, run:"
        echo "   sudo certbot --nginx"
    fi
    
    echo ""
    print_status "Installation completed successfully! 🚀"
}

# Function to detect existing installation
detect_existing_installation() {
    EXISTING_APPS=()
    
    # Check for existing installations in /var/www
    if [ -d "/var/www" ]; then
        for dir in /var/www/*/; do
            if [ -d "$dir" ] && [ -f "$dir/package.json" ] && [ -f "$dir/.env.local" ]; then
                app_name=$(basename "$dir")
                # Skip if it's just the .npm-global directory
                if [ "$app_name" != ".npm-global" ] && [ "$app_name" != "html" ]; then
                    EXISTING_APPS+=("$app_name")
                fi
            fi
        done
    fi
    
    # Check PM2 processes
    if command -v pm2 >/dev/null 2>&1; then
        PM2_APPS=$(sudo -u www-data pm2 list 2>/dev/null | grep -E "communitysite|redm|fivem" | awk '{print $2}' | tr -d '│' | xargs)
        if [ -n "$PM2_APPS" ]; then
            for app in $PM2_APPS; do
                if [[ ! " ${EXISTING_APPS[@]} " =~ " ${app} " ]]; then
                    EXISTING_APPS+=("$app")
                fi
            done
        fi
    fi
    
    if [ ${#EXISTING_APPS[@]} -gt 0 ]; then
        return 0  # Found existing installations
    else
        return 1  # No existing installations
    fi
}

# Function to uninstall existing installation
uninstall_existing() {
    local app_to_remove="$1"
    
    print_step "Removing existing installation: $app_to_remove"
    
    # Stop PM2 process
    if command -v pm2 >/dev/null 2>&1; then
        print_info "Stopping PM2 process..."
        sudo -u www-data pm2 stop "$app_to_remove" 2>/dev/null || true
        sudo -u www-data pm2 delete "$app_to_remove" 2>/dev/null || true
        sudo -u www-data pm2 save 2>/dev/null || true
    fi
    
    # Remove Nginx configuration
    if [ -f "/etc/nginx/sites-available/$app_to_remove" ]; then
        print_info "Removing Nginx configuration..."
        rm -f "/etc/nginx/sites-available/$app_to_remove"
        rm -f "/etc/nginx/sites-enabled/$app_to_remove"
        systemctl reload nginx 2>/dev/null || true
    fi
    
    # Remove SSL certificates (ask user first)
    if [ -d "/etc/letsencrypt/live" ]; then
        for cert_dir in /etc/letsencrypt/live/*/; do
            if [ -d "$cert_dir" ]; then
                domain=$(basename "$cert_dir")
                if prompt_yes_no "Remove SSL certificate for $domain?" "n"; then
                    print_info "Removing SSL certificate for $domain..."
                    certbot delete --cert-name "$domain" --non-interactive 2>/dev/null || true
                fi
            fi
        done
    fi
    
    # Remove application directory
    if [ -d "/var/www/$app_to_remove" ]; then
        print_info "Removing application directory..."
        rm -rf "/var/www/$app_to_remove"
    fi
    
    # Remove log directory
    if [ -d "/var/log/$app_to_remove" ]; then
        print_info "Removing log directory..."
        rm -rf "/var/log/$app_to_remove"
    fi
    
    # Remove cron jobs
    print_info "Removing cron jobs..."
    crontab -l 2>/dev/null | grep -v "$app_to_remove" | crontab - 2>/dev/null || true
    
    print_status "Existing installation removed successfully"
}

# Function to handle existing installations
handle_existing_installations() {
    if detect_existing_installation; then
        print_warning "🔍 Existing installation(s) detected!"
        echo ""
        print_info "Found the following installations:"
        for app in "${EXISTING_APPS[@]}"; do
            echo "  - $app"
            if [ -d "/var/www/$app" ]; then
                echo "    Location: /var/www/$app"
            fi
            if sudo -u www-data pm2 list 2>/dev/null | grep -q "$app"; then
                echo "    Status: Running in PM2"
            fi
        done
        
        echo ""
        print_info "What would you like to do?"
        echo "1. Remove existing installation(s) and install fresh"
        echo "2. Cancel installation"
        echo ""
        
        while true; do
            read -p "Enter your choice (1-2): " choice
            case $choice in
                1)
                    print_info "Removing existing installations..."
                    for app in "${EXISTING_APPS[@]}"; do
                        uninstall_existing "$app"
                    done
                    print_status "All existing installations removed. Continuing with fresh installation..."
                    echo ""
                    break
                    ;;
                2)
                    print_info "Installation cancelled by user."
                    exit 0
                    ;;
                *)
                    print_error "Invalid choice. Please enter 1 or 2."
                    ;;
            esac
        done
    fi
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
    
    # Check for existing installations
    handle_existing_installations
    
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
    validate_dns
    setup_ssl_certificate
    start_services
    setup_monitoring
    display_completion_info
}

# Run main function
main "$@"
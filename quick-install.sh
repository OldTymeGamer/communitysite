#!/bin/bash

# RedM/FiveM Community Website - One-Command Installer
# This script downloads and installs the community website automatically

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        echo "Usage: curl -sSL https://raw.githubusercontent.com/OldTymeGamer/communitysite/main/quick-install.sh | sudo bash"
        exit 1
    fi
}

# Check if it's Linux
check_linux() {
    if [[ "$(uname -s)" != "Linux" ]]; then
        print_error "This installer only supports Linux operating systems."
        print_error "Detected OS: $(uname -s)"
        exit 1
    fi
}

# Install git if not present
install_git() {
    if ! command -v git >/dev/null 2>&1; then
        print_info "Installing git..."
        
        if command -v apt >/dev/null 2>&1; then
            apt update && apt install -y git
        elif command -v yum >/dev/null 2>&1; then
            yum install -y git
        elif command -v dnf >/dev/null 2>&1; then
            dnf install -y git
        elif command -v pacman >/dev/null 2>&1; then
            pacman -S --noconfirm git
        else
            print_error "Could not install git. Please install git manually and try again."
            exit 1
        fi
        
        print_status "Git installed successfully"
    fi
}

# Main installation function
main() {
    print_header "RedM/FiveM Community Website - One-Command Installer"
    echo ""
    print_info "This will download and install your community website automatically."
    echo ""
    
    # Checks
    check_root
    check_linux
    install_git
    
    # Set installation directory
    INSTALL_DIR="/tmp/communitysite-install"
    
    # Clean up any previous installation attempts
    if [ -d "$INSTALL_DIR" ]; then
        print_info "Cleaning up previous installation attempt..."
        rm -rf "$INSTALL_DIR"
    fi
    
    # Clone the repository
    print_info "Downloading community website..."
    git clone https://github.com/OldTymeGamer/communitysite.git "$INSTALL_DIR"
    
    if [ ! -d "$INSTALL_DIR" ]; then
        print_error "Failed to download the repository"
        exit 1
    fi
    
    # Change to installation directory
    cd "$INSTALL_DIR"
    
    # Make install script executable
    chmod +x install.sh
    
    # Run the main installation script
    print_header "Starting Installation Process"
    echo ""
    ./install.sh
    
    # Clean up
    print_info "Cleaning up temporary files..."
    cd /
    rm -rf "$INSTALL_DIR"
    
    print_status "Installation completed successfully!"
}

# Run main function
main "$@"
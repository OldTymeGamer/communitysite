#!/bin/bash

# RedM/FiveM Community Website - Installation Wrapper
# This script ensures proper interactive input handling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Check if it's Linux
if [[ "$(uname -s)" != "Linux" ]]; then
    print_error "This installer only supports Linux operating systems."
    exit 1
fi

print_header "RedM/FiveM Community Website - Interactive Installer"
echo ""
print_info "Downloading and preparing installation..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download the repository
if command -v git >/dev/null 2>&1; then
    git clone https://github.com/OldTymeGamer/communitysite.git .
else
    print_info "Installing git..."
    if command -v apt >/dev/null 2>&1; then
        apt update && apt install -y git
    elif command -v yum >/dev/null 2>&1; then
        yum install -y git
    elif command -v dnf >/dev/null 2>&1; then
        dnf install -y git
    elif command -v pacman >/dev/null 2>&1; then
        pacman -S --noconfirm git
    fi
    git clone https://github.com/OldTymeGamer/communitysite.git .
fi

# Make install script executable
chmod +x install.sh

print_header "Starting Interactive Installation"
echo ""

# Run the installation script with proper terminal handling
if [ -t 0 ]; then
    # Terminal is available
    ./install.sh
else
    # Force terminal input
    exec ./install.sh 0</dev/tty 1>/dev/tty 2>/dev/tty
fi

# Cleanup
cd /
rm -rf "$TEMP_DIR"

echo ""
print_info "Installation completed! Temporary files cleaned up."
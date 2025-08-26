# 🎮 RedM/FiveM Community Website

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.9.2-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Discord](https://img.shields.io/badge/Discord-Integration-7289da?style=for-the-badge&logo=discord)](https://discord.com/)

A modern, feature-rich community website for RedM and FiveM servers. Built with Next.js 15, featuring Discord authentication, real-time server monitoring, and a customizable interface perfect for any gaming community.

## 🚀 Quick Start (Linux Production)

**One-command installation for Linux servers:**

```bash
# Clone the repository
git clone https://github.com/OldTymeGamer/communitysite
cd communitysite

# Run the automated installer
chmod +x install.sh
sudo ./install.sh
```

The installer will:
- ✅ Install all dependencies automatically
- ✅ Guide you through configuration with prompts
- ✅ Set up SSL certificates (optional)
- ✅ Configure Nginx, PM2, and firewall
- ✅ Get your site running in minutes!

**For development setup, see the [Development Setup](#-development-setup) section below.**
**For detailed installation instructions, see the [Installation Guide](./INSTALLATION.md).**

## ✨ Features

### 🎮 Core Features
- **Real-time Server Monitoring** - Live player counts and server status
- **Discord Integration** - OAuth authentication and member sync
- **Community Hub** - News feed, events calendar, and community discussions
- **Server Browser** - Browse and connect to RedM/FiveM servers
- **User Profiles** - Customizable player profiles with achievements
- **Admin Dashboard** - Comprehensive server and user management

### 🎨 Design & UX
- **Customizable Theme** - Beautiful interface with customizable styling (Wild West theme included)
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Smooth Animations** - Framer Motion powered transitions and effects
- **Dark Mode** - Beautiful dark theme optimized for gaming communities
- **Interactive Elements** - Hover effects, particle systems, and dynamic content

### 🔧 Technical Features
- **Next.js 15** - Latest React framework with App Router
- **TypeScript** - Full type safety and better developer experience
- **MongoDB** - Scalable database with Mongoose ODM
- **NextAuth.js** - Secure authentication with Discord provider
- **Email System** - Nodemailer integration for notifications
- **SEO Optimized** - Meta tags, structured data, and performance optimized

## 💻 Development Setup

### Prerequisites

#### For Development (Windows/Mac/Linux)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB database** - [MongoDB Atlas](https://www.mongodb.com) (cloud) or local installation
- **Discord application** (for OAuth) - [Discord Developer Portal](https://discord.com/developers/applications)
- **SMTP server** (for emails) - Gmail, SendGrid, or similar

#### For Linux Production Deployment
**Required System Packages:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm nginx git curl ufw certbot python3-certbot-nginx

# CentOS/RHEL/Rocky Linux
sudo yum install -y nodejs npm nginx git curl firewalld certbot python3-certbot-nginx

# Arch Linux
sudo pacman -S nodejs npm nginx git curl ufw certbot certbot-nginx
```

**Required Global npm Packages:**
```bash
sudo npm install -g pm2
```

**System Requirements:**
- **OS**: Ubuntu 20.04+, Debian 11+, CentOS 8+, or similar
- **RAM**: Minimum 1GB, Recommended 2GB+
- **Storage**: Minimum 5GB free space
- **Network**: Port 80 (HTTP) and 443 (HTTPS) accessible

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OldTymeGamer/communitysite
   cd communitysite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables in `.env.local`:
   ```env
   # Discord OAuth
   DISCORD_BOT_TOKEN=your_discord_bot_token
   DISCORD_GUILD_ID=your_discord_guild_id
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_ADMIN_ROLE_IDS=role_id_1,role_id_2
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord
   
   # Game Server Configuration
   SERVER_API_KEY=your_server_api_key_here
   GAME_SERVER_IP=your_server_ip
   GAME_SERVER_PORT=30120
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/community
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@gmail.com
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Production Deployment (Linux)

### Automated Installation Script (Recommended)
For a complete automated installation with interactive configuration:

```bash
# Make the script executable
chmod +x install.sh

# Run the installation script
sudo ./install.sh
```

The installation script will:
- ✅ **Auto-detect Linux distribution** and install required packages
- ✅ **Interactive configuration** - prompts for all settings
- ✅ **SSL setup with Let's Encrypt** - optional with domain prompts
- ✅ **Environment configuration** - guided setup of all variables
- ✅ **Nginx reverse proxy** - automatic configuration
- ✅ **PM2 process management** - production-ready process handling
- ✅ **Firewall configuration** - secure your server automatically
- ✅ **Monitoring setup** - health checks and auto-restart
- ✅ **Security hardening** - best practices applied

**Supported Linux Distributions:**
- Ubuntu 20.04+ / Debian 11+
- CentOS 8+ / RHEL 8+ / Rocky Linux / AlmaLinux
- Fedora
- Arch Linux

### Manual Installation
If you prefer to install manually, follow the development setup and then configure Nginx, PM2, and SSL manually.

### Installation Process Details

The `install.sh` script will guide you through:

1. **System Detection** - Automatically detects your Linux distribution
2. **Package Installation** - Installs Node.js 18+, npm, Nginx, SSL tools
3. **Configuration Prompts**:
   - Application name and port
   - SSL setup (optional)
   - Domain configuration (if SSL enabled)
   - All environment variables (Discord, MongoDB, SMTP, etc.)
4. **SSL Certificate** - Automatic Let's Encrypt setup with domain validation
5. **Service Configuration** - PM2 process manager and Nginx reverse proxy
6. **Security Setup** - Firewall configuration and security headers
7. **Monitoring** - Health check scripts and auto-restart functionality

**Example Installation Flow:**
```bash
sudo ./install.sh

# You'll be prompted for:
# - App name (default: communitysite)
# - Port (default: 3000)
# - SSL setup? (Y/n)
# - Domain name (e.g., yourdomain.com)
# - Admin email for SSL
# - Discord OAuth credentials
# - MongoDB connection string
# - SMTP email settings
# - Game server details
```

## 📁 Project Structure

```
communitysite/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   └── ...                # Other pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin/            # Admin-specific components
│   └── ...               # Feature components
├── lib/                   # Utility libraries
│   ├── models/           # Database models
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── styles/               # Global styles
├── types/                # TypeScript definitions
├── docs/                 # Documentation
└── deploy.sh             # Deployment script
```

## 🎯 Key Components

### Authentication System
- Discord OAuth integration with NextAuth.js
- Role-based access control
- Secure session management
- Admin role verification

### Server Integration
- Real-time RedM/FiveM server monitoring
- Player count tracking
- Server status indicators
- API endpoints for server data

### Community Features
- News and announcements system
- Event calendar with RSVP
- Image gallery with lightbox
- Community leaderboards

### Admin Dashboard
- User management and moderation
- Content management system
- Server analytics and monitoring
- Discord integration controls

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:seed      # Seed database with sample data
npm run db:migrate   # Run database migrations
```

### Code Style
- ESLint configuration for Next.js
- Prettier for code formatting
- TypeScript strict mode enabled
- Tailwind CSS for styling

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Advanced Deployment

For detailed deployment instructions, see our comprehensive [Deployment Guide](./docs/DEPLOYMENT.md).

### 🔧 Troubleshooting

If you encounter issues during installation, check our [Deployment Troubleshooting Guide](./DEPLOYMENT-TROUBLESHOOTING.md) for solutions to common problems.

**Common Installation Issues:**

1. **Permission Errors**: Make sure to run `sudo ./install.sh`
2. **Node.js Version**: Script automatically installs Node.js 18+ if needed
3. **SSL Certificate Fails**: Ensure your domain points to the server IP
4. **Firewall Issues**: Script configures UFW/firewalld automatically
5. **PM2 Not Starting**: Check logs with `sudo -u www-data pm2 logs`

**Post-Installation Commands:**
```bash
# Check application status
sudo -u www-data pm2 status

# View application logs
sudo -u www-data pm2 logs communitysite

# Restart application
sudo -u www-data pm2 restart communitysite

# Check Nginx status
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/access.log
```

### What the installation script handles:
- **System Dependencies**: Node.js 18+, npm, Nginx, SSL certificates, build tools
- **Security**: Firewall configuration, SSL/TLS setup, security headers
- **Process Management**: PM2 process manager with auto-restart
- **Reverse Proxy**: Nginx configuration with proper headers and caching
- **Monitoring**: Health checks, log rotation, and system monitoring
- **SSL Automation**: Let's Encrypt certificates with auto-renewal

## 📊 Monitoring & Analytics

### Built-in Monitoring
- Real-time server status tracking
- Discord member count sync
- Player activity monitoring
- System health checks

### Logging
- Application logs via systemd journal
- Nginx access and error logs
- Custom monitoring scripts
- Automated backup logging

## 🔒 Security Features

- **HTTPS Enforcement** - SSL/TLS with Let's Encrypt
- **Rate Limiting** - API endpoint protection
- **CSRF Protection** - Built-in Next.js security
- **Input Validation** - Server-side validation for all inputs
- **Secure Headers** - Security headers via Nginx
- **Environment Isolation** - Secure environment variable handling

## 🤝 Community

- **Discord Server**: [Join our community](https://discord.gg/your-invite)
- **Website**: [your-community.com](https://your-community.com)
- **Support**: Create an issue or contact administrators

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment tools
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Discord** - For community integration
- **MongoDB** - For reliable database services

---

<div align="center">
  <strong>Built with ❤️ for the RedM/FiveM gaming community</strong>
</div>
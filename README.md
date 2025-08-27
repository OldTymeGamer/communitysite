# 🎮 Community Website - Multi-Game Platform

A comprehensive, customizable community website platform supporting multiple games with a powerful admin panel for complete website management.

## ✨ Features

- **🎯 Multi-Game Support** - Perfect for FiveM, RedM, Minecraft, Rust, GMod, CS:GO, and more
- **🛠️ Complete Admin Panel** - Manage everything through a beautiful web interface
- **👥 User Management** - Registration, authentication, roles, and permissions
- **🖥️ Server Management** - Add and monitor game servers with real-time status
- **🎨 Full Customization** - Colors, images, text, and layout - all customizable
- **🔄 Auto-Updates** - Update your website directly from the admin panel
- **🔗 Integrations** - Discord, Steam, Google authentication (optional)
- **📧 Email System** - SMTP configuration and user notifications
- **📱 Responsive Design** - Beautiful on desktop, tablet, and mobile

## 🚀 One-Command Installation

### Prerequisites

- **Linux Server** (Ubuntu, Debian, CentOS, RHEL, Fedora, Arch)
- **Root Access** (sudo privileges)
- **Domain Name** (optional, for SSL)

### Installation

**Run this single command on your Linux server:**

```bash
curl -fsSL https://raw.githubusercontent.com/OldTymeGamer/communitysite/main/install.sh | sudo bash
```

That's it! The script will:
- ✅ Install Node.js, Nginx, and all dependencies
- ✅ Guide you through configuration (Discord, MongoDB, Email, SSL)
- ✅ Set up SSL certificates with Let's Encrypt
- ✅ Configure firewall and security
- ✅ Start all services automatically
- ✅ Provide you with a fully working website

### After Installation

1. **Access your website** at your domain (or server IP)
2. **Complete setup** at `/setup` to create your admin account
3. **Access admin panel** at `/admin` to customize everything
4. **Start building your community!**

## 🎨 Customization

Once running, access the admin panel at `/admin` to customize:

### Website Appearance
- **Colors & Branding** - Complete color scheme customization
- **Hero Section** - Title, description, and background images
- **Gallery Images** - Upload and manage slideshow images
- **Content Management** - All text and content editable

### Server Management
- **Add Game Servers** - Support for multiple game types
- **Real-time Monitoring** - Player count, ping, and status
- **Automatic Display** - Servers appear on homepage automatically

### User & Community
- **User Registration** - Enable/disable public registration
- **Email Verification** - Optional email verification system
- **Role Management** - Admin and user permissions

### Integrations
- **Discord Integration** - OAuth login and member count display
- **Steam Integration** - Steam authentication (coming soon)
- **Google Integration** - Google OAuth (coming soon)
- **Email Settings** - SMTP configuration for notifications

## 🔄 Auto-Updates

Keep your website up-to-date effortlessly:

1. Go to **Admin Panel** → **Updates**
2. Click "Check for Updates"
3. If updates are available, click "Update Now"
4. The website automatically pulls changes and restarts

## 🔧 Manual Development Setup

If you want to develop or run locally:

```bash
git clone https://github.com/OldTymeGamer/communitysite.git
cd communitysite
npm install
cp .env.example .env.local
# Edit .env.local with your settings
npm run dev
```

## 📁 Project Structure

```
communitysite/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   └── ...                # Public pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and configurations
│   ├── models/           # Database models
│   └── ...               # Auth, database, etc.
└── public/               # Static assets
```

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

Need help? Here's how to get support:

1. **Check the admin panel logs** for error messages
2. **Verify your `.env.local`** configuration
3. **Create an issue** on GitHub with:
   - Your setup details
   - Error messages
   - Steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Build amazing gaming communities! 🎮✨**

*Made with ❤️ for the gaming community*
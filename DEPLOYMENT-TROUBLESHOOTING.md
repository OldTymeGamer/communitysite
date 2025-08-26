# 🔧 Deployment Troubleshooting Guide

This guide helps you resolve common issues during deployment of the Community Website.

## 🚨 Common Issues and Solutions

### 1. npm Permission Errors

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /var/www/.npm
npm ERR! errno -13
```

**Solution:**
The interactive deployment script (`deploy-interactive.sh`) automatically fixes this. If using the manual script, run:

```bash
# Fix npm permissions
sudo mkdir -p /var/www/.npm-global
sudo chown -R www-data:www-data /var/www/.npm-global
sudo -u www-data npm config set prefix '/var/www/.npm-global'
sudo chown -R www-data:www-data /var/www/.npm
```

### 2. PM2 Command Not Found

**Error:**
```
[PM2][ERROR] Process or Namespace not found
pm2: command not found
```

**Solution:**
PM2 needs to be installed with the correct PATH:

```bash
# Install PM2 for www-data user
sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install -g pm2'

# Add to PATH permanently
echo 'export PATH="/var/www/.npm-global/bin:$PATH"' >> /var/www/.bashrc
```

### 3. Node.js Version Too Old

**Error:**
```
error This project requires Node.js 18 or higher
```

**Solution:**
Install Node.js 18+ using NodeSource repository:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify version
node --version  # Should show v18.x.x or higher
```

### 4. SSL Certificate Issues

**Error:**
```
certbot: command not found
SSL certificate installation failed
```

**Solution:**
Install certbot and configure SSL:

```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# Configure SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Nginx Configuration Errors

**Error:**
```
nginx: [emerg] cannot load certificate
nginx: configuration file test failed
```

**Solution:**
Check and fix Nginx configuration:

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### 6. Application Won't Start

**Error:**
```
systemctl status shows failed state
Application not responding
```

**Solution:**
Check logs and restart services:

```bash
# Check application logs
sudo journalctl -u your-app-name -f

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Restart application
sudo systemctl restart your-app-name
```

### 7. Database Connection Issues

**Error:**
```
MongooseError: Could not connect to MongoDB
```

**Solution:**
Verify MongoDB connection string in `.env.local`:

```bash
# Edit environment file
sudo nano /var/www/your-app/.env.local

# Check MongoDB URI format
MONGODB_URI=mongodb://username:password@host:port/database
# or for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 8. Discord OAuth Not Working

**Error:**
```
Discord authentication fails
Redirect URI mismatch
```

**Solution:**
Update Discord application settings:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to OAuth2 → General
4. Add redirect URIs:
   - `https://yourdomain.com/api/auth/callback/discord`
   - `https://www.yourdomain.com/api/auth/callback/discord`

### 9. Firewall Blocking Connections

**Error:**
```
Connection timeout
Site not accessible
```

**Solution:**
Configure firewall properly:

```bash
# Ubuntu (UFW)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 10. Build Process Fails

**Error:**
```
npm run build fails
TypeScript compilation errors
```

**Solution:**
Check dependencies and build process:

```bash
# Clear npm cache
sudo -u www-data npm cache clean --force

# Remove node_modules and reinstall
sudo rm -rf /var/www/your-app/node_modules
sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm install'

# Try building again
sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && npm run build'
```

## 🔍 Diagnostic Commands

### Check Service Status
```bash
# Application service
sudo systemctl status your-app-name

# Nginx service
sudo systemctl status nginx

# PM2 processes
sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && pm2 status'
```

### View Logs
```bash
# Application logs
sudo journalctl -u your-app-name -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PM2 logs
sudo -u www-data bash -c 'export PATH="/var/www/.npm-global/bin:$PATH" && pm2 logs'
```

### Check Network and Ports
```bash
# Check if application is listening on port
sudo netstat -tlnp | grep :3000

# Check nginx is listening
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Test local connection
curl -I http://localhost:3000
```

### Check File Permissions
```bash
# Check application directory permissions
ls -la /var/www/your-app/

# Check if www-data can access files
sudo -u www-data ls -la /var/www/your-app/
```

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check the logs** using the diagnostic commands above
2. **Verify your configuration** in `.env.local`
3. **Test each component** individually (Node.js, Nginx, database)
4. **Create an issue** on the repository with:
   - Your operating system and version
   - Error messages from logs
   - Steps you've already tried
   - Output from diagnostic commands

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [MongoDB Connection Troubleshooting](https://docs.mongodb.com/manual/reference/connection-string/)

---

**Remember:** Always backup your configuration files before making changes, and test changes in a staging environment when possible.
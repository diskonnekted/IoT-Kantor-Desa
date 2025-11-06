#!/bin/bash

echo "🚀 IoT Dashboard Update Script"
echo "================================"

# Navigate to project directory
cd /var/www/html/iot-kantor-desa

# Show current status
echo "📊 Current Status:"
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git log --oneline -1)"
echo ""

# Create backup
echo "📦 Creating backup..."
BACKUP_DIR="/var/www/html/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r . $BACKUP_DIR
echo "Backup created at: $BACKUP_DIR"
echo ""

# Fetch latest changes
echo "📥 Fetching latest changes from GitHub..."
git fetch origin

# Reset to latest master
echo "🔄 Resetting to latest master..."
git reset --hard origin/master
git clean -fd

# Show new status
echo "📊 New Status:"
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git log --oneline -1)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Clean build
echo "🧹 Cleaning old build..."
rm -rf .next

# Build application
echo "🔨 Building application..."
npm run build

# Restart application
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart iot-dashboard
    echo "✅ PM2 restarted"
else
    pkill -f "node server.js" || true
    nohup npm start > server.log 2>&1 &
    echo "✅ Application restarted"
fi

echo ""
echo "🎉 Update completed successfully!"
echo "🌐 Application should be available at: https://monitor.pondokrejo.id"
echo ""
echo "📊 Final Status:"
pm2 list 2>/dev/null || echo "PM2 not available, using direct node process"
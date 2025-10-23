#!/bin/bash
set -e

echo "🚀 Scheduler V2 VPS Deployment Script"
echo "======================================"

# Navigate to project
cd /var/www/projects/scheduler-v2

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose down 2>/dev/null || true

# Build and start
echo "🏗️  Building production container..."
docker compose build --no-cache

echo "▶️  Starting container..."
docker compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
sleep 10

# Check status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "📝 Recent logs:"
docker compose logs --tail=20 app

echo ""
echo "✅ Deployment complete!"
echo "🌐 Access your site at:"
echo "   - http://scheduler.yahyaislamovic.dev"
echo "   - http://your-vps-ip:8001"
echo "   - http://your-vps-ip:3003"
echo "🔧 API Health: http://your-vps-ip:8001/api/days"
echo ""
echo "To view live logs: docker compose logs -f app"

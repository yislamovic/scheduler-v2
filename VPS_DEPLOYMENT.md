# VPS Deployment Guide for Scheduler V2

## Pre-Deployment Checklist

### ✅ Security Status
- [x] No `.env` file needed (no secrets)
- [x] `.env` already in `.gitignore` (line 9)
- [x] No hardcoded secrets in code
- [x] Docker configuration is production-ready

### ✨ Ready to Deploy!
This project is **already secure** and ready for VPS deployment with no additional configuration needed.

## Steps to Deploy on VPS

### 1. SSH into your VPS
```bash
ssh your-user@your-vps-ip
```

### 2. Install Docker (if not already installed)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

### 3. Clone the repository
```bash
git clone <your-repo-url>
cd scheduler-v2
```

### 4. Build and start the application
```bash
docker compose up -d --build
```

That's it! No environment variables needed.

### 5. Check logs
```bash
docker compose logs -f app
```

### 6. Access the application
- Application: `http://your-vps-ip:8001` OR `http://your-vps-ip:3003` OR `http://scheduler.yahyaislamovic.dev`
- API Health: `http://your-vps-ip:8001/api/days`

Note: The app is accessible on BOTH port 8001 and 3003 (they point to the same app)

## Port Configuration

Default port: `8001`

To use port 80 (default HTTP), edit `docker-compose.yml`:
```yaml
ports:
  - "80:8001"  # Changed from "8001:8001"
```

Or use port 3000 to match other projects:
```yaml
ports:
  - "3000:8001"
```

## Firewall Configuration

If using UFW, allow port 8001:
```bash
sudo ufw allow 8001/tcp
```

## Custom Domain Setup (Optional)

### With Nginx Reverse Proxy

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

2. Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/scheduler
```

Paste:
```nginx
server {
    listen 80;
    server_name scheduler.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/scheduler /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Install SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d scheduler.yourdomain.com
```

## Troubleshooting

### Issue: Container won't start
**Solution:**
```bash
# Check logs for errors
docker compose logs app

# Rebuild from scratch
docker compose down
docker compose up -d --build
```

### Issue: Port 8001 already in use
**Solution:**
```bash
# Find what's using the port
sudo lsof -i :8001

# Kill the process or change port in docker-compose.yml
```

### Issue: Cannot access from browser
**Solution:**
- Check firewall: `sudo ufw status`
- Check container status: `docker compose ps`
- Check if port is listening: `netstat -tlnp | grep 8001`

## Application Features

### Session-Based Multi-User Support
- Each user gets isolated session with UUID
- Data persists per session only
- Automatic cleanup after 2 hours inactivity
- Data resets on page refresh
- Unlimited concurrent users

### API Endpoints
- `GET /api/days` - Get all days/appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/days` - Update day
- Health check built into Docker config

## Production Best Practices

For actual production:

1. ✅ Use Nginx reverse proxy (see above)
2. ✅ Set up SSL/HTTPS with Let's Encrypt
3. ✅ Configure firewall (UFW)
4. ✅ Set up monitoring (e.g., Uptime Kuma, Grafana)
5. ✅ Configure automatic backups (if needed)
6. ✅ Use a custom domain
7. ✅ Set up log rotation
8. ✅ Consider using Docker Swarm or Kubernetes for scaling

## Update/Redeploy

To update after pushing new code:

```bash
# On VPS
cd scheduler-v2
git pull
docker compose down
docker compose up -d --build
```

## Container Management

```bash
# Stop containers
docker compose down

# Start containers
docker compose up -d

# Restart containers
docker compose restart

# View logs (live)
docker compose logs -f

# View resource usage
docker stats scheduler-app
```

## Health Check

The container has a built-in health check that tests the API every 30 seconds:
```bash
# Check health status
docker inspect scheduler-app | grep -A 5 Health
```

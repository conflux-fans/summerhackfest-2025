# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Conflux Box in various environments, from local development to production hosting. The application consists of a React frontend and a Node.js backend service powered by Conflux DevKit packages.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Production Deployment](#production-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Troubleshooting](#troubleshooting)
5. [Maintenance](#maintenance)

## Development Environment Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20 (LTS) - required for optimal compatibility
- **Package Manager**: pnpm (recommended) - this project uses pnpm as the default
- **Git**: For version control
- **Terminal/Command Line**: For running commands

### Option 1: GitHub Codespaces (Recommended for Demo/Testing)

**Quickest way to get started:**

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/cfxdevkit/conflux-box)

1. Click the badge above or navigate to the repository on GitHub
2. Click "Code" → "Codespaces" → "Create codespace on main"
3. Wait for the environment to set up automatically (2-3 minutes)
4. The devcontainer provides:
   - Node 20 with pnpm pre-installed
   - OpenSSL 3 available
   - All dependencies automatically installed
   - Port forwarding configured (3000, 3001, 3002)

**After the Codespace loads:**

```bash
# Terminal 1: Start the backend service
node backend-service.js

# Terminal 2: Start the frontend (in a new terminal)
pnpm run dev
```

**Current Status**: Codespaces environment is compatible but not yet fully automated. Manual service startup is required.

### Option 2: Local Development Setup

#### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/cfxdevkit/conflux-box.git
cd conflux-box
```

#### 2. Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm@8

# Install project dependencies
pnpm install
```

#### 3. Environment Configuration

Create environment file (optional - most settings have defaults):

```bash
# Copy example environment file
cp .env.example .env

# Edit with your preferred editor
nano .env
```

Example `.env` file:

```env
# Backend service configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Network configuration (optional - defaults provided)
CONFLUX_TESTNET_RPC=https://test.confluxrpc.com
CONFLUX_MAINNET_RPC=https://main.confluxrpc.com

# DevKit configuration (optional)
DEVKIT_LOG_LEVEL=info
```

#### 4. Start Development Services

**Option A: Start Both Services Together** (Recommended)

```bash
# This starts both backend and frontend concurrently
npm run dev
```

**Option B: Start Services Separately**

Terminal 1 - Backend Service:

```bash
# Start the DevKit backend service
npm run backend
# OR directly
node backend-service.js
```

Terminal 2 - Frontend Development Server:

```bash
# Start the Vite development server
npm run dev:frontend
```

#### 5. Verify Installation

- **Frontend**: Open http://localhost:3000 in your browser
- **Backend**: API available at http://localhost:3001
- **Backend Health**: Check http://localhost:3001/health (if endpoint exists)

### Development Workflow

#### Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Type checking
npm run type-check
```

#### Code Quality

```bash
# Check code formatting and linting (using Biome)
npx biome check .

# Auto-fix formatting issues
npx biome format --write .

# Build for production (to test)
npm run build
```

## Production Deployment

### Option 1: Static Hosting (Recommended)

The frontend can be deployed as a static site while the backend runs separately.

#### Frontend Deployment to Vercel

1. **Build the Application**

   ```bash
   npm run build
   ```

2. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy (follow prompts)
   vercel

   # Or deploy production build
   vercel --prod
   ```

3. **Vercel Configuration** (`vercel.json`)
   ```json
   {
     "name": "conflux-box",
     "version": 2,
     "builds": [
       {
         "src": "dist/**/*",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "env": {
       "BACKEND_URL": "https://your-backend-service.com"
     }
   }
   ```

#### Frontend Deployment to Netlify

1. **Build the Application**

   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**

   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy (follow prompts)
   netlify deploy

   # Deploy to production
   netlify deploy --prod
   ```

3. **Netlify Configuration** (`netlify.toml`)

   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     BACKEND_URL = "https://your-backend-service.com"
   ```

#### Backend Service Deployment

The backend service requires a Node.js hosting environment:

**Option A: Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

**Option B: Render**

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node backend-service.js`
   - **Environment**: Node.js

**Option C: Digital Ocean App Platform**

1. Create new app from GitHub repository
2. Configure service:
   - **Name**: conflux-box-backend
   - **Source**: Your repository
   - **Run Command**: `node backend-service.js`

### Option 2: Full-Stack Deployment

Deploy both frontend and backend together on platforms that support full-stack applications.

#### Docker Deployment

1. **Create Dockerfile**

   ```dockerfile
   # Frontend build stage
   FROM node:18-alpine AS frontend-build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   # Production stage
   FROM node:18-alpine AS production
   WORKDIR /app

   # Copy backend service
   COPY backend-service.js ./
   COPY package*.json ./
   RUN npm ci --only=production

   # Copy built frontend
   COPY --from=frontend-build /app/dist ./public

   # Expose port
   EXPOSE 3001

   # Start backend service
   CMD ["node", "backend-service.js"]
   ```

2. **Build and Run Docker Container**

   ```bash
   # Build image
   docker build -t conflux-box .

   # Run container
   docker run -p 3001:3001 conflux-box
   ```

3. **Docker Compose** (`docker-compose.yml`)
   ```yaml
   version: "3.8"
   services:
     conflux-box:
       build: .
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - PORT=3001
       restart: unless-stopped
   ```

## Environment Configuration

### Environment Variables

| Variable              | Description              | Default        | Required |
| --------------------- | ------------------------ | -------------- | -------- |
| `NODE_ENV`            | Environment mode         | `development`  | No       |
| `PORT`                | Backend service port     | `3001`         | No       |
| `FRONTEND_PORT`       | Frontend dev server port | `3000`         | No       |
| `CONFLUX_TESTNET_RPC` | Testnet RPC endpoint     | DevKit default | No       |
| `CONFLUX_MAINNET_RPC` | Mainnet RPC endpoint     | DevKit default | No       |
| `DEVKIT_LOG_LEVEL`    | Logging level            | `info`         | No       |

### Network Configuration

The application supports multiple Conflux networks:

#### Testnet Configuration

```javascript
{
  name: 'Conflux Testnet',
  chainId: { core: 1, evm: 71 },
  rpcUrls: {
    core: 'https://test.confluxrpc.com',
    evm: 'https://evmtestnet.confluxrpc.com'
  }
}
```

#### Mainnet Configuration

```javascript
{
  name: 'Conflux Mainnet',
  chainId: { core: 1029, evm: 1030 },
  rpcUrls: {
    core: 'https://main.confluxrpc.com',
    evm: 'https://evm.confluxrpc.com'
  }
}
```

#### Local Development Configuration

```javascript
{
  name: 'Local Development',
  chainId: { core: 2029, evm: 2030 },
  rpcUrls: {
    core: 'http://localhost:12537',
    evm: 'http://localhost:8545'
  }
}
```

## SSL/HTTPS Configuration

### For Production Deployments

Most hosting platforms (Vercel, Netlify, Railway) provide automatic HTTPS. For custom deployments:

#### Using Let's Encrypt with Nginx

1. **Install Certbot**

   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Nginx Configuration** (`/etc/nginx/sites-available/conflux-box`)

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Obtain SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Performance Optimization

### Frontend Optimization

1. **Build Optimization**

   ```bash
   # Build with optimizations
   npm run build

   # Analyze bundle size
   npx vite-bundle-analyzer dist
   ```

2. **CDN Configuration**
   - Serve static assets from CDN
   - Enable gzip compression
   - Set appropriate cache headers

### Backend Optimization

1. **Process Management with PM2**

   ```bash
   # Install PM2
   npm install -g pm2

   # Start application
   pm2 start backend-service.js --name conflux-box

   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

2. **PM2 Ecosystem File** (`ecosystem.config.js`)
   ```javascript
   module.exports = {
     apps: [
       {
         name: "conflux-box",
         script: "backend-service.js",
         instances: "max",
         exec_mode: "cluster",
         env: {
           NODE_ENV: "production",
           PORT: 3001,
         },
       },
     ],
   };
   ```

## Monitoring and Logging

### Application Monitoring

1. **Health Checks**

   - Implement health check endpoints
   - Monitor application uptime
   - Set up alerts for downtime

2. **Logging Configuration**
   ```javascript
   // Configure logging level
   process.env.DEVKIT_LOG_LEVEL = "info"; // debug, info, warn, error
   ```

### Error Tracking

Consider integrating error tracking services:

- **Sentry**: For error monitoring and performance tracking
- **LogRocket**: For user session recording and debugging

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3001
# OR
netstat -tulpn | grep 3001

# Kill process
kill -9 <PID>
```

#### 2. Node Version Issues

```bash
# Check Node version
node --version

# Use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

#### 3. Package Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Build Failures

```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npx biome check .

# Clear build cache
rm -rf dist .vite
npm run build
```

### DevKit Connection Issues

#### 1. Backend Service Not Starting

- Check if port 3001 is available
- Verify DevKit packages are installed
- Check Node.js version compatibility

#### 2. WebSocket Connection Failures

- Ensure backend service is running
- Check firewall settings
- Verify WebSocket port is accessible

#### 3. Network Configuration Issues

- Verify RPC endpoints are accessible
- Check network configuration in environment
- Ensure DevKit supports target network

## Maintenance

### Regular Maintenance Tasks

#### 1. Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update DevKit packages specifically
npm install @conflux-devkit/backend@latest @conflux-devkit/node@latest
```

#### 2. Security Updates

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

#### 3. Performance Monitoring

- Monitor bundle sizes after updates
- Check for memory leaks in long-running processes
- Monitor API response times

### Backup and Recovery

#### 1. Database Backups

- If using persistent storage, implement regular backups
- Store backups securely with encryption

#### 2. Configuration Backups

- Keep environment configurations in version control
- Document any manual configuration changes

## Support and Resources

### Documentation

- [Conflux Developer Docs](https://doc.confluxnetwork.org/)
- [DevKit Package Documentation]
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

### Community Support

- **Discord**: https://discord.gg/4A2q3xJKjC
- **Telegram**: https://t.me/ConfluxDevs
- **GitHub Issues**: https://github.com/cfxdevkit/conflux-box/issues

---

**Last Updated**: September 29, 2025  
**Status**: Production Ready

For additional support or questions about deployment, please create an issue in the GitHub repository or reach out through the community channels.

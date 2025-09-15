# Use Node.js 18 as base image
FROM node:18-bullseye

# Install system dependencies required for Playwright and development
RUN apt-get update && apt-get install -y \
    libnspr4 \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspaces/chainbrawler_dev

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build all packages
RUN pnpm build

# Install Playwright browsers
RUN npx playwright install chromium

# Expose ports
EXPOSE 3000 5173

# Default command (can be overridden)
CMD ["pnpm", "--filter", "web-ui", "dev", "--host", "0.0.0.0", "--port", "5173"]


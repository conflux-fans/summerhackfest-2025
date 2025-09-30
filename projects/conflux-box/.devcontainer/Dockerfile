FROM mcr.microsoft.com/devcontainers/base:ubuntu

ARG NODE_VERSION=20

# Install node and core tools
RUN su vscode -c ". /etc/profile.d/nvm.sh || true" || true
RUN apt-get update && apt-get install -y curl git build-essential python3 python3-pip ca-certificates openssl libssl3 && rm -rf /var/lib/apt/lists/*

# Install Node via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
  && apt-get install -y nodejs && npm i -g pnpm@8 && rm -rf /var/lib/apt/lists/*

# Ensure vscode user owns workspace
RUN mkdir -p /workspaces && chown -R vscode:vscode /workspaces

USER vscode
WORKDIR /workspaces/conflux-box

ENV NODE_OPTIONS=--max_old_space_size=4096

# Use official lightweight Node.js LTS image
FROM node:lts-bookworm

# Accept build arguments for user mapping (with defaults)
ARG USER_UID=1000
ARG USER_GID=1000

# Update the node user to match host user ID/GID if needed
RUN echo "Build args: USER_UID=${USER_UID}, USER_GID=${USER_GID}" \
    && echo "Current node user: $(id node)" \
    && if [ "${USER_UID}" != "1000" ] || [ "${USER_GID}" != "1000" ]; then \
        groupmod -g ${USER_GID} node 2>/dev/null || true \
        && usermod -u ${USER_UID} -g ${USER_GID} node 2>/dev/null || true \
    ; fi \
    && mkdir -p /home/node/.local/share \
    && chown -R node:node /home/node \
    && echo "Updated node user: $(id node)"

# Set working directory and ensure node user owns it
WORKDIR /workspace
RUN chown node:node /workspace

# Switch to node user and set up environment
USER node
ENV PNPM_HOME=/home/node/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
ENV SHELL=/bin/bash

# Configure npm to use node user's directory for global packages
RUN mkdir -p /home/node/.npm-global \
    && npm config set prefix '/home/node/.npm-global' \
    && echo 'export PATH="/home/node/.npm-global/bin:$PATH"' >> /home/node/.bashrc

# Update PATH to include npm global directory
ENV PATH="/home/node/.npm-global/bin:$PATH"

# Install pnpm and hardhat as node user in user directory
RUN npm install -g pnpm \
    && mkdir -p "$PNPM_HOME" \
    && pnpm setup \
    && pnpm add -g hardhat

# Switch back to root temporarily for system packages
USER root
RUN apt-get update && apt-get install -y --no-install-recommends gh \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
# Switch back to node user as default
USER node

# Set default shell
SHELL ["/bin/bash", "-c"]
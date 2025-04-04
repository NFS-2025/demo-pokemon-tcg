FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install additional packages
RUN apt-get update && apt-get install -y \
    git \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up environment
ENV NODE_ENV=development
# Speed up Vite builds using SWC
ENV VITE_USE_SWC=true

# Set up workspace directory
WORKDIR /workspaces/Need-For-Pokemon

#!/bin/bash
set -e

# Setup workspace directory
cd /workspaces/Need-For-Pokemon

# Install global development tools
npm install -g npm@latest
# Removing create-react-app (deprecated) and adding Vite
npm install -g vite
npm install -g yarn
npm install -g eslint prettier typescript

# Echo helper message about creating a new Vite+React project
echo "
==========================================================================
To create a new React project with Vite, run one of these commands:

For JavaScript:
npm create vite@latest my-react-app -- --template react

For TypeScript:
npm create vite@latest my-react-app -- --template react-ts
==========================================================================
"

# Setup Python environment
python3 -m venv .venv
./.venv/bin/python -m ensurepip --upgrade
./.venv/bin/python -m pip install ipykernel -U --force-reinstall

# Echo completion message
echo "Development environment setup complete!"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

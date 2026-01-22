#!/bin/bash
# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the version specified in .nvmrc
nvm use

# Set production environment variables
export VITE_JAVA_API_URL="https://javaapi.autopaneai.com/api"
export VITE_PYTHON_API_URL="https://api.autopaneai.com/"

# Build and run production preview server
echo "Building for production..."
npm run build

echo "Starting production preview server on port 5173..."
npm run preview -- --port 5173

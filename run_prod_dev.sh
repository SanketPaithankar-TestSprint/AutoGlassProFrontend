#!/bin/bash
# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the version specified in .nvmrc
nvm use

# Set production environment variables for development server
export VITE_JAVA_API_URL="https://javaapi.autopaneai.com/api"
export VITE_PYTHON_API_URL="https://api.autopaneai.com/"

echo "Starting development server with PRODUCTION URLs..."
# Run the dev server
npm run dev

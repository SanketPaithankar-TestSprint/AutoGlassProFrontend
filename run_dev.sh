#!/bin/bash
# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the version specified in .nvmrc
nvm use

# Run the dev server
npm run dev

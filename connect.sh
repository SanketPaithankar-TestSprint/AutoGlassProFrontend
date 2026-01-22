#!/bin/bash
set -euo pipefail

# Usage: ./connect.sh
# Edit these variables as needed
PEM_PATH="/Users/${USER}/Documents/autopane/autopaneai (1).pem"  # Path to your .pem file
EC2_HOST="ec2-user@ec2-35-175-186-21.compute-1.amazonaws.com"  # Your EC2 user and host

# Connect to EC2 instance
ssh -i "$PEM_PATH" "$EC2_HOST"


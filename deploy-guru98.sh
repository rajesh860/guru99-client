#!/bin/bash
# Deploy 7Wickets Client → guru98.co (DigitalOcean droplet)
set -e

# Extract domain from VITE_API_BASE_URL in .env.guru98
DOMAIN=$(grep -E '^VITE_API_BASE_URL=' .env.guru98 | head -1 | sed 's|VITE_API_BASE_URL=https\?://||' | cut -d'/' -f1)
if [ -z "$DOMAIN" ]; then
  echo "❌ VITE_API_BASE_URL not found in .env.guru98"
  exit 1
fi

DROPLET="root@157.245.105.206"
KEY="$HOME/.ssh/digitalocean_key"
REMOTE_PATH="/var/www/clientGuru"

echo "🔨 Building for guru98 ($DOMAIN)..."
npx vite build --mode guru98

echo "📤 Uploading to droplet ($DROPLET)..."
rsync -avz --delete -e "ssh -i $KEY -o ConnectTimeout=30" build/ $DROPLET:$REMOTE_PATH/

echo "✅ Deploy done! → https://$DOMAIN"

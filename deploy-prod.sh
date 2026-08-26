#!/bin/bash
# Deploy 7Wickets Client → PROD
set -e

# Extract domain from VITE_API_BASE_URL in .env
DOMAIN=$(grep -E '^VITE_API_BASE_URL=' .env | head -1 | sed 's|VITE_API_BASE_URL=https\?://||' | cut -d'/' -f1)
if [ -z "$DOMAIN" ]; then
  echo "❌ VITE_API_BASE_URL not found in .env"
  exit 1
fi

EC2="ubuntu@13.235.184.38"
PEM="/Users/rajesh/Documents/guru99.pem"
REMOTE_PATH="/home/ubuntu/ui/clientGuru"

echo "🔨 Building for PROD ($DOMAIN)..."
npx vite build --mode prod

echo "📤 Uploading to PROD server ($EC2)..."
rsync -avz --delete -e "ssh -i $PEM -o ConnectTimeout=30" build/ $EC2:$REMOTE_PATH/

echo "✅ PROD deploy done! → https://$DOMAIN"
# npm run deploy:prod
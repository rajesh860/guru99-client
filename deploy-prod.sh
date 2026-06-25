#!/bin/bash
# Deploy 7Wickets Client → PROD (guru99.co)
set -e

EC2="ubuntu@13.235.184.38"
PEM="/Users/rajesh/Documents/guru99.pem"
REMOTE_PATH="/home/ubuntu/ui/clientGuru"

echo "🔨 Building for PROD (guru99.co)..."
npx vite build --mode prod

echo "📤 Uploading to PROD server ($EC2)..."
rsync -avz --delete -e "ssh -i $PEM -o ConnectTimeout=30" build/ $EC2:$REMOTE_PATH/

echo "✅ PROD deploy done! → https://guru99.co"
# npm run deploy:prod

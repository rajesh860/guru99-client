#!/bin/bash
# Deploy 7Wickets Client → DEV (13.235.91.22)
set -e

EC2="ubuntu@13.235.91.22"
REMOTE_PATH="/home/ubuntu/ui/client"

echo "🔨 Building for DEV (13.235.91.22)..."
npx vite build --mode dev

echo "📤 Uploading to DEV server ($EC2)..."
rsync -avz --delete -e "ssh -o ConnectTimeout=30" build/ $EC2:$REMOTE_PATH/

echo "✅ DEV deploy done! → http://13.235.91.22"
# npm run deploy:dev	
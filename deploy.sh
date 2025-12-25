#!/bin/bash

echo "🚀 Bắt đầu deploy Google Reviews Widget..."

# Build widget
echo "📦 Building widget..."
cd frontend/embed
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Widget build failed!"
    exit 1
fi
cd ../..

# Build backend
echo "📦 Building backend..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
cd ..

echo "✅ Build thành công!"
echo ""
echo "📋 Bước tiếp theo:"
echo "1. Cài Vercel CLI (nếu chưa có): npm install -g vercel"
echo "2. Đăng nhập Vercel: vercel login"
echo "3. Deploy: vercel"
echo ""
echo "Sau khi deploy, nhớ thêm Environment Variables trên Vercel Dashboard:"
echo "  - GOOGLE_API_KEY"
echo "  - OPENAI_API_KEY"
echo "  - NEXT_PUBLIC_WIDGET_BASE_URL (URL Vercel của bạn)"
echo "  - OVERRIDE_SYNC_CRON (0 0 1,15 * *)"
echo ""
echo "Xem chi tiết trong file: DEPLOY_STEP_BY_STEP.md"


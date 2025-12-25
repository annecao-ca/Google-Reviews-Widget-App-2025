# 🚀 Hướng dẫn Deploy Nhanh

## ✅ Đã hoàn thành

- ✅ Widget đã được build
- ✅ Backend đã được build  
- ✅ File `vercel.json` đã được tạo
- ✅ Script `deploy.sh` đã sẵn sàng

## 📋 Các bước tiếp theo (5-10 phút)

### Bước 1: Cài Vercel CLI

```bash
npm install -g vercel
```

### Bước 2: Đăng nhập Vercel

```bash
vercel login
```

Sẽ mở trình duyệt để đăng nhập (hoặc tạo tài khoản mới nếu chưa có).

### Bước 3: Deploy

Từ thư mục project:

```bash
cd "/Users/queeniecao/Saas Google Reviews Widget AI"
vercel
```

**Trả lời các câu hỏi:**
- `Set up and deploy?` → **Y**
- `Which scope?` → Chọn account của bạn
- `Link to existing project?` → **N**
- `What's your project's name?` → Nhấn **Enter** (dùng tên mặc định)
- `In which directory is your code located?` → **./**
- `Want to override the settings?` → **N**

### Bước 4: Copy URL

Sau khi deploy xong, Vercel sẽ hiển thị:
```
✅ Production: https://your-app-xxxxx.vercel.app
```

**Copy URL này!** (Bạn sẽ cần nó ở bước sau)

### Bước 5: Thêm Environment Variables

1. Mở [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click vào project vừa deploy
3. Vào **Settings** → **Environment Variables**
4. Thêm 4 biến sau:

#### Biến 1: GOOGLE_API_KEY
- **Name**: `GOOGLE_API_KEY`
- **Value**: (Dán API key Google của bạn)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### Biến 2: OPENAI_API_KEY  
- **Name**: `OPENAI_API_KEY`
- **Value**: (Dán OpenAI key của bạn)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### Biến 3: NEXT_PUBLIC_WIDGET_BASE_URL
- **Name**: `NEXT_PUBLIC_WIDGET_BASE_URL`
- **Value**: `https://your-app-xxxxx.vercel.app` (thay bằng URL thật của bạn)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### Biến 4: OVERRIDE_SYNC_CRON
- **Name**: `OVERRIDE_SYNC_CRON`
- **Value**: `0 0 1,15 * *` (2 tuần 1 lần)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

### Bước 6: Redeploy

1. Vào tab **Deployments**
2. Click **"..."** ở deployment mới nhất
3. Chọn **"Redeploy"**
4. Đợi 1-2 phút

### Bước 7: Test

Mở trình duyệt, test các URL sau:

- ✅ `https://your-app.vercel.app/api/health` → Phải thấy `{"status":"ok"}`
- ✅ `https://your-app.vercel.app/widget.js` → Phải tải được file JavaScript
- ✅ `https://your-app.vercel.app/embed.js` → Phải tải được file JavaScript

### Bước 8: Cập nhật Dashboard Local

1. Mở file `.env` ở thư mục gốc
2. Thêm/sửa dòng:
   ```env
   NEXT_PUBLIC_WIDGET_BASE_URL=https://your-app-xxxxx.vercel.app
   ```
3. Restart dashboard:
   ```bash
   npm run dev:dashboard
   ```

### Bước 9: Tạo Widget mới

1. Vào `http://localhost:3100`
2. Tạo widget mới
3. **Mã embed code sẽ tự động dùng URL Vercel!**
4. Copy mã và dán vào website

## 🎉 Xong!

Widget giờ sẽ hoạt động trên website thật của bạn!

## ❓ Cần giúp đỡ?

Nếu gặp vấn đề, xem file `DEPLOY_STEP_BY_STEP.md` để có hướng dẫn chi tiết hơn.


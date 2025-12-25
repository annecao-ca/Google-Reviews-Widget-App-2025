# Hướng dẫn Deploy từng bước - Google Reviews Widget

## 🎯 Mục tiêu

Deploy backend lên Vercel để widget hoạt động trên website thật.

---

## 📋 Bước 1: Chuẩn bị

### 1.1. Build Widget

```bash
cd frontend/embed
npm run build
cd ../..
```

Kiểm tra file đã được build:
```bash
ls -la frontend/embed/dist/widget.js
```

### 1.2. Build Backend

```bash
cd backend
npm run build
cd ..
```

Kiểm tra:
```bash
ls -la backend/dist/index.js
```

---

## 📋 Bước 2: Cài Vercel CLI

### 2.1. Cài đặt

```bash
npm install -g vercel
```

### 2.2. Đăng nhập

```bash
vercel login
```

Sẽ mở trình duyệt để đăng nhập Vercel (hoặc tạo tài khoản mới).

---

## 📋 Bước 3: Deploy lên Vercel

### 3.1. Từ thư mục gốc project

```bash
cd "/Users/queeniecao/Saas Google Reviews Widget AI"
vercel
```

### 3.2. Trả lời các câu hỏi

```
? Set up and deploy? [Y/n] Y
? Which scope? (Chọn account của bạn)
? Link to existing project? [y/N] N
? What's your project's name? (Nhấn Enter để dùng tên mặc định)
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

### 3.3. Lấy URL

Sau khi deploy xong, Vercel sẽ hiển thị URL, ví dụ:
```
✅ Production: https://your-app.vercel.app
```

**Copy URL này** - bạn sẽ cần nó ở bước sau!

---

## 📋 Bước 4: Cấu hình Environment Variables

### 4.1. Vào Vercel Dashboard

1. Mở [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click vào project vừa deploy

### 4.2. Thêm Environment Variables

1. Vào **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Thêm từng biến sau:

**Biến 1:**
- **Name**: `GOOGLE_API_KEY`
- **Value**: (Dán API key Google của bạn)
- **Environment**: Production, Preview, Development (tích cả 3)

**Biến 2:**
- **Name**: `OPENAI_API_KEY`
- **Value**: (Dán OpenAI key của bạn)
- **Environment**: Production, Preview, Development

**Biến 3:**
- **Name**: `NEXT_PUBLIC_WIDGET_BASE_URL`
- **Value**: `https://your-app.vercel.app` (thay bằng URL thật của bạn)
- **Environment**: Production, Preview, Development

**Biến 4:**
- **Name**: `OVERRIDE_SYNC_CRON`
- **Value**: `0 0 1,15 * *` (2 tuần 1 lần)
- **Environment**: Production, Preview, Development

### 4.3. Redeploy

1. Vào tab **Deployments**
2. Click **"..."** ở deployment mới nhất
3. Chọn **"Redeploy"**
4. Đợi deploy xong (1-2 phút)

---

## 📋 Bước 5: Test Backend

### 5.1. Test Health Endpoint

Mở trình duyệt, vào:
```
https://your-app.vercel.app/api/health
```

Phải thấy: `{"status":"ok","service":"google-reviews-widget"}`

### 5.2. Test Widget Files

- `https://your-app.vercel.app/widget.js` → Phải tải được file JavaScript
- `https://your-app.vercel.app/embed.js` → Phải tải được file JavaScript

---

## 📋 Bước 6: Cập nhật Dashboard Local

### 6.1. Sửa file `.env`

Mở file `.env` ở thư mục gốc, thêm/sửa:

```env
NEXT_PUBLIC_WIDGET_BASE_URL=https://your-app.vercel.app
```

(Lưu ý: Thay `your-app.vercel.app` bằng URL thật của bạn)

### 6.2. Restart Dashboard

```bash
# Dừng dashboard (Ctrl + C)
npm run dev:dashboard
```

---

## 📋 Bước 7: Tạo Widget mới với URL thật

### 7.1. Vào Dashboard

Mở `http://localhost:3100`

### 7.2. Tạo Widget

1. Nhập tên/địa chỉ doanh nghiệp
2. Bấm "Tạo widget"
3. **Mã embed code sẽ tự động dùng URL từ Vercel!**

### 7.3. Copy mã embed

Mã sẽ có dạng:
```html
<div id="google-reviews-widget"></div>
<script src="https://your-app.vercel.app/widget.js" async></script>
<script
  defer
  src="https://your-app.vercel.app/embed.js"
  data-container-id="google-reviews-widget"
  data-backend="https://your-app.vercel.app"
  data-widget-id="w_xxxxxx">
</script>
```

---

## 📋 Bước 8: Dán vào Website

### 8.1. Copy toàn bộ mã embed

Từ dashboard, copy **toàn bộ** mã embed (bao gồm cả `<div>` và 2 `<script>`)

### 8.2. Dán vào Website Builder

1. Vào website builder (Wix, Squarespace, WordPress...)
2. Tìm phần **"Custom HTML"** hoặc **"Embed Code"**
3. Dán mã vào
4. **Lưu ý**: Đảm bảo dán đầy đủ, không thiếu dấu `<` ở đầu

### 8.3. Kiểm tra

1. Publish website
2. Mở trang có widget
3. Widget sẽ hiển thị reviews sau vài giây

---

## ✅ Checklist

Trước khi dán vào website, đảm bảo:

- [ ] Backend đã deploy lên Vercel
- [ ] Environment Variables đã được thêm
- [ ] Test `/api/health` thành công
- [ ] Test `/widget.js` và `/embed.js` tải được
- [ ] Widget đã được sync (có dữ liệu)
- [ ] Mã embed code có URL HTTPS (không phải localhost)
- [ ] Widget ID đúng

---

## 🐛 Troubleshooting

### Widget không hiển thị

1. **Mở Console** (F12 → Console tab)
2. Xem có lỗi gì không:
   - `Failed to load resource` → Backend không accessible
   - `CORS error` → Cần kiểm tra CORS settings
   - `404 Not Found` → Widget files không tìm thấy

### Backend trả về 500

1. Vào Vercel Dashboard → **Deployments**
2. Click vào deployment mới nhất
3. Xem **Logs** để biết lỗi cụ thể
4. Thường là thiếu Environment Variables

### Widget files không load

1. Kiểm tra file có tồn tại không:
   ```bash
   ls -la frontend/embed/dist/widget.js
   ```
2. Đảm bảo đã build widget trước khi deploy
3. Kiểm tra route `/widget.js` trong backend có đúng không

---

## 📞 Cần giúp đỡ?

Nếu gặp vấn đề, gửi mình:
1. URL Vercel của bạn
2. Lỗi trong Console (F12)
3. Logs từ Vercel Dashboard


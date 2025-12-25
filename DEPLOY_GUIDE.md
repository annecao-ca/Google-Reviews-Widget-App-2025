# Hướng dẫn Deploy Google Reviews Widget lên Server

## Tổng quan

Để widget hoạt động trên website thật, bạn cần:
1. Deploy backend lên server (Vercel, Railway, hoặc Heroku)
2. Upload widget files lên CDN hoặc serve từ backend
3. Cập nhật mã embed code với URL thật

---

## Phương án 1: Deploy lên Vercel (Khuyến nghị - Dễ nhất)

### Bước 1: Chuẩn bị

1. **Cài Vercel CLI** (nếu chưa có):
   ```bash
   npm install -g vercel
   ```

2. **Đăng nhập Vercel**:
   ```bash
   vercel login
   ```

### Bước 2: Tạo file cấu hình cho Vercel

Tạo file `vercel.json` ở thư mục gốc project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/widget.js",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/embed.js",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "backend/src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Bước 3: Build backend

```bash
cd backend
npm run build
```

### Bước 4: Deploy

```bash
# Từ thư mục gốc project
vercel

# Lần đầu sẽ hỏi:
# - Set up and deploy? Y
# - Which scope? Chọn account của bạn
# - Link to existing project? N
# - Project name? (Enter để dùng tên mặc định)
# - Directory? ./
# - Override settings? N
```

### Bước 5: Cấu hình Environment Variables

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project vừa deploy
3. Vào **Settings** → **Environment Variables**
4. Thêm các biến:
   - `GOOGLE_API_KEY` = API key của bạn
   - `OPENAI_API_KEY` = OpenAI key (nếu có)
   - `NEXT_PUBLIC_WIDGET_BASE_URL` = URL Vercel của bạn (ví dụ: `https://your-app.vercel.app`)
   - `OVERRIDE_SYNC_CRON` = `0 0 1,15 * *` (2 tuần 1 lần)

5. **Redeploy** để áp dụng biến môi trường:
   - Vào **Deployments** → Click **"..."** → **Redeploy**

### Bước 6: Copy URL và cập nhật mã embed

1. Lấy URL từ Vercel (ví dụ: `https://your-app.vercel.app`)
2. Vào dashboard local → Tạo widget mới
3. Mã embed code sẽ tự động dùng URL từ `NEXT_PUBLIC_WIDGET_BASE_URL`

---

## Phương án 2: Deploy lên Railway (Đơn giản, có free tier)

### Bước 1: Tạo tài khoản Railway

1. Vào [railway.app](https://railway.app)
2. Đăng ký/đăng nhập bằng GitHub

### Bước 2: Tạo project mới

1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repository của bạn (hoặc tạo mới)

### Bước 3: Cấu hình

1. Railway sẽ tự detect Node.js
2. Vào **Settings** → **Variables**
3. Thêm các biến môi trường:
   - `GOOGLE_API_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_WIDGET_BASE_URL` = URL Railway của bạn
   - `OVERRIDE_SYNC_CRON` = `0 0 1,15 * *`

### Bước 4: Deploy

Railway sẽ tự động deploy khi bạn push code lên GitHub.

---

## Phương án 3: Serve Widget Files từ Backend (Không cần CDN)

Nếu bạn muốn serve widget files trực tiếp từ backend (đã có sẵn trong code):

### Backend đã có routes:
- `/widget.js` - serve file widget đã build
- `/embed.js` - serve loader script

### Cần đảm bảo:

1. **Build widget trước khi deploy**:
   ```bash
   cd frontend/embed
   npm run build
   ```

2. **Backend sẽ tự động serve** các file này khi deploy

---

## Sau khi Deploy

### 1. Test Backend

Mở trình duyệt và test:
- `https://your-domain.com/api/health` → Phải trả về `{"status":"ok"}`
- `https://your-domain.com/widget.js` → Phải tải được file JavaScript
- `https://your-domain.com/embed.js` → Phải tải được file JavaScript

### 2. Cập nhật Dashboard

Sửa file `.env` ở thư mục gốc:
```env
NEXT_PUBLIC_WIDGET_BASE_URL=https://your-domain.com
```

Restart dashboard:
```bash
npm run dev:dashboard
```

### 3. Tạo Widget mới

1. Vào dashboard `http://localhost:3100`
2. Tạo widget mới
3. Mã embed code sẽ tự động dùng URL từ `NEXT_PUBLIC_WIDGET_BASE_URL`

### 4. Copy mã embed vào website

Mã embed sẽ có dạng:
```html
<div id="google-reviews-widget"></div>
<script src="https://your-domain.com/widget.js" async></script>
<script
  defer
  src="https://your-domain.com/embed.js"
  data-container-id="google-reviews-widget"
  data-backend="https://your-domain.com"
  data-widget-id="w_xxxxxx">
</script>
```

---

## Lưu ý quan trọng

1. **CORS**: Backend đã có CORS middleware, nên website của bạn có thể gọi API
2. **HTTPS**: Website builder (Wix, Squarespace...) yêu cầu HTTPS, đảm bảo backend dùng HTTPS
3. **Rate Limits**: Google API có giới hạn, đừng sync quá thường xuyên
4. **API Keys**: Không commit API keys vào GitHub, chỉ dùng Environment Variables

---

## Troubleshooting

### Widget không hiển thị

1. Mở Console (F12) xem lỗi
2. Kiểm tra backend có đang chạy không: `https://your-domain.com/api/health`
3. Kiểm tra widget files có load được không: `https://your-domain.com/widget.js`
4. Kiểm tra widget đã được sync chưa (có dữ liệu)

### CORS Error

Backend đã có `app.use(cors())`, nhưng nếu vẫn lỗi, có thể cần:
```typescript
app.use(cors({
  origin: '*', // Hoặc chỉ định domain cụ thể
  credentials: true
}));
```

### 404 Not Found cho widget.js

Đảm bảo:
1. Đã build widget: `cd frontend/embed && npm run build`
2. File `frontend/embed/dist/widget.js` tồn tại
3. Backend route `/widget.js` đang serve đúng file

---

## Next Steps

Sau khi deploy thành công:
1. Test widget trên website thật
2. Cấu hình cron job để tự động sync (2 tuần hoặc 1 tháng)
3. Monitor usage và costs của Google API


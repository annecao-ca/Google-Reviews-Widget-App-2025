# ✅ Sẵn sàng Deploy - Google Reviews Widget App

## Đã hoàn thành

### ✅ Phần 1: Database Setup
- [x] Đã cập nhật Prisma schema sang PostgreSQL (`backend/prisma/schema.prisma`)
- [ ] **Cần làm**: Tạo PostgreSQL database trên Railway/Supabase/Neon và lấy connection string

### ✅ Phần 2: Build các thành phần
- [x] Widget embed đã được build: `frontend/embed/dist/widget.js` ✅
- [x] Backend đã được build: `backend/dist/index.js` ✅
- [x] Prisma client đã được generate ✅

## Bước tiếp theo: Deploy

### Option A: Deploy Backend lên Railway (Khuyến nghị)

#### 1. Tạo Railway Project
1. Đăng nhập [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Chọn repository của bạn
4. Railway sẽ tự động detect project

#### 2. Cấu hình Railway Service
1. Railway sẽ tạo service từ root directory
2. **Root Directory**: Để mặc định (root) hoặc set `backend/` nếu muốn
3. **Build Command**: 
   ```bash
   cd backend && npm install && npm run build
   ```
4. **Start Command**:
   ```bash
   cd backend && node dist/index.js
   ```
   Hoặc nếu root directory là `backend/`:
   ```bash
   node dist/index.js
   ```

#### 3. Environment Variables cho Backend (Railway)
Thêm trên Railway Dashboard (Settings → Variables):
- `GOOGLE_API_KEY` - Google Cloud API key (cần bật Places API (New) và Gemini API)
- `DATABASE_URL` - PostgreSQL connection string từ Supabase/Neon/Railway
- `NEXT_PUBLIC_WIDGET_BASE_URL` - URL backend từ Railway (sẽ có sau khi deploy, format: `https://your-app.up.railway.app`)
- `PORT` - Railway tự động set qua `$PORT` environment variable
- `NODE_ENV` - Set `production`

#### 4. Setup PostgreSQL trên Railway (Optional)
Nếu muốn dùng Railway PostgreSQL:
1. Trong Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Railway sẽ tự động tạo `DATABASE_URL` environment variable
3. Chạy migrations:
   ```bash
   cd backend && npx prisma db push --schema=prisma/schema.prisma
   ```

#### 5. Verify Backend Deployment
- Test: `https://your-app.up.railway.app/api/health` → phải trả về `{"status":"ok"}`
- Test: `https://your-app.up.railway.app/widget.js` → phải tải được file
- Test: `https://your-app.up.railway.app/embed.js` → phải tải được file

### Option B: Deploy Frontend Dashboard lên Vercel

#### 1. Cấu hình Vercel cho Dashboard
- Root Directory: `frontend/dashboard`
- Framework Preset: Next.js
- Build Command: `npm run build` (tự động)
- Output Directory: `.next` (tự động)

#### 2. Deploy Dashboard
- Import repository vào Vercel
- Set Root Directory: `frontend/dashboard`
- Deploy

#### 3. Environment Variables cho Dashboard
- `NEXT_PUBLIC_BACKEND_URL` - URL backend từ Railway (ví dụ: `https://your-app.up.railway.app`)
- `NEXT_PUBLIC_WIDGET_BASE_URL` - URL backend (giống trên)

## Checklist trước khi deploy

- [x] Prisma schema đã đổi sang PostgreSQL
- [x] Widget đã được build (`frontend/embed/dist/widget.js` tồn tại)
- [x] Backend đã được build (`backend/dist/index.js` tồn tại)
- [ ] PostgreSQL database đã được tạo và có connection string
- [ ] Google API Key đã có và đã bật Places API (New) + Gemini API
- [ ] Đã đăng nhập Railway và kết nối GitHub repo
- [ ] Đã đăng nhập Vercel

## Lưu ý quan trọng

1. **Database**: Production phải dùng PostgreSQL, không dùng SQLite
2. **API Keys**: Đảm bảo Google API Key có đủ quota và đã bật đúng APIs
3. **Widget Files**: Backend serve widget files từ `frontend/embed/dist/` và `frontend/embed/embed.js`
4. **Environment Variables**: Phải set trên cả Backend (Railway) và Frontend (Vercel)

## Troubleshooting

- Nếu widget.js không load: kiểm tra build đã chạy và file tồn tại
- Nếu database errors: kiểm tra DATABASE_URL và Prisma schema đã đổi sang PostgreSQL
- Nếu API errors: kiểm tra GOOGLE_API_KEY và logs trên Railway
- Nếu Railway deployment fails: kiểm tra build command và start command đúng chưa


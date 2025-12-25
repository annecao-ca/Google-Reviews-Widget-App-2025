# 🌟 Saas Google Reviews Widget AI

Biến đánh giá Google Maps thành các Widget tuyệt đẹp trên website của bạn với sự hỗ trợ của AI. Dự án đã sẵn sàng cho môi trường sản xuất.

## 🚀 Tính năng chính
- **Bento Grid & Glassmorphism UI**: Giao diện cao cấp theo phong cách Apple.
- **AI Review Insights**: Tự động tóm tắt đánh giá bằng Gemini AI.
- **3D Tilt Effect**: Hiệu ứng thẻ đánh giá sống động khi di chuột.
- **Multi-widget Architecture**: Một doanh nghiệp có thể có nhiều phong cách widget khác nhau.
- **Embeddable Widget**: Dễ dàng chèn vào bất kỳ website nào với 1 đoạn mã duy nhất.

---

## 🛠️ Cấu trúc dự án
- `/backend`: Node.js/Express API, Prisma ORM, AI Logic.
- `/frontend/dashboard`: Next.js App (Dashboard quản lý widget).
- `/frontend/embed`: TypeScript/Vite (Mã nguồn widget chèn vào web).

---

## 📦 Hướng dẫn Deployment (Triển khai)

### 1. Database (Dữ liệu)
Trong môi trường Production, nên sử dụng **PostgreSQL** thay vì SQLite.
- Khuyên dùng: [Supabase](https://supabase.com/) hoặc [Neon](https://neon.tech/).
- Thay đổi `DATABASE_URL` trong `.env` sang link PostgreSQL của bạn.
- Chạy: `cd backend && npx prisma db push` để tạo bảng.

### 2. Backend (Render / Railway / Fly.io)
- Cấu hình Command Start: `npm install && npm run build && npm run start` (từ thư mục root).
- Environment Variables cần thiết:
  - `DATABASE_URL`: Link PostgreSQL.
  - `GOOGLE_API_KEY`: API Key của Google (cần bật Places API & Gemini API).
  - `PORT`: 4000 (mặc định).
  - `NEXT_PUBLIC_WIDGET_BASE_URL`: Link domain của backend sau khi deploy (VD: `https://my-backend.render.com`).

### 3. Frontend Dashboard (Vercel)
- Nhập repository lên Vercel.
- Cài đặt "Root Directory" là `frontend/dashboard`.
- Environment Variables:
  - `NEXT_PUBLIC_BACKEND_URL`: Link domain của backend (VD: `https://my-backend.render.com`).

---

## 💻 Chạy ở máy local
1. Cài đặt: `npm run install:all`
2. Tạo file `.env` trong thư mục gốc (xem `.env.example`).
3. Chạy Backend: `npm run dev:backend`
4. Chạy Dashboard: `npm run dev:dashboard` (tại http://localhost:3100)

---

## 📁 Tệp tin Environment mẫu (.env.example)
```env
# Google Cloud
GOOGLE_API_KEY=your_google_api_key_here

# Database
DATABASE_URL="file:./dev.db" # Local SQLite
# DATABASE_URL="postgresql://user:pass@host:5432/db" # Production PostgreSQL

# URLs
NEXT_PUBLIC_WIDGET_BASE_URL=http://localhost:4000
```

---

Dự án được xây dựng với sự hỗ trợ của **Antigravity AI**. Chúc bạn thành công! 🚀

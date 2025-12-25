# Hướng dẫn cấu hình Google Places API (New)

## Lỗi hiện tại
```
API_KEY_SERVICE_BLOCKED
Requests to this API places.googleapis.com method google.maps.places.v1.Places.SearchText are blocked.
```

## Các bước khắc phục

### Bước 1: Tạo API Key (nếu chưa có)

1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Chọn project của bạn (hoặc tạo project mới)
3. Vào **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → chọn **"API key"**
5. Copy API key vừa tạo

### Bước 2: Bật Places API (New)

**QUAN TRỌNG**: Phải bật **"Places API (New)"** (không phải "Places API" cũ)

1. Vào **APIs & Services** → **Library**
2. Tìm kiếm: **"Places API (New)"**
3. Click vào **"Places API (New)"**
4. Click nút **"ENABLE"** (màu xanh)
5. Đợi vài giây để API được kích hoạt

### Bước 3: Cấu hình API Key Restrictions (Tùy chọn nhưng khuyến nghị)

1. Vào **APIs & Services** → **Credentials**
2. Click vào API key bạn vừa tạo
3. Trong phần **"API restrictions"**:
   - Chọn **"Restrict key"**
   - Chọn **"Places API (New)"** trong danh sách
4. Trong phần **"Application restrictions"**:
   - Có thể để **"None"** (để test) hoặc **"IP addresses"** (nếu deploy lên server)
5. Click **"SAVE"**

### Bước 4: Cập nhật .env

Mở file `.env` ở thư mục gốc project và cập nhật:

```env
GOOGLE_API_KEY=AIza...  # API key bạn vừa tạo
```

### Bước 5: Restart Backend

```bash
# Dừng backend (Ctrl + C)
# Chạy lại
npm run dev:backend
```

## Kiểm tra

Sau khi hoàn thành, thử lại trên dashboard:
- Nhập tên/địa chỉ doanh nghiệp
- Bấm "Tạo widget"

Nếu vẫn lỗi, kiểm tra:
- API key có đúng không
- Places API (New) đã được ENABLE chưa
- Xem log trong terminal backend để biết lỗi cụ thể

## Lưu ý

- **Places API (New)** là API mới, khác với **Places API** cũ
- Google đã deprecated Places API cũ, nên phải dùng Places API (New)
- API key phải có quyền truy cập Places API (New) thì mới hoạt động


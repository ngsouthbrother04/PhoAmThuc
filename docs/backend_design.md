# Backend Design

## 1. Backend Design

### 1.1 Tổng quan hệ thống

- Ứng dụng: **Mobile App (React Native - Expo)**
- Backend: **Node.js + Express (TypeScript)**
- Database chính: **PostgreSQL** (with PostGIS)
- Cache: **Redis** (Caching query)
- Database Offline (Mobile): **SQLite** (Content Layer sync)
- Triển khai: **Cloud Managed Services**

Hệ thống gồm 2 phân hệ chính:
1. Mobile Navigation App (Expo)
2. Admin/Content Management & Backend API

---

### 1.2 Data & Pipeline

#### POI Quán Ăn Data
- Phục vụ **10-50 POI quán ăn (phase hiện tại)**
- Dữ liệu gồm:
  - Text mô tả các món ăn, văn hóa
  - Toạ độ GPS (latitude, longitude)
  - Ảnh thumbnail, menu nổi bật

#### Pipeline xử lý dữ liệu

```
CMS / Admin Panel
  → Backend API (Node.js) (Converts Text to Speech via Google TTS)
    → Save MP3 to Storage (S3/Local)
    → PostgreSQL (Saves audio_url and metadata)
      → Mobile App sync (Offline SQLite & Media Cache)
```

- Text POI được **dịch cho 15 ngôn ngữ**
- Audio: **Sinh ra tự động ở Backend qua Cloud TTS API** (như Google TTS) ngay khi Admin thêm/sửa quán ăn. Backend trả về danh sách `audio_url` cho Mobile. 
- Mobile Client tải và phát file âm thanh thay vì tự sinh bằng on-device TTS.

---

### 1.3 Route & Navigation Logic

- Mỗi bản đồ tour (Food Route) được biểu diễn bằng một danh sách có thứ tự `[poi_id_1, poi_id_2, ...]`.
- Các điểm POI custom được lưu trong database riêng.
- Truy vấn PostgreSQL + PostGIS cho các chức năng tìm kiếm quán ăn lân cận (Radius Search) thay vì đường đi ngắn nhất phức tạp.

---

### 1.4 Monitoring & Observability

- Công cụ:
  - Grafana
  - Prometheus
- Theo dõi:
  - Hiệu năng backend và tỷ lệ tải data thành công cho Client.

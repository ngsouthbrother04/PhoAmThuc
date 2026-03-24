# Phân Công Danh Sách Công Việc (Sprints & Branches)

> **Dự án:** Phố Ẩm Thực – Mapped Food Narration System  
> **Kiến trúc:** Monolith (Node.js/Express) + Mobile (React Native/Expo) + Web CMS (React)

Tài liệu này định nghĩa rõ ràng phạm vi công việc, trách nhiệm và tính năng phát triển cho từng thành viên trong nhóm 4 người dựa trên các tài liệu `SPEC_CANONICAL.md`, `ARCHITECTURE.md` và `15_admin_requirements.md`.

---

## 1. Mapping Nhánh & Vai trò (Cốt lõi)

Theo đúng yêu cầu tổ chức dự án, 4 nhánh được phân bổ như sau:

- **Nhánh `3122560001`**: Backend Core (API, Cơ sở dữ liệu, Xác thực, Sync Data)
- **Nhánh `3122410411`**: Backend Features (Google Cloud TTS, Lưu trữ Audio, Batch Analytics, Storage)
- **Nhánh `3122410452`**: Mobile App (Bản đồ màn hình chính, Bản đồ Tour, Play Audio, Offline Sync)
- **Nhánh `3122410466`**: Web Admin CMS (Quản lý Quán ăn, Chạy TTS thủ công, Xem biểu đồ tương tác)

---

## 2. Chi tiết công việc từng Nhánh

### 🌍 Nhánh 1: `3122560001` - Backend Core (Cấu trúc & Dữ liệu nền tảng)
**Trách nhiệm chính:** Thiết kế Schema Database (PostgreSQL), cung cấp API xác thực, API đồng bộ nội dung (One-Load pattern) cho Mobile.

**Nhiệm vụ cụ thể (Tasks):**
- **DB-01:** Thiết kế & Migrate Schema Database (Tạo bảng `points_of_interest`, `tours`, `analytics_events`).
- **AUTH-01:** Viết API Xác thực (`POST /api/v1/auth/claim` và `POST /api/v1/auth/payment/initiate`).
- **SYNC-01:** Viết API `GET /api/v1/sync/manifest` (Trả về contentVersion hiện tại).
- **SYNC-02:** Viết API `GET /api/v1/sync/full` (Trả về toàn bộ JSON data của POIs và Tours cho app tải về một lần duy nhất).
- **CORE-01:** Quản lý Git merge conflict cho file `schema.prisma` hoặc config gốc của Backend.

---

### 🎙 Nhánh 2: `3122410411` - Backend Features (Audio Generation & Analytics)
**Trách nhiệm chính:** Xử lý các logic nặng (Heavy processing) phía Backend, đặc biệt là tích hợp Text-To-Speech (sinh MP3) và thống kê dữ liệu.

**Nhiệm vụ cụ thể (Tasks):**
- **TTS-01:** Viết Background Job / Service tích hợp Google Cloud TTS API. Khi truyền vào 1 đoạn text và list language (15 ngôn ngữ) → Sinh ra file `.mp3`.
- **STOR-01:** Viết module upload file `.mp3` và ảnh (Upload vào AWS S3 hoặc lưu Local File System), trả về URL cố định (`audioUrls`).
- **ADMIN-API-01:** Viết API CRUD phục vụ Admin Web (Create/Edit POI, Tours). Tự động gọi Job TTS khi tạo/sửa POI.
- **DATA-01:** Viết API `POST /api/v1/analytics/batch` hứng dữ liệu log từ Mobile gửi lên lưu vào bảng `analytics_events`.
- **DATA-02:** Viết API thống kê (Aggregate) dữ liệu từ `analytics_events` phục vụ vẽ biểu đồ (Top POI, Tổng giờ nghe, Lọc theo ngày).

---

### 📱 Nhánh 3: `3122410452` - Mobile App (Frontend React Native & Bản đồ offline)
**Trách nhiệm chính:** Phát triển từ đầu đến cuối ứng dụng cho User (Foodie), xử lý luồng Database Offline và Single Voice Rule. Không sử dụng Geofence.

**Nhiệm vụ cụ thể (Tasks):**
- **APP-01:** Dựng Shell Navigation & Màn hình Chào/Xác thực bằng Claim Code.
- **SQLITE-01:** Dựng hệ thống Offline (expo-sqlite). Tự động gọi 2 hàm Sync của Backend để tải data lúc khởi động.
- **MAP-01:** Màn hình chính Map (`react-native-maps`). Lấy data từ SQLite render Marker, hiển thị GPS xanh của user (Foreground). Tap Marker mở Bottom Sheet quán ăn.
- **AUDIO-01:** Dựng **Nhà máy Trạng Thái Audio** (Audio Player State Machine bằng `expo-av`). Bấm "Nghe": Load file MP3 từ URL lưu sẵn, áp dụng chặt chẽ **Single Voice Rule** (Dừng bài cũ, phát bài mới).
- **TOUR-01:** Màn hình "Tour Ẩm Thực". Cho phép chọn Tour -> quay lại bản đồ lọc hiển thị các quán trong Tour.
- **LOG-01:** Cài đặt Buffer lưu log "Bắt đầu nghe", "Dừng nghe" vào db tạm, tự động upload khi có mạng.

---

### 💻 Nhánh 4: `3122410466` - Admin Web CMS (Vận hành & Dashboard)
**Trách nhiệm chính:** Xây dựng cổng dữ liệu Web Panel cho Content Operator (User Admin) để xem biểu đồ và quản lý Quán ăn (Trigger AI Sinh Voice).

**Nhiệm vụ cụ thể (Tasks):**
- **CMS-01:** Xây dựng giao diện Web CMS (ReactJS / Next.js Admin template), trang Đăng nhập Admin.
- **P-CRUD-01:** Form thêm/sửa Quán Ăn đa ngôn ngữ. Form này phải gọi *API của nhánh 3122410411* để sinh file Audio. Cung cấp nút `Regenerate Audio` (Sinh lại âm thanh).
- **T-CRUD-01:** Màn hình quản lý Tour (Cho phép kéo thả hoặc chọn nhiều POI tạo thành tuyến).
- **PUB-01:** Màn hình thiết lập hệ thống - Nút `Publish` để đẩy contentVersion mới cho Mobile Sync.
- **DASH-01:** Dựng trang Analytics Dashboard hiển thị số lượng play, thời gian play, Top POI dưới dạng Biểu đồ (Sử dụng thư viện Chart.js hoặc Recharts). Cung cấp nút `Export CSV` cho thống kê.

---

## 3. Quản lý Rủi Ro Inter-Branch (Conflict chéo)

| Risk | Giải pháp | Phụ trách kết nối |
|------|----------|-------------------|
| **Thay đổi Database Schema** | Giao kèo 100% bằng REST API. Không ai được tự sửa `schema.prisma` ngoại trừ chủ nhánh 3122560001 (Backend Core). | `3122560001` & `3122410411` |
| **Giao tiếp TTS - Dashboard** | Giao diện nút *Tạo Audio* ở Web CMS gọi thẳng API của nhánh Backend Feature. Không encode audio ở Web. | `3122410411` & `3122410466` |
| **Audio File & Mobile Player** | File sinh ra từ TTS phải là định dạng chuẩn (MP3) với URL public hoặc cached. Mobile dùng `expo-av` đọc thẳng URL lưu ở SQLite. | `3122410452` & `3122410411` |

Tất cả các thành viên trước khi Pull Request phải xác nhận **[x] Đã chạy Unit Test** trên máy cá nhân mà không bị dính logic Geofencing rác rưởi của phiên bản cũ.

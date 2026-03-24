# Section 5: Detailed Functional Requirements

← [Back to Index](index.md)

---

## 5. Detailed Functional Requirements

### 5.1 Module 1: Xác thực & Truy cập (UC1)

#### FR-AUTH-001: Màn hình Chào / Chọn Phương thức Truy cập

**Description:** Màn hình đầu tiên khi mở app, cho phép khách chọn cách thanh toán hoặc nhập mã

**UI Components:**

- Logo / banner ảnh khu phố ẩm thực
- Nút "Thanh toán Online"
- Nút "Nhập mã tham gia" (Claim Code)
- Nút "Chọn ngôn ngữ"

**Behavior:**

- Nếu đã có token hợp lệ trong SecureStore → vào thẳng Map
- Nếu chưa xác thực → hiển thị màn hình này

---

#### FR-AUTH-002: Đồng bộ Dữ liệu POI (One-Load Pattern)

**Description:** Tải toàn bộ dữ liệu POI (danh sách quán ăn, văn bản thuyết minh) về thiết bị sau xác thực

**Business Rule:** BR-002 (Offline-first), BR-003 (Data Integrity)

**Flow:**

1. App gọi `GET /api/v1/sync/manifest` → nhận Content Version
2. So sánh với LocalVersion trong SQLite
3. Nếu `ServerVersion > LocalVersion`:
   - Gọi `GET /api/v1/sync/full`
   - Nhận toàn bộ POI data (JSON)
   - **Atomic Replace**: xóa và ghi lại bảng POI trong SQLite
4. Cập nhật `LocalVersion`
5. Chuyển sang màn hình Map

**Failure Handling:**

- Không có mạng + có data cũ → dùng data cũ.
- Không có mạng + không có data → Yêu cầu mạng.

---

### 5.2 Module 2: Khám phá trên Bản đồ (Tap to Play) (UC2)

#### FR-MAP-001: Theo dõi Vị trí Tương đối

**Description:** Hiển thị vị trí thực của người dùng trên bản đồ để định hướng

**Behavior:**

- Sử dụng `expo-location` để lấy tọa độ theo thời gian thực (Foreground)
- KHÔNG sử dụng Background Location vì hệ thống không còn dùng Geofence tự động
- Chỉ phục vụ mục đích chỉ báo vị trí (blue dot) trên bản đồ

#### FR-MAP-002: Hiển thị Bản đồ & Các Quán ăn (POIs)

**Description:** Bản đồ tổng quan chứa tất cả quán ăn

**UI Components:**

- Bản đồ trung tâm (`react-native-maps`)
- Marker trên bản đồ đại diện cho các quán ăn (POIs)
- Nút "Vị trí của tôi" (center map)

**Behavior:**

- Load markers từ SQLite
- Tap vào marker → hiển thị Bottom Sheet thông tin quán (tên, đặc sản, hình ảnh)

#### FR-MAP-003: Play Thuyết minh theo Tương tác (User-Triggered)

**Description:** Khi người dùng chọn nghe thông tin quán

**Behavior:**

- Khách bấm "Nghe thuyết minh" trên Bottom Sheet của quán ăn
- Gọi `expo-av` để play file âm thanh tương ứng với `selectedLocale` từ bộ nhớ máy.
- **Single Voice Rule**: Dừng ngay lập tức âm thanh đang phát (nếu có) trước khi phát bài mới
- Kích hoạt Mini Player (FR-LANG-002)

---

### 5.3 Module 3: Kích hoạt Thủ công qua QR (UC3)

#### FR-QR-001: Giao diện Quét QR

**Description:** Màn hình camera quét QR đặt tại quán ăn

**Behavior:**

- Yêu cầu permission Camera
- Nhận diện QR code chứa `poiId`

#### FR-QR-002: Xử lý QR Code → Phát Thuyết minh

**Description:** Tra cứu thông tin quán và phát thuyết minh từ mã QR

**Behavior:**

- Parse QR content → lấy `poiId`
- Tìm trong SQLite. Nếu có:
  - Dừng audio hiện tại (Single Voice Rule)
  - Phát âm thanh qua `expo-av`
  - Hiển thị thông tin quán
- Nếu không tìm thấy → báo lỗi.

---

### 5.4 Module 4: Chọn Ngôn ngữ & Điều khiển Phát (UC4)

#### FR-LANG-001: Cài đặt Ngôn ngữ

**Description:** Cho khách chọn ngôn ngữ (15+ ngôn ngữ hỗ trợ)

**Behavior:**

- Ngôn ngữ quyết định file MP3 nào được load (`poi.audioUrls[selectedLocale]`)
- Lập tức đổi trạng thái Player và Labels UI
- Nếu thiết bị không hỗ trợ locale → fallback `en-US`

#### FR-LANG-002: Mini Player Điều khiển Playback

**Description:** Thanh Player nổi cho phép điều khiển

**UI Components:**

- Thanh Player gắn ở mép dưới UI (trên các tab navigation)
- Nút Play / Pause / Stop
- Tên quán ăn đang phát

**Behavior:**

- Pause/Resume `expo-av` (âm thanh)
- Stop sẽ dọn dẹp Player, giải phóng bộ nhớ, trở về trạng thái IDLE

---

### 5.5 Module 5: Xem Danh sách Tour (Food Lists) (UC5)

#### FR-TOUR-001: Danh sách Tour Gợi ý

**Description:** Liệt kê các lộ trình/danh sách gợi ý (VD: Top 5 Quán Phở, Ăn vặt chiều tối)

**Behavior:**

- Dữ liệu load từ SQLite
- Tap vào Tour → xem chi tiết FR-TOUR-002

#### FR-TOUR-002: Hiển thị Tuyến Đường Tour / Các điểm

**Description:** Đánh dấu các POI thuộc Tour đó trên bản đồ

**Behavior:**

- Lọc và chỉ hiện các POI thuộc Tour
- Có thể vẽ polyline nối các POI
- Việc phát thuyết minh vẫn do **người dùng chủ động tap** vào từng POI trên tour. Không tự động phát.

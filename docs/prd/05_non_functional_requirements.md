# Section 7: Non-Functional Requirements (NFRs)

← [Back to Index](index.md)

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance

- **NFR-PERF-001:** App khởi động (cold start) trong vòng 3 giây trên thiết bị tầm trung
- **NFR-PERF-002:** Thao tác tap vào marker trên map mở popup thông tin trong vòng 100ms
- **NFR-PERF-003:** TTS phải bắt đầu phát trong vòng 500ms sau khi người dùng nhấn "Nghe thuyết minh"
- **NFR-PERF-004:** Màn hình bản đồ với hàng trăm điểm POI phải render mượt mà trong vòng 1 giây
- **NFR-PERF-005:** Quá trình sync dữ liệu lần đầu hoàn tất trong vòng 30 giây (kết nối 4G ổn định)
- **NFR-PERF-006:** Truy vấn SQLite từ QR Code phải hoàn tất trong 50ms

### 7.2 Offline Capability

- **NFR-OFF-001:** Sau lần tải (sync) duy nhất, app thu thập đủ văn bản, cơ sở dữ liệu để chạy không cần mạng.
- **NFR-OFF-002:** Bản đồ (tiles) có thể phải lấy cache map provider nhưng dữ liệu POI thì hoàn toàn offline.
- **NFR-OFF-003:** Bắt buộc dùng `expo-speech` (On-device Text-to-Speech) để không phụ thuộc API trả về file audio.

### 7.3 Battery & Resource

- **NFR-BAT-001:** Tracker GPS của người dùng chỉ chạy trong Foreground lúc app hiển thị màn hình map. Tiêu thụ pin phải ở mức tối thiểu.
- **NFR-BAT-002:** Tự động ngừng GPS khi đưa app vào background.

### 7.4 Security

- **NFR-SEC-001:** AuthToken phải được lưu trong `expo-secure-store` (encrypted storage)
- **NFR-SEC-002:** Các call xác thực và Sync API POST/GET phải đi qua giao thức TLS (HTTPS) an toàn.
- **NFR-SEC-003:** UUID thiết bị gửi Telemetry hoàn toàn ẩn danh, không chứa IP hoặc dữ liệu PI (Personal Information).

### 7.5 Usability

- **NFR-USE-001:** UI hỗ trợ linh hoạt i18n, các chữ cái font tiếng Thái, Nhật, Hàn hiển thị không bị lỗi.
- **NFR-USE-002:** Bất kỳ thao tác click nào đều cần cho người dùng kết quả hình ảnh ngay lập tức.
- **NFR-USE-003:** Tại vị trí có nắng gắt ngoài đường, màu sắc UI bản đồ phải ở mức tương phản High Contrast rõ ràng.

### 7.6 Reliability

- **NFR-REL-001:** Single Voice Rule: Không thể có 2 luồng âm thanh TTS chạy cùng lúc. Stop ngay cái cũ trước khi khởi động cái mới.
- **NFR-REL-002:** Nếu bị crash trong lúc sync, database SQLite phải ở trạng thái giao dịch an toàn để lần bật tiếp theo sync tiếp tục. Tỷ lệ lỗi phiên phải < 0.5%.

### 7.7 Compatibility

- **NFR-COMP-001:** Hỗ trợ iOS 14+ và Android 10+ (API level 29+)
- **NFR-COMP-002:** Check tính tương thích của TTS engine từng máy để fallback, báo lỗi rõ nếu máy ko tải kịp gói ngôn ngữ cần (VD máy SamSung chưa cài Vietnamese TTS).

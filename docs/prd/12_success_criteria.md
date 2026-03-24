# Section 16: Success Criteria & Acceptance

← [Back to Index](index.md)

---

## 16. Success Criteria

### 16.1 MVP Launch Checklist

Tất cả các mục dưới đây phải đạt ✅ trước khi Go Live:

**Authentication & Authorization:**
- [ ] User hoàn thành thanh toán VNPay/Momo và nhận được JWT token trong vòng 30 giây
- [ ] User nhập mã tham gia hợp lệ → vào được nội dung ngay lập tức
- [ ] JWT token được lưu encrypted trong expo-secure-store
- [ ] Mã đã dùng → báo lỗi rõ ràng, không crash

**Bản đồ & Thuyết minh (Tap to Play):**
- [ ] Bật Location Permission → Vị trí user hiển thị trên bản đồ (Foreground)
- [ ] Tap vào POI trên bản đồ → hiển thị Bottom Sheet thông tin
- [ ] Nhấn "Nghe thuyết minh" → narration bắt đầu trong vòng 1-2 giây
- [ ] Đang nghe quán A, tap nghe quán B → âm thanh quán A dừng lập tức (Single Voice Rule)
- [ ] Dừng app / thoát màn hình → player ngừng nếu cần thiết

**QR Code:**
- [ ] Quét QR code tại quán → mở narration đúng nội dung
- [ ] QR code không hợp lệ → thông báo lỗi user-friendly, không crash
- [ ] QR Mode hoạt động khi offline (POI data đã sync)

**Language & Playback:**
- [ ] Chuyển ngôn ngữ → narration tiếp theo dùng ngôn ngữ mới
- [ ] Nút Play/Pause/Stop trên Mini Player hoạt động đúng
- [ ] Trả về tiếng Anh nếu thiết bị không hỗ trợ ngôn ngữ được chọn

**Offline Functionality:**
- [ ] Sau sync lần đầu, tắt internet → app vẫn hiển thị POI, map, nội dung đầy đủ
- [ ] Offline → không crash, hiển thị cấu hình Offline
- [ ] Reconnect internet → tự động kiểm tra version update

**Khám phá Tuyến phố:**
- [ ] Danh sách các tuyến ẩm thực load từ SQLite khi offline
- [ ] Tuyến detail hiển thị danh sách các quán ăn theo thứ tự
- [ ] "Xem trên bản đồ" → Lọc các quán trên bản đồ

### 16.2 Testing Requirements

**Manual Testing Scenarios:**

| Scenario | Test Method | Expected Result |
|----------|------------|----------------|
| Map Tap Playback | Tap 1 quán rồi tap liền quán khác | Áp dụng đúng Single Voice Rule |
| Foreground GPS | Đi dạo trên phố | Chấm xanh cập nhật đúng vị trí mà pin không sụt nhanh |
| TTS Language Switch | Chuyển VI → EN → ZH | Voice đổi ngay narration tiếp theo |
| Offline Mode | Airplane mode sau sync | Full functionality retained |
| QR Scan | Dùng mã QR thật tại quán | Narration đúng POI |
| Payment Flow | Test VNPay sandbox | Token nhận được, redirect đúng |
| Claim Code | Valid và invalid codes | Correct success/error states |

**Automated Testing Targets:**

- Unit test Narration State Machine (Play/Pause/Stop/Switch)
- Unit test Claim Code validation logic
- Integration test Sync flow (manifest → SQLite write)
- E2E test (Detox): Auth flow, Language selection, QR scan mock

### 16.3 Performance Benchmarks

| Metric | Minimum | Target |
|--------|---------|--------|
| App cold start time | < 5s | < 3s |
| Tap opening bottom sheet latency | < 500ms | < 100ms |
| Initial sync duration (standard dataset) | < 60s | < 30s |
| SQLite query for POI list | < 500ms | < 200ms |
| TTS speech start latency | < 2s | < 1s |

### 16.4 Go-Live Criteria

1. **Zero P0 bugs** tại thời điểm launch
2. **Core flow** pass 100% manual test
3. **Performance benchmarks** đạt Target trên thiết bị mục tiêu (mid-range 2022)
4. **Beta test** với 10 khách thật tại Thực địa phố ẩm thực: satisfaction ≥ 4/5

# Section 6: Acceptance Criteria (Given-When-Then)

← [Back to Index](index.md)

---

## 6. Acceptance Criteria (Given-When-Then)

### AC-001: Thanh toán Online (US-001)

```gherkin
GIVEN tôi mở ứng dụng lần đầu
AND tôi chưa xác thực
WHEN tôi chọn "Thanh toán Online"
THEN ứng dụng mở WebView với trang thanh toán 
WHEN tôi hoàn tất thanh toán thành công
THEN ứng dụng nhận deep link "phoamthuc://payment-result?status=success"
AND tôi được chuyển đến màn hình đồng bộ nội dung
AND AuthToken của tôi được lưu trữ an toàn
```

### AC-002: Nhập Mã Tham Gia (US-001)

```gherkin
GIVEN tôi đang ở màn hình xác thực
WHEN tôi nhấn "Nhập mã tham gia"
AND tôi nhập mã hợp lệ 6 ký tự "ABC123"
AND tôi nhấn "Xác nhận"
THEN ứng dụng xác thực mã với backend
AND nếu thành công, tôi được chuyển đến màn hình đồng bộ nội dung
AND mã vé được đánh dấu là đã sử dụng (không thể dùng lại)

GIVEN tôi nhập mã không hợp lệ "XXXXXX"
WHEN tôi nhấn "Xác nhận"
THEN tôi thấy lỗi "Mã không hợp lệ hoặc đã được sử dụng."
AND tôi có thể thử lại
```

### AC-003: Đồng bộ Dữ liệu Offline (US-002)

```gherkin
GIVEN tôi vừa xác thực thành công
WHEN ứng dụng bắt đầu đồng bộ nội dung
THEN tôi thấy màn hình loading với thanh tiến trình
WHEN đồng bộ hoàn tất
THEN toàn bộ dữ liệu POI (văn bản, tọa độ, thuyết minh) được lưu trong SQLite
AND tôi được chuyển đến màn hình Bản đồ chính
AND các lần mở sau KHÔNG cần tải lại nếu phiên bản nội dung không thay đổi

GIVEN tôi không có kết nối internet nhưng đã từng đồng bộ trước đó
WHEN tôi mở ứng dụng với token hợp lệ
THEN tôi bỏ qua bước đồng bộ và vào thẳng màn hình Bản đồ
AND tôi thấy banner "Đang dùng nội dung cũ (ngày [last_sync_date])"
```

### AC-004: Phát Thuyết minh khi Nhấn POI trên Bản đồ (US-004)

```gherkin
GIVEN tôi đang xem màn hình Bản đồ
WHEN tôi nhấn vào một marker đại diện cho "Quán Phở Thìn"
THEN hiển thị Bottom Sheet thông tin của quán
WHEN tôi nhấn nút "Nghe thuyết minh" trên Bottom Sheet
THEN thuyết minh cho "Quán Phở Thìn" bắt đầu phát bằng ngôn ngữ đã chọn
AND Mini Player xuất hiện ở cuối màn hình
```

### AC-005: Dừng Thuyết minh Hiện Tại (Single Voice Rule) (US-005)

```gherkin
GIVEN thuyết minh "Quán Phở Thìn" đang phát
WHEN tôi nhấn vào quán "Bánh Mì Huỳnh Hoa"
AND tôi nhấn nút "Nghe thuyết minh"
THEN thuyết minh "Quán Phở Thìn" dừng NGAY LẬP TỨC
AND thuyết minh "Bánh Mì Huỳnh Hoa" bắt đầu phát
AND không có sự chồng lấn âm thanh giữa hai quán
```

### AC-006: Hiển thị Vị trí Người dùng (US-006)

```gherkin
GIVEN tôi đang ở màn hình Bản đồ
WHEN tôi cấp quyền truy cập vị trí cho ứng dụng
THEN tôi thấy một chấm xanh trên bản đồ đại diện cho vị trí hiện tại của tôi
AND chấm xanh di chuyển khi tôi đi bộ trên khu phố
AND hệ thống KHÔNG tự động phát âm thanh khi di chuyển (chỉ phục vụ định hướng)
```

### AC-007: Quét QR Code tại Quán (US-007)

```gherkin
GIVEN tôi đứng trước một quán ăn có mã QR của hệ thống
WHEN tôi nhấn biểu tượng quét QR trong ứng dụng
THEN camera mở ra
WHEN tôi quét mã QR hợp lệ
THEN ứng dụng tra cứu thông tin quán ăn trong SQLite
AND nếu đang có thuyết minh khác phát, thuyết minh đó dừng lại
AND thuyết minh của quán vừa quét bắt đầu phát
AND màn hình hiển thị thông tin chi tiết của quán
```

### AC-008: Chọn Ngôn ngữ (US-008)

```gherkin
GIVEN tôi đang ở bất kỳ màn hình nào
WHEN tôi nhấn biểu tượng ngôn ngữ ở góc trên bên phải
THEN hiển thị modal chọn ngôn ngữ với 15+ lựa chọn
WHEN tôi chọn "한국어 (Korean)"
THEN toàn bộ UI chuyển sang tiếng Hàn
AND giọng TTS chuyển sang ko-KR
AND các thuyết minh tiếp theo phát bằng tiếng Hàn

GIVEN thiết bị không có engine TTS tiếng Hàn
WHEN tôi chọn tiếng Hàn
THEN tôi thấy cảnh báo "Giọng đọc tiếng Hàn không khả dụng trên thiết bị. Sử dụng tiếng Anh."
AND thuyết minh fallback sang en-US
```

### AC-009: Giao diện Đổi theo Ngôn ngữ (US-009)

```gherkin
GIVEN tôi đã chọn "Français" làm ngôn ngữ
WHEN tôi xem màn hình danh sách Tour ẩm thực
THEN toàn bộ label UI, nút bấm hiển thị bằng tiếng Pháp
AND tên và mô tả quán ăn hiển thị theo nội dung tiếng Pháp (nếu có)
```

### AC-010: Play / Pause Thuyết minh (US-010)

```gherkin
GIVEN thuyết minh đang phát
WHEN tôi nhấn nút Pause trên Mini Player
THEN thuyết minh dừng tạm thời
AND nút Pause chuyển thành Play

WHEN tôi nhấn nút Play
THEN thuyết minh tiếp tục (hoặc phát lại từ đầu nếu thiết bị không hỗ trợ resume)

WHEN tôi nhấn nút Stop (hoặc tắt player)
THEN thuyết minh dừng hoàn toàn
AND Mini Player ẩn đi
```

### AC-011: Xem Danh sách Tour (US-012)

```gherkin
GIVEN tôi đã đăng nhập và đồng bộ dữ liệu
WHEN tôi chuyển sang tab "Khám phá"
THEN tôi thấy danh sách các chủ đề/tuyến gợi ý (ví dụ: Ăn vặt xế chiều) với ảnh, tên và thời gian ước tính.
```

### AC-012: Xem Lộ trình Tour / Tuyến Ẩm Thực (US-013)

```gherkin
GIVEN tôi chọn một tuyến "Ăn vặt xế chiều"
WHEN tôi nhấn xem chi tiết
THEN tôi thấy danh sách các quán ăn thuộc tuyến này
AND có nút "Xem trên Bản đồ"
WHEN tôi nhấn "Xem trên Bản đồ"
THEN bản đồ hiện ra chỉ với các marker của các điểm trong tuyến
AND tôi tự chủ động nhấn vào từng quán để nghe khi đến nơi
```

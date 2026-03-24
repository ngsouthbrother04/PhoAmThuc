# Test Scenarios

## 3. Test Scenarios

### Scenario 1 – Explore Mode

#### 1. Thanh toán & Truy cập
- Nhập mã ưu đãi / OTP tham gia từ nhân viên
- Chấp nhận xác thực offline (nếu đã nhận mã)
- App chuyển sang màn hình bản đồ quán ăn sau khi sync.

#### 2. Chọn ngôn ngữ
- Chuyển sang tiếng Hàn 
- Giao diện và Text quán ăn đổi sang tiếng Hàn.

#### 3. Tương tác với Bản đồ (Tap-to-Play)
- Chọn marker quán "Phở Thìn".
- Hiển thị pop-up/bottom sheet với nút "Nghe thuyết minh".
- Nhấn "Nghe", TTS phát âm thanh đúng nội dung.
- Các nút Play / Pause / Stop hoạt động đúng.

---

### Scenario 2 – Lộ trình Ẩm thực (Tour Mode)

#### 1. Bắt đầu tour
- Vào tab Khám phá, chọn lộ trình "Ăn vặt sinh viên".
- Hiển thị marker các quán thuộc tour trên bản đồ theo thứ tự.
- Chạm (Tap) vào từng marker để mở thông tin và nghe tay (Không auto-phát).

---

### Scenario 3 – Critical Logic (Single Voice Rule & Overrides)

#### 1. Chuyển đổi TTS mượt mà (Single Voice Override)
- Khách tap vào "Bánh mì Huynh Hoa" và đang nghe dở dở (TTS đang Play).
- Khách lập tức tap vào một quán khác trên map và bấm Nghe.
- TTS của Bánh mì phải STOP lập tức (không đợi đọc xong), và TTS của quán mới phải phát lên.

#### 2. Dừng phát TTS
- Nhấn nút Stop hoặc thu nhỏ App thì TTS phải dừng.

---

### Scenario 4 – System Capabilities

#### 1. Offline Mode
- Tắt kết nối Internet (Wifi / 4G) hẵn hoi.
- Mở App. App hiển thị tốt bản đồ và các Marker (có thể thiếu Map tiles đường phố chi tiết nếu chưa cache, nhưng Marker bắt buộc phải lên).
- Nhấn vào Marker -> Nội dung Text + TTS vẫn hoạt động bình thường (Load từ local SQLite và engine thiết bị).

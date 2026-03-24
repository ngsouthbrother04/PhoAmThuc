# Section 10: UI/UX Specifications

← [Back to Index](index.md)

---

## 10. UI/UX Specifications

### 10.1 Design System

**Color Palette:**

- Primary: Vibrant Orange (`#F97316` / orange-500) — kích thích vị giác, năng động
- Secondary: Chili Red (`#EF4444` / red-500) — ấm áp, ẩm thực
- Neutral: Slate (`#64748B` / slate-500)
- Background: Warm White (`#FAFAF8`)

**Typography:**

- Font: System font (iOS: SF Pro, Android: Roboto)
- Headings: Bold, 700 weight
- Body: Regular, 400 weight

**Spacing:**

- Dùng RN StyleSheet scale: 4, 8, 12, 16, 20, 24, 32
- Safe area insets phải được tôn trọng

---

### 10.2 Navigation Structure

```
App Navigator
├── Auth Stack (chưa đăng nhập)
│   ├── WelcomeScreen      — Chọn mua code/Nhập code
│   ├── PaymentWebView     — WebView thanh toán
│   ├── ClaimCodeScreen    — Nhập mã tham gia
│   └── SyncScreen         — Màn hình loading sync data
│
└── Main Tab Navigator (đã đăng nhập)
    ├── Map Tab            — Bản đồ tổng quan Quán ăn + vị trí khách
    ├── Explore Tab        — Danh sách gợi ý / Tuyến ẩm thực
    └── Settings Tab       — Ngôn ngữ, âm lượng, tải lại data
```

---

### 10.3 Screen Specifications

#### WelcomeScreen

- Background: Ảnh phố ẩm thực nhộn nhịp
- Logo hệ thống Phố Ẩm Thực
- 2 nút lớn: "Mua mã truy cập" và "Nhập mã đã có"
- Nút "Chọn ngôn ngữ"

#### MapScreen (Tab chính)

- **Full-screen map** (MapView của react-native-maps)
- **Mini Player Bar** (bottom, fixed): hiển thị khi đang phát narration
  - Tên Quán + Play/Pause, Stop
- **Floating Action Buttons**:
  - 📷 Quét QR
  - 📍 Vị trí của tôi
- **POI Markers:** marker các quán ăn
- **Bottom Sheet** khi tap POI marker: ảnh + tên + "Nghe thuyết minh"

#### SettingsScreen

- Chọn ngôn ngữ (Quốc kỳ)
- Âm lượng TTS slider
- Nút "Đồng bộ lại nội dung"
- Nút "Đăng xuất"

---

### 10.4 Component Patterns

**Primary Button:**
`backgroundColor: orange-500`

**Mini Player Bar:**
`position: absolute, bottom: tabHeight, height: 72px`

---

### 10.5 Empty & Error States

**No GPS Permission:**
"Ứng dụng cần quyền vị trí để hiển thị bạn đang ở đâu trên bản đồ khu phố ẩm thực."

**TTS Language Not Available:**
"Giọng đọc tiếng [X] không khả dụng trên thiết bị này. Đang dùng tiếng Anh."

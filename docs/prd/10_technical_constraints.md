# Sections 12–13: Technical Constraints & Dependencies

← [Back to Index](index.md)

---

## 12. Technical Constraints

### 12.1 Technology Stack

**Mobile Application:**

| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | React Native 0.81.x (Expo SDK 54) | Cross-platform |
| Location | `expo-location` | Lấy tọa độ User (chỉ Foreground) |
| Audio | `expo-av` | Phát file MP3 đã tải về offline |
| File System | `expo-file-system` | Cache file âm thanh offline |
| Local DB | `expo-sqlite` | Offline POI |
| State | `zustand`, `react-query` | Global và Server state |
| Map | `react-native-maps` | Hiển thị bản đồ |
| QR Scanner | `expo-camera` | Quét mã tại quán |
| Secure Storage | `expo-secure-store` | Lưu token |

**Backend API**:

- Runtime: Node.js 20+ / Express.js
- Database: PostgreSQL + PostGIS

### 12.2 Platform Constraints

**Kiến trúc Đơn giản hóa:**
Hệ thống KHÔNG CÒN sử dụng Background Location và Geofence. Điều này loại bỏ hoàn toàn các rắc rối về Doze mode, iOS background limitations và battery drain. 

- GPS chỉ dùng ở `Foreground` qua `expo-location` watchPositionAsync.

### 12.3 Known Limitations

1. **Audio Storage Size:** Do ứng dụng tải file MP3 để dùng offline, bộ nhớ ứng dụng sẽ nặng hơn so với việc dùng TTS on-device. Tuy nhiên, thay vào đó là chất lượng vượt trội.
2. **Map Tiles Offline:** Cần internet để load bản đồ đường sá (Mapbox/Google Maps tiles).
3. **No Real-Time Update:** Phải re-sync thủ công để cập nhật quán ăn mới.

---

## 13. Dependencies & Integrations

### 13.1 External Services

| Service | Purpose |
|---------|---------|
| VNPay/Momo | Payment gateway |
| AWS/CDN | Static assets (ảnh quán) |

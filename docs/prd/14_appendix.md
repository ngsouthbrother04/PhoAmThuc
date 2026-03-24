# Section 18: Appendix

← [Back to Index](index.md)

---

## 18. Appendix

### 18.1 Glossary

| Term | Definition |
|------|-----------|
| **POI** (Point of Interest) | Điểm quán ăn, nhà hàng cụ thể trong khu phố ẩm thực (ví dụ: Phở Thìn, Bánh mì Huỳnh Hoa). Mỗi POI có id, tên, thực đơn nổi bật và nội dung narration theo từng ngôn ngữ. |
| **TTS** (Text-to-Speech) | Công nghệ đọc văn bản thành giọng nói. MVP dùng `expo-speech` (on-device). |
| **One-Load Pattern** | Chiến lược đồng bộ dữ liệu: tải toàn bộ dataset một lần duy nhất, lưu vào SQLite, và chỉ update khi `contentVersion` thay đổi. |
| **Offline-first** | Nguyên tắc thiết kế: app phải hoạt động đầy đủ mà không cần internet sau lần sync đầu tiên. |
| **Bypass Auto-play** | Hệ thống chỉ phát âm thanh theo cơ chế người dùng tương tác mở. Không theo geofence. |
| **Claim Code** | Mã thay thế thanh toán online để nhận luồng truy cập. |
| **SQLite Mirror** | Bản sao toàn bộ sách quán ăn dataset của server, lưu dưới dạng SQLite trên thiết bị. |
| **JWT** (JSON Web Token) | Token xác thực chứa trạng thái user. Lưu encrypted. |
| **Sync Manifest** | Response từ `/sync/manifest` chứa hash/version của dataset hiện tại trên server. App so sánh với local version để quyết định có sync không. |
| **WebView** | Component hiển thị trang web trong app. Dùng để thanh toán VNPay. |

---

### 18.2 Related Documents

| Document | Path | Description |
|----------|------|-------------|
| System Architecture | [ARCHITECTURE.md](../../ARCHITECTURE.md) | Mô tả chi tiết kiến trúc |
| AI Guidelines | [AI_GUIDELINES.md](../../AI_GUIDELINES.md) | Invariants, business rules cho AI assistant |
| Use Cases | [USE_CASES.md](../../USE_CASES.md) | UC1–UC5 chi tiết |
| Use Case Mapping | [USE_CASE_MAPPING.md](../../USE_CASE_MAPPING.md) | Ma trận mapping UC ↔ Features |
| Backend Design | [docs/backend_design.md](../backend_design.md) | Thiết kế Backend |
| Test Scenarios | [docs/test_scenarios.md](../test_scenarios.md) | Kịch bản kiểm tra |
| Admin Requirements | [15_admin_requirements.md](../../docs/prd/15_admin_requirements.md) | Yêu cầu chi tiết cho Admin CMS |

---

### 18.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03 | AI-assisted | Refactored toàn bộ dự án từ định vị chùa tự động -> Khu phố ẩm thực tương tác chạm. |

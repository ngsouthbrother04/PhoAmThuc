# Sections 14–15: Risks & Open Questions

← [Back to Index](index.md)

---

## 14. Risks & Mitigations

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-001 | Thiết bị không có TTS engine cho ngôn ngữ đã chọn | Medium | High | Fallback to English; hiển thị cảnh báo UI |
| R-002 | Dataset POI quá lớn → sync timeout | Medium | Medium | Phân trang hoặc nén GZIP qua API |
| R-003 | Thanh toán lỗi callback | Medium | High | Nút "Kiểm tra trạng thái thanh toán" thủ công |
| R-004 | Quán ăn quá dày đặc trên bản đồ | High | Medium | Sử dụng Marker Clustering (Supercluster) trên điện thoại |
| R-005 | TTS tự động tắt khi màn hình khóa (OS limitation) | Medium | Low | Cấu hình Audio session cho phép background audio playback |

---

## 15. Open Questions

| ID | Câu hỏi | Priority | Owner |
|----|---------|---------|-------|
| Q1 | Có cần cho người dùng đánh giá / review quán ăn không? (Hiện out-of-scope) | Medium | Product |
| Q2 | App có hỗ trợ map 3D hoặc bản đồ vệ tinh không? | Low | Product |
| Q3 | Token truy cập của mã Code mua tại quầy có hạn sử dụng bao lâu (VD 24h)? | High | Product |
| Q4 | Âm thanh TTS có cần mix với nhạc nền nhẹ không để tăng tính hấp dẫn? | Medium | Product |

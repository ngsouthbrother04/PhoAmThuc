# Section 15: Admin Requirements

← [Back to Index](index.md)

---

## 15. Admin Requirements

### 15.1 Admin Persona

| Field | Value |
|-------|-------|
| Tên đại diện | Quản trị viên Nội dung (Content Operator) |
| Vai trò | Quản lý dữ liệu quán ăn, tour ẩm thực và sinh audio |
| Độ tuổi | 25–45 |
| Trình độ kỹ thuật | Cao (sử dụng CMS web) |
| Ngôn ngữ | Tiếng Việt (chính), hỗ trợ English |

**Goals:**
- Thêm/sửa/xóa POI quán ăn nhanh chóng
- Sinh tự động file MP3 thuyết minh đa ngôn ngữ (15+ ngôn ngữ)
- Quản lý các tuyến Tour ẩm thực
- Đảm bảo dữ liệu đồng bộ kịp thời cho người dùng app

**Pain Points:**
- Phải cập nhật menu, mô tả, audio khi có quán mới hoặc thay đổi
- Cần theo dõi analytics lượt nghe để tối ưu nội dung

---

### 15.2 Detailed Functional Requirements (Admin)

#### FR-ADMIN-001: Đăng nhập Admin Dashboard
**Description:** Quản trị viên truy cập CMS web để quản lý nội dung.  
**Behavior:**  
- Sử dụng JWT (role = admin)  
- Dashboard hiển thị tổng quan: số POI, số Tour, contentVersion hiện tại

#### FR-ADMIN-002: CRUD POI (Quán ăn)
**Description:** Quản lý toàn bộ thông tin quán ăn.  
**UI Components:** Bảng danh sách POI + Form chỉnh sửa  
**Behavior:**  
1. Create/Edit: nhập name (multi-lang), description (multi-lang), latitude/longitude, type, image upload  
2. Auto-trigger: Khi lưu POI → Backend gọi Google Cloud TTS sinh 15 file MP3 → lưu audioUrls vào PostgreSQL  
3. Delete: Xóa POI và audio files liên quan (soft-delete khuyến khích)

#### FR-ADMIN-003: CRUD Tour / Tuyến Ẩm thực
**Description:** Tạo và quản lý các lộ trình gợi ý.  
**Behavior:**  
- Chọn danh sách POI theo thứ tự  
- Nhập name, description (multi-lang), estimatedTime  
- Lưu poiIds array

#### FR-ADMIN-004: Quản lý Media & Audio
**Description:** Upload ảnh quán + xem/trigger lại TTS.  
**Behavior:**  
- Upload image → lưu vào AWS S3/CDN  
- Nút “Regenerate Audio” cho từng POI (toàn bộ ngôn ngữ)

#### FR-ADMIN-005: Bump Content Version & Publish
**Description:** Đẩy bản cập nhật cho người dùng app.  
**Behavior:**  
- Sau khi thay đổi POI/Tour → Admin nhấn “Publish”  
- Tăng contentVersion trong Sync Manifest  
- Mobile app sẽ nhận được version mới khi sync

#### FR-ADMIN-006: Xem Dashboard Analytics (Chi tiết)
**Description:** Quản trị viên xem báo cáo tương tác của người dùng với các POI và Tour để tối ưu nội dung thuyết minh.  
**UI Components:**  
- Dashboard trang chủ với các card KPI (Top 5 POI, Total plays, Total listening time)  
- Biểu đồ tương tác: Bar chart (lượt nghe theo POI), Pie chart (phân bố ngôn ngữ), Line chart (xu hướng theo ngày)  
- Bộ lọc: Khoảng thời gian (Last 7/30/90 days, Custom date range), Loại POI, Ngôn ngữ, Tour  

**Behavior:**  
1. Mặc định hiển thị dữ liệu 30 ngày gần nhất khi vào Dashboard.  
2. Admin có thể filter theo:  
   - Thời gian (date range picker)  
   - POI Type (Món chính / Đồ uống / Ăn vặt / Nhà vệ sinh)  
   - Ngôn ngữ (vi, en, ko, zh, …)  
   - Tour (chỉ hiển thị tương tác trong tour nào)  
3. Hiển thị các chỉ số chính:  
   - Total Plays (số lần nhấn “Nghe thuyết minh” hoặc QR)  
   - Total Listening Duration (tổng thời gian nghe, tính cả pause/resume)  
   - Top 10 POI được nghe nhiều nhất (với % so với tổng)  
   - Phân bố ngôn ngữ phổ biến  
   - Tỷ lệ hoàn thành narration (nghe ≥ 80% thời lượng)  
4. Click vào bất kỳ POI nào trong Top list → chuyển sang trang chi tiết POI với lịch sử nghe của POI đó.  
5. Dữ liệu được lấy từ bảng `analytics_events` (batch upload từ mobile app) và được aggregate realtime hoặc cache 5 phút một lần qua Redis.

**Failure Handling:**  
- Không có dữ liệu → hiển thị “Chưa có tương tác nào trong khoảng thời gian này” kèm nút gợi ý “Tạo POI mới”.  
- Lỗi query → thông báo “Không thể tải dữ liệu analytics” và nút “Thử lại”.

#### FR-ADMIN-007: Export Báo cáo Analytics
**Description:** Quản trị viên xuất file báo cáo để phân tích sâu hoặc gửi cho đối tác.  
**UI Components:** Nút “Export” trên Dashboard và trang chi tiết POI.  
**Behavior:**  
1. Hỗ trợ export 2 định dạng: CSV và Excel (.xlsx).  
2. Các báo cáo có thể export:  
   - Toàn bộ Dashboard (tất cả KPI + biểu đồ dưới dạng table)  
   - Báo cáo chi tiết theo POI  
   - Báo cáo theo Tour  
   - Báo cáo theo ngôn ngữ  
3. File export bao gồm: timestamp, tổng hợp số liệu, và dữ liệu raw (poiId, action, durationMs, language, timestamp).  
4. Export chỉ lấy dữ liệu trong khoảng filter hiện tại.  
5. Tên file tự động: `phoamthuc_analytics_YYYYMMDD.csv`

**Failure Handling:**  
- Export thất bại (ví dụ: file quá lớn) → thông báo rõ ràng và gợi ý “Giảm khoảng thời gian filter”.

---

### 15.3 Acceptance Criteria (Admin)

**AC-ADMIN-001: Tạo POI mới**  
```gherkin
GIVEN tôi đang ở Admin Dashboard
WHEN tôi tạo POI mới với đầy đủ thông tin đa ngôn ngữ và tọa độ
THEN hệ thống tự động sinh 15 file MP3 qua Google Cloud TTS
AND audioUrls được lưu vào PostgreSQL
AND contentVersion được tăng khi Publish
```

**AC-ADMIN-002: Chỉnh sửa POI**  
```gherkin
GIVEN POI đã tồn tại
WHEN tôi chỉnh sửa description hoặc thêm ảnh
THEN audio được regenerate chỉ cho ngôn ngữ thay đổi (hoặc toàn bộ nếu chọn)
AND người dùng app thấy cập nhật sau khi sync
```

**AC-ADMIN-003: Quản lý Tour**  
```gherkin
GIVEN tôi tạo Tour mới
WHEN chọn 5 POI theo thứ tự
THEN Tour xuất hiện đúng trong SQLite của app sau sync
```

**AC-ADMIN-004: Publish & Sync**  
```gherkin
GIVEN có thay đổi POI/Tour
WHEN tôi nhấn Publish
THEN Sync Manifest trả về contentVersion mới
AND app mobile detect và sync full dataset
```

**AC-ADMIN-005: Xem và Export Analytics**  
```gherkin
GIVEN tôi đã có ít nhất 10 tương tác từ người dùng app
WHEN tôi vào Admin Dashboard
THEN tôi thấy đầy đủ KPI, biểu đồ Top POI, phân bố ngôn ngữ và line chart xu hướng
WHEN tôi chọn filter 7 ngày gần nhất và nhấn Export CSV
THEN file được tải về đúng định dạng với tất cả dữ liệu tương ứng filter
AND dữ liệu khớp với analytics_events trong database
```

### 15.4 Technical Notes (Admin)

Admin Dashboard là Web CMS (không phải trong Mobile App).
TTS generation chạy background job (không block API).
Image & Audio lưu trên AWS S3/CDN (theo 10_technical_constraints.md).
Toàn bộ thay đổi phải tuân thủ SPEC_CANONICAL.md (không ảnh hưởng Single Voice Rule của user).

End of Admin Requirements
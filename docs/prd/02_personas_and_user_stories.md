# Sections 3–4: User Personas & User Stories

← [Back to Index](index.md)

---

## 3. User Personas & Roles

### 3.1 Primary Persona: Khách ẩm thực nội địa

| Field | Value |
|-------|-------|
| Tên đại diện | Lan Anh |
| Vai trò | Thực khách / Du khách trong nước |
| Độ tuổi | 20–45 |
| Trình độ kỹ thuật | Trung bình (dùng smartphone hàng ngày) |
| Ngôn ngữ | Tiếng Việt |

**Goals:**

- Khám phá các món ăn ngon, đặc sản tại khu phố ẩm thực
- Tìm hiểu thông tin chi tiết về món ăn, nguồn gốc, văn hóa ẩm thực
- Trải nghiệm tự do, chủ động chọn quán trên bản đồ

**Pain Points:**

- Không có hướng dẫn chi tiết về các món ăn đặc sắc tại khu vực
- Thông tin trên mạng bị phân mảnh, khó tìm kiếm theo vị trí thực tế
- Muốn nghe giới thiệu sinh động thay vì đọc văn bản dài

**Usage Patterns:**

- Sử dụng app khi đi dạo tại khu phố ẩm thực
- Thường xuyên mở bản đồ để tìm các quán ăn gần đó
- Scan mã QR tại quán để nghe thuyết minh trong lúc chờ món

---

### 3.2 Secondary Persona: Khách du lịch quốc tế

| Field | Value |
|-------|-------|
| Tên đại diện | Marco Rossi |
| Vai trò | Du khách nước ngoài |
| Độ tuổi | 25–65 |
| Trình độ kỹ thuật | Trung bình–cao |
| Ngôn ngữ | Tiếng Anh, Hàn, Nhật, Trung... |

**Goals:**

- Hiểu văn hóa ẩm thực địa phương bằng ngôn ngữ mẹ đẻ
- Không bị rào cản ngôn ngữ khi chọn món ăn
- Trải nghiệm văn hóa địa phương đích thực

**Pain Points:**

- Menu quán ăn thường chỉ có tiếng Việt
- Người bán hàng không giao tiếp được ngoại ngữ
- Lo ngại về kết nối mạng di động khi ở nước ngoài

**Usage Patterns:**

- Tham quan theo nhóm hoặc cá nhân
- Cần chọn ngôn ngữ ngay khi mở app
- Hay dùng bản đồ để định vị các điểm ăn uống nổi tiếng

---

## 4. User Stories

### 4.1 User Stories Table

| ID | Module | User Story | Priority | Acceptance Criteria ID | Use Case |
|----|--------|------------|----------|------------------------|----------|
| US-001 | Auth | As a Visitor, I want to pay or enter a claim code so that I can unlock access to the app | P0 (Must) | AC-001 | UC1 |
| US-002 | Auth | As a Visitor, I want all POI content to be downloaded once so that the app works offline | P0 (Must) | AC-003 | UC1 |
| US-003 | Map | As a Visitor, I want to see restaurants/food stalls on a map so that I know what is around me | P0 (Must) | AC-017 | UC2 |
| US-004 | Map | As a Visitor, I want to tap on a restaurant marker to hear narration about its food so that I can explore actively | P0 (Must) | AC-004 | UC2 |
| US-005 | Map | As a Visitor, I want the narration to stop when I tap another restaurant so that sounds do not overlap (Single Voice Rule) | P0 (Must) | AC-006 | UC2 |
| US-006 | Map | As a Visitor, I want to see my current location on the map so that I can navigate to the food stall | P1 (Should) | AC-007 | UC2 |
| US-007 | QR | As a Visitor, I want to scan a QR code at the food stall to trigger narration manually | P0 (Must) | AC-008 | UC3 |
| US-008 | Language | As a Visitor, I want to select my preferred language so that I hear narration in my native language | P0 (Must) | AC-009 | UC4 |
| US-009 | Language | As a Visitor, I want the UI labels to also change when I switch language so that everything is consistent | P1 (Should) | AC-010 | UC4 |
| US-010 | Playback | As a Visitor, I want to play, pause, and stop narration so that I can control my listening experience | P0 (Must) | AC-011 | UC4 |
| US-011 | Playback | As a Visitor, I want to see a mini player showing the current narrating food stall so that I know what I am listening to | P1 (Should) | AC-012 | UC4 |
| US-012 | Tour | As a Visitor, I want to view curated Food Tours / Lists so that I get recommendations on what to eat | P0 (Must) | AC-013 | UC5 |
| US-013 | Tour | As a Visitor, I want to see the Tour route on a map so that I can follow it visually | P0 (Must) | AC-014 | UC5 |

**Priority Legend:**

- **P0 (Must):** Critical for MVP launch; blocks release if missing
- **P1 (Should):** Important for usability; should be included if time permits
- **P2 (Could):** Nice-to-have; can be deferred to post-MVP

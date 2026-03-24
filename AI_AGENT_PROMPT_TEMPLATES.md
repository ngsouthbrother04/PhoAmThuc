# AI Agent Prompt Templates

Bộ prompt mẫu giúp team làm việc nhất quán với AI agent, tránh lệch tài liệu và giảm vibe-coding.

> **Nguyên tắc vận hành:**
>
> - Mỗi task chỉ giao đúng 1 chức năng — không gộp nhiều module trong 1 prompt.
> - AI bắt buộc báo mapping AC trước khi kết thúc.

---

## Thứ tự đọc tài liệu chuẩn

Tất cả các template đều yêu cầu đọc theo thứ tự này:

1. `README.md` (SOURCE OF TRUTH)
2. `TEAM_START_HERE.md`
3. `SPEC_CANONICAL.md`
4. `docs/prd/index.md`
5. `docs/prd/03_functional_requirements.md`
6. `docs/prd/04_acceptance_criteria.md`
7. `EXECUTION_TODO_ISSUES.md`

Nếu có xung đột giữa tài liệu, áp dụng thứ tự ưu tiên trong `SPEC_CANONICAL.md`, với `README.md` ở vị trí cao nhất.

---

## Template 1 — Chức năng tổng quát

**Mục tiêu:** Implement đúng 1 chức năng `<TEN_CHUC_NANG>`.

**Thông tin task:**

- Issue: `<ISSUE_ID>`
- Files được sửa: `<DANH_SACH_FILE>`
- AC cần pass: `<DANH_SACH_AC>`
- Không được thay đổi: `<INVARIANTS_HOAC_DEFAULTS>`

---

## Template 2 — Backend API

**Mục tiêu:** Implement endpoint `<TEN_ENDPOINT>` cho chức năng `<TEN_CHUC_NANG>`.

**Bối cảnh kỹ thuật:** Node.js 20+, Express, TypeScript.

**Yêu cầu thực thi:**

1. Đọc tài liệu theo thứ tự chuẩn, xác nhận contract request/response trước khi code
2. Implement route, validation, error handling và status code đúng chuẩn
3. Không hardcode dữ liệu nếu đã có nguồn từ DB/schema

---

## Template 3 — Bản đồ & Tương tác Thuyết minh

**Mục tiêu:** Implement chức năng `<TEN_CHUC_NANG>` trong luồng tương tác bản đồ.

**Invariants bắt buộc (không được vi phạm):**

1. Quyền quyết định nghe thuộc về User (Tap vào marker bản đồ)
2. Single Voice Rule: Chỉ một narration tại một thời điểm
3. Khi chọn quán mới, âm thanh của quán cũ phải Stop lập tức.
4. QR là fallback thủ công, vẫn tuân theo Single Voice Rule.

**Yêu cầu thực thi:**

1. Tách rõ event tap bản đồ và audio action
2. Update State Machine (Play/Pause/Stop) đúng transition chuẩn

---

## Template 4 — UI Flow

**Mục tiêu:** Implement UI flow `<TEN_FLOW>`.

**Yêu cầu thực thi:**

1. Tham khảo bảng màu ấm áp của Phố Ẩm Thực.
2. Tách rõ state UI, data source và action handlers.

---

## Template 5 — Code Review

**Trọng tâm review:**

1. Sai phạm invariant theo `SPEC_CANONICAL.md` và `README.md`.
2. Hồi quy behavior ngoài phạm vi chức năng (đặc biệt là Play/Stop âm thanh).

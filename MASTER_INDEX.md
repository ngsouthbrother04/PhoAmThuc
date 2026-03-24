# MASTER INDEX – Dự án Phố Ẩm Thực

**Single point of navigation** cho toàn bộ tài liệu dự án.

**Read Order Bắt Buộc (cho mọi AI agent & developer):**
1. `README.md` ← **Source of Truth Định Nhuận Sản Phẩm**
2. `TEAM_START_HERE.md`
3. `SPEC_CANONICAL.md` ← **Single Source of Truth Code**
4. `MASTER_INDEX.md` (file này)
5. `docs/prd/index.md`
6. `IMPLEMENTATION_TASK_BREAKDOWN.md`
7. `EXECUTION_TODO_ISSUES.md`

---

## 1. Core Canonical Documents (Không được bỏ qua)

| File | Mục đích | Audience | Độ quan trọng |
|------|----------|----------|---------------|
| `README.md` | Định hướng sản phẩm Phố Ẩm Thực và tương tác Tap-to-Play | AI + Dev | ★★★★★ |
| `SPEC_CANONICAL.md` | Single Source of Truth kỹ thuật (invariants, state machine, single voice rule) | AI + Dev | ★★★★★ |
| `AI_GUIDELINES.md` | Invariants bắt buộc cho AI codegen (Cấm Geofence/Auto-play) | AI Agents | ★★★★★ |
| `ARCHITECTURE.md` | Technical blueprint & stack | Dev + Architect | ★★★★ |
| `TEAM_START_HERE.md` | Onboarding entrypoint | Toàn team | ★★★★★ |

## 2. Academic / Submission Documents

- `USE_CASES.md` → Use Case Report
- `USE_CASE_MAPPING.md` → Traceability UC ↔ Architecture

## 3. Product Requirements (PRD)

Toàn bộ PRD nằm trong thư mục `docs/prd/`:
- `index.md`
- `01_executive_summary.md` … `14_appendix.md`

## 4. Execution & Task Documents

- `IMPLEMENTATION_TASK_BREAKDOWN.md`
- `EXECUTION_TODO_ISSUES.md`
- `TASK_ASSIGN.md` (phân công nhánh)

## 5. Test & Quality

- `docs/test_scenarios.md`

## Conflict Resolution

1. `README.md`
2. `SPEC_CANONICAL.md`
3. `AI_GUIDELINES.md`
4. `ARCHITECTURE.md`
5. PRD (`docs/prd/*`)

**Lưu ý khi sửa:** Sau khi sửa bất kỳ invariants/defaults nào, phải cập nhật `README.md` và `SPEC_CANONICAL.md` trước.
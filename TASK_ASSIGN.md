# Phân Công Công Việc Cho 4 Nhánh GitHub

## 1. Căn cứ phân công
Phân công này được lập dựa trên các tài liệu chuẩn của dự án:
- `SPEC_CANONICAL.md` (invariant và timing mặc định)
- `IMPLEMENTATION_TASK_BREAKDOWN.md` (workstream và milestone)
- `EXECUTION_TODO_ISSUES.md` (issue, dependencies, story points)
- `docs/user/prd/04_acceptance_criteria.md` và `docs/test_scenarios.md` (tiêu chí nghiệm thu)

Nguyên tắc:
1. Ưu tiên chia đều khối lượng theo story points.
2. Tôn trọng dependencies giữa các issue để tránh block chéo.
3. Mỗi nhánh có owner chính, các nhánh khác review chéo theo mốc.

## 2. Mapping người phụ trách theo nhánh
- Người 1: nhánh `3122410411`
- Người 2: nhánh `3122410452`
- Người 3: nhánh `3122410466`
- Người 4: nhánh `3122560001`

## 3. Bảng phân công chính (cân bằng khối lượng)

| Nhánh | Người phụ trách | Issue được giao | Tổng SP | Ghi chú phụ thuộc chính |
|---|---|---|---:|---|
| `3122410411` | Người 1 | ISSUE-010, ISSUE-012, ISSUE-013, ISSUE-015 | 23 | Trục mobile feature + unit test lõi geofence/state machine |
| `3122410452` | Người 2 | ISSUE-004, ISSUE-005, ISSUE-006, ISSUE-009, ISSUE-016 | 21 | Phụ thuộc ISSUE-003 (sync), ISSUE-008 (fast movement), ISSUE-010/012/013/014 (integration test) |
| `3122410466` | Người 3 | ISSUE-007, ISSUE-008, ISSUE-011 | 21 | Trục geofence + Narration State Machine, sau đó analytics local buffer |
| `3122560001` | Người 4 | ISSUE-001, ISSUE-002, ISSUE-003, ISSUE-014, ISSUE-017 | 20 | Chỉ backend: nền tảng API, auth/sync, analytics integration, hardening |

Phân bổ SP: `23 / 21 / 21 / 20` (độ lệch nhỏ, chấp nhận được).

## 4. Kế hoạch chạy theo Sprint để giảm block

### Sprint S1 (P0 Foundation)
- Nhánh `3122410411`: Chuẩn bị khung QR/playback/tour (không phá invariant), chờ ISSUE-008 ổn định để vào S2
- Nhánh `3122410452`: ISSUE-004, ISSUE-005, ISSUE-006
- Nhánh `3122410466`: ISSUE-007, ISSUE-008
- Nhánh `3122560001`: ISSUE-001, ISSUE-002, ISSUE-003

Gate cuối S1:
1. API auth/sync chạy được, schema ổn.
2. SQLite local hoạt động và sync offline-first pass.
3. Geofence phát event ổn định, Narration State Machine chạy đúng các state chính.

### Sprint S2 (P0 Completion + P1 Core UX)
- Nhánh `3122410411`: ISSUE-010, ISSUE-012, ISSUE-013
- Nhánh `3122410466`: ISSUE-011
- Nhánh `3122410452`: ISSUE-009
- Nhánh `3122560001`: ISSUE-014

Gate cuối S2:
1. QR fallback đi qua cùng State Machine.
2. Fast movement xử lý đúng ưu tiên POI_B.
3. Language/playback/tour chạy ổn trên dữ liệu SQLite.
4. Analytics local + batch API thông suốt.

### Sprint S3 (Quality + Hardening)
- Nhánh `3122410411`: ISSUE-015
- Nhánh `3122410452`: ISSUE-016
- Nhánh `3122560001`: ISSUE-017
- Nhánh `3122410466`: hỗ trợ fix bug và review test coverage cho ISSUE-015/016

Gate cuối S3:
1. Unit + integration + scenario test pass.
2. Checklist hiệu năng và release được xác nhận.

## 5. Quy ước phối hợp để code không lệch docs
1. Không đổi behavior default nếu chưa cập nhật `SPEC_CANONICAL.md` trước.
2. Mọi PR phải ghi rõ mapping AC đã pass/chưa pass.
3. Khi sửa PRD user thì đồng bộ PRD admin và chạy `npm run docs:check-prd-sync`.
4. Các issue có dependency chỉ được merge khi issue tiền đề đã merge vào `main` (hoặc branch tích hợp được team thống nhất).

## 6. Danh sách AC/test ưu tiên review chéo
- Review chéo bắt buộc giữa nhánh `3122410466` và `3122410411` cho các luồng: geofence, stop-on-exit, single voice, QR fallback.
- Review chéo giữa nhánh `3122560001` và `3122410452` cho các luồng: auth/sync/offline bootstrap.
- Dùng `docs/test_scenarios.md` làm checklist smoke test trước khi mở PR.

## 7. Gợi ý nhịp merge thực tế
1. Merge cụm nền tảng S1 trước (001-008).
2. Merge cụm tính năng S2 theo thứ tự: 009 -> 010/012/013 -> 011 -> 014.
3. Cuối cùng merge cụm S3: 015 -> 016 -> 017.

---

Nếu cần, có thể tách thêm thành file `TASK_BOARD.md` để theo dõi tiến độ hằng ngày theo trạng thái `TODO / IN_PROGRESS / IN_REVIEW / QA / DONE` cho từng nhánh.

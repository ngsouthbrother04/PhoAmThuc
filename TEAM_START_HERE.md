# Team Start Here

Tài liệu onboarding nhanh cho teammate làm FE cần cài đặt và chạy Backend server local.

Mục tiêu: FE có thể tự khởi động API để phát triển và test luồng mobile/web mà không cần chờ BE hỗ trợ thủ công.

## 1) Yêu cầu môi trường

- Node.js 20+
- Docker Desktop (để chạy PostgreSQL + Redis)
- npm

Kiểm tra nhanh:

```bash
node -v
docker -v
```

## 2) Cài dependencies

Chạy tại thư mục root project:

```bash
npm install
cd apps/backend && npm install
```

Lý do: dự án chưa cấu hình workspace package manager tập trung, nên backend cần cài dependency riêng.

## 3) Chuẩn bị biến môi trường Backend

Trong `apps/backend`:

```bash
cp .env.example .env
```

Giữ mặc định là đủ để chạy local với Docker compose hiện tại:

- `DATABASE_URL=postgresql://admin:password123@localhost:5433/pho_am_thuc?schema=public`
- `REDIS_URL=""` (để fallback in-memory queue)

Nếu cần chạy queue bằng Redis thật, đặt:

```env
REDIS_URL="redis://localhost:6379"
```

## 4) Khởi động database services

Tại root project:

```bash
npm run db:up
```

Lệnh này sẽ chạy:

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

## 5) Migrate + generate client + seed data (lần đầu)

Trong `apps/backend`:

```bash
npm run db:setup
```

`db:setup` gồm:

1. `prisma migrate deploy`
2. `prisma generate`
3. `prisma seed`

## 6) Chạy Backend server

Chạy từ root (khuyến nghị):

```bash
npm run dev:backend
```

Hoặc chạy trực tiếp trong backend:

```bash
cd apps/backend
npm run dev
```

API mặc định tại: `http://localhost:3000`

## 7) Verify backend đã chạy đúng

Mở trình duyệt hoặc curl:

```bash
curl http://localhost:3000/
```

Kết quả mong đợi có:

- `message: "Mobile Backend is running!"`
- `db_status: "Connected"`

Xem API docs:

- `http://localhost:3000/api-docs`

## 8) Lỗi thường gặp

1. `P1001` / không connect được DB:
    - Kiểm tra Docker đã bật
    - Chạy lại `npm run db:up`
    - Xác nhận port `5433` chưa bị chiếm

2. Backend chạy nhưng lỗi env:
    - Kiểm tra đã có file `apps/backend/.env`
    - Nếu mới pull code: chạy lại `cp .env.example .env`

3. Lỗi Prisma client:
    - Chạy `cd apps/backend && npm run prisma:generate`

4. FE gọi API không được:
    - Kiểm tra base URL FE đang trỏ đúng `http://localhost:3000`
    - Nếu chạy trên device thật, không dùng `localhost`, dùng IP LAN máy dev

## 9) Tài liệu cần đọc thêm (khi cần)

1. README.md
2. SPEC_CANONICAL.md
3. AI_GUIDELINES.md
4. ARCHITECTURE.md
5. docs/backend_design.md
6. docs/database_design.md
7. USE_CASES.md
8. docs/test_scenarios.md

## Lưu ý sản phẩm quan trọng

- Không auto-play theo GPS/geofence
- Audio chỉ phát khi user Tap POI hoặc scan QR
- Không dùng on-device TTS generation

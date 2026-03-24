Dưới đây là phiên bản README đã được **chỉnh sửa lại hoàn toàn theo mục tiêu mới “Phố Ẩm Thực”**, giữ cấu trúc kỹ thuật nhưng thay đổi đúng bản chất sản phẩm:

---

# Phố Ẩm Thực - Location-Based Food Narration System

**Môn học Seminar chuyên đề**

**Nhóm thực hiện: 22**

---

## 📖 Giới thiệu Dự án

Đây là mã nguồn và tài liệu thiết kế cho hệ thống **Thuyết minh đa ngôn ngữ dựa trên vị trí (Location-Based Food Narration System)** dành cho các khu vực ẩm thực.

Hệ thống cho phép người dùng khám phá các **quán ăn được đánh dấu trên bản đồ**, và khi người dùng **chọn (tap) vào một địa điểm**, ứng dụng sẽ phát thuyết minh bằng nhiều ngôn ngữ về quán ăn đó (mô tả món ăn, đặc trưng, văn hóa ẩm thực…).

---

## 🚀 Getting Started (Hướng dẫn Cài đặt)

### 1. Yêu cầu Hệ thống (Prerequisites)

Để chạy dự án này, bạn cần cài đặt:

* **Node.js**: Phiên bản 20+
* **Docker Desktop**: Để chạy Database (PostgreSQL + Redis)
* **Expo Go**: Cài trên điện thoại (iOS/Android) để chạy thử Mobile App

---

### 2. Cài đặt (Installation)

Clone repository và cài đặt thư viện cho toàn bộ dự án:

```bash
git clone https://github.com/ngsouthbrother04/pho-am-thuc.git
npm install
```

---

### 3. Chạy Ứng dụng

Dự án được cấu hình sẵn các lệnh tiện lợi tại thư mục gốc (`root`):

#### Bước 1: Khởi động Database

Chạy PostgreSQL (Cổng 5433) và Redis (Cổng 6379) qua Docker:

```bash
npm run db:up
```

#### Bước 2: Chạy Backend API

Backend sẽ chạy tại `http://localhost:3000`:

```bash
npm run dev:backend
```

#### Bước 3: Chạy Mobile App

Sử dụng Expo để chạy ứng dụng trên thiết bị thật hoặc máy ảo:

```bash
npm run dev:mobile
```

*Sau khi chạy lệnh, quét mã QR hiển thị trên Terminal bằng ứng dụng Expo Go.*

---

## 📌 Scope README

README là điểm vào nhanh cho việc setup và điều hướng tài liệu.
Các hành vi nghiệp vụ và runtime/timing mặc định được xem là nguồn chuẩn tại **[`SPEC_CANONICAL.md`](./SPEC_CANONICAL.md)**.

---

## 🏗️ Tài liệu & Cấu trúc

Dự án tuân thủ quy trình phát triển phần mềm với hệ thống tài liệu đầy đủ:

### 1. Tài liệu Cốt lõi

* **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**: Thiết kế kiến trúc kỹ thuật chi tiết

* **[`AI_GUIDELINES.md`](./AI_GUIDELINES.md)**: Nguyên tắc hệ thống (Offline-first, single-voice, user-trigger priority)

* **[`SPEC_CANONICAL.md`](./SPEC_CANONICAL.md)**: Nguồn chuẩn cho invariant, state machine, timing defaults và xử lý mâu thuẫn tài liệu

---

### 2. Thiết kế & Yêu cầu

* **[`docs/prd/index.md`](./docs/prd/index.md)**: Product Requirements Document (PRD)

* **[`docs/backend_design.md`](./docs/backend_design.md)**: Thiết kế Backend, Database Schema và Data Pipeline

* **[`USE_CASES.md`](./USE_CASES.md)**: Chi tiết các Use Case của hệ thống

* **[`USE_CASE_MAPPING.md`](./USE_CASE_MAPPING.md)**: Ánh xạ Use Case ↔ Test Scenario ↔ Component

---

### 3. Kiểm thử

* **[`docs/test_scenarios.md`](./docs/test_scenarios.md)**: Kịch bản kiểm thử cho từng phân hệ

---

## 🤖 AI/Agent Start Here

Để các AI agents (Copilot, Claude, Cursor, Gemini...) sử dụng đúng ngữ cảnh:

1. Mở **[`TEAM_START_HERE.md`](./TEAM_START_HERE.md)**

Sau đó tuân thủ **Read Order (Mandatory)** được định nghĩa trong file này để tránh lệch logic giữa các tool.

---

## 🛠️ Tech Stack

### Mobile App

* Framework: **React Native** (Expo Managed Workflow)
* Offline Database: **SQLite**
* Audio Engine: **On-device TTS** (`expo-speech`)
* Maps & Location: `expo-location`, `react-native-maps`

---

### Backend System

* Runtime: **Node.js** + **Express** (TypeScript)
* Database: **PostgreSQL** (có **PostGIS** để xử lý dữ liệu vị trí)
* Caching: **Redis**

---

## 🍜 Định hướng Hệ thống

Khác với phiên bản trước (tự động theo GPS), hệ thống này:

* **KHÔNG tự động phát theo geofence**
* **Chỉ phát khi người dùng chủ động chọn quán (tap hoặc QR)**
* Tập trung vào:

  * Trải nghiệm khám phá ẩm thực
  * Thuyết minh đa ngôn ngữ
  * Hiển thị thông tin trực quan trên bản đồ

---

## 🔐 Xác thực & Truy cập (Dự kiến)

* Có thể hỗ trợ:

  * Claim code (offline)
  * Hoặc free access (tuỳ scope MVP)

---

Nếu bạn muốn, tôi có thể tiếp tục:

* Rewrite lại **PRD + Use Cases + Acceptance Criteria** theo logic mới (user-trigger thay vì GPS-trigger)
* Hoặc **refactor SPEC_CANONICAL.md** để bỏ hoàn toàn geofence-first → chuyển sang **user-interaction-first system** (cái này là critical)

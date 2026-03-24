# Sections 1–2: Executive Summary & Scope

← [Back to Index](index.md)

---

## 1. Executive Summary

### 1.1 Overview

Phố Ẩm Thực - Location-Based Food Narration System là ứng dụng di động (React Native / Expo) cung cấp trải nghiệm khám phá ẩm thực tại các khu phố hoặc chợ ẩm thực. Hệ thống cho phép khách tham quan tương tác trực tiếp với bản đồ (tap) hoặc quét mã QR để nghe thuyết minh chi tiết về từng quán ăn, món ăn đặc trưng. Ứng dụng hỗ trợ đa ngôn ngữ và hoạt động hoàn toàn offline sau hệ thống đồng bộ dữ liệu ban đầu.

### 1.2 Goals

**Primary Goal:** Cung cấp trải nghiệm khám phá ẩm thực trực quan, sinh động qua hình thức thuyết minh âm thanh đa ngôn ngữ, người dùng chủ động kiểm soát nội dung nghe thông qua tương tác trên bản đồ (User-interaction-first).

**Secondary Goals:**

- Hỗ trợ đa ngôn ngữ (15+ ngôn ngữ) để phục vụ khách du lịch quốc tế
- Hoạt động offline hoàn toàn đối với nội dung POI và âm thanh (on-device TTS)
- Bản đồ tương tác trực quan, định vị người dùng (Location-based nhưng KHÔNG geofence auto-play)
- Cung cấp tính năng kích hoạt qua mã QR cho các quán ăn
- Cung cấp gợi ý (Tour/List) các quán ăn theo chủ đề (ví dụ: Món ăn vỉa hè, Ẩm thực truyền thống)

### 1.3 Core Principle

> **User-trigger priority: Thuyết minh chỉ được phát khi người dùng chủ động chọn (tap hoặc quét QR). Hệ thống KHÔNG tự động phát âm thanh dựa trên geofence để tránh làm phiền trải nghiệm tự do khám phá.**

---

## 2. Scope Definition

### 2.1 In-Scope (MVP v1.0)

#### Module 1: Xác thực & Truy cập (UC1)

- Mở khóa ứng dụng (Free access hoặc Claim code - tuỳ MVP)
- Đồng bộ toàn bộ dữ liệu POI (quán ăn) xuống thiết bị sau xác thực (One-Load Pattern)
- Lưu trữ nội dung offline vào SQLite

#### Module 2: Khám phá trên Bản đồ (Tap to Play) (UC2)

- Hiển thị bản đồ với các điểm POI (quán ăn)
- Hiển thị vị trí hiện tại của người dùng (Location-based)
- Người dùng chọn (tap) vào một POI để xem thông tin
- Nhấn nút "Nghe thuyết minh" để phát âm thanh về quán ăn đó (On-device TTS: expo-speech)
- Ngừng thuyết minh khi người dùng chủ động bấm dừng hoặc chọn POI khác (Single-voice rule)

#### Module 3: Kích hoạt qua mã QR (UC3)

- Quét mã QR đặt tại các quán ăn
- Tự động hiển thị thẻ thông tin quán ăn và phát thuyết minh
- Áp dụng quy tắc "một giọng đọc tại một thời điểm"

#### Module 4: Chọn Ngôn ngữ & Điều khiển Phát (UC4)

- Chọn ngôn ngữ thuyết minh (15+ ngôn ngữ)
- Thay đổi ngôn ngữ ảnh hưởng text, giọng TTS và UI labels
- Play / Pause / Stop thuyết minh
- Hiển thị trạng thái phát hiện tại ở Mini Player

#### Module 5: Xem Danh sách & Gợi ý (UC5)

- Xem danh sách các quán ăn theo danh mục hoặc Tour gợi ý
- Nhấn vào quán ăn từ danh sách để xem chi tiết trên bản đồ

### 2.2 Out-of-Scope (Future Enhancements)

Các tính năng sau **không được bao gồm** trong MVP v1.0:

- Tự động phát thuyết minh bằng Geofence (Đã loại bỏ hoàn toàn)
- Đặt đồ ăn / thanh toán tại quán qua app
- Upload ảnh / review của khách tham quan
- Bản đồ 3D / AR navigation
- Tải file MP3 (chỉ dùng on-device TTS)
- Realtime cập nhật menu/giá trị trong phiên

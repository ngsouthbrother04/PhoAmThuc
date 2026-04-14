# Activity Diagram

Source: `apps/backend/src/routes/api/auth.ts`, `apps/backend/src/routes/api/pois.ts`, `apps/backend/src/routes/api/tours.ts`, `apps/backend/src/routes/api/sync.ts`, `apps/backend/src/routes/api/users.ts`, `apps/backend/src/routes/api/partner.ts`, `apps/backend/src/routes/api/admin.ts`, `apps/backend/src/routes/api/analytics.ts`

## USER

```mermaid
flowchart TD
    A([Bắt đầu]) --> B["Mở ứng dụng / Web"]
    B --> C{"Xác thực tài khoản?"}
    C -- "Yêu cầu Login" --> D["Đăng nhập / Đăng ký"]
    D --> C
    
    C -- "Đã có Token" --> E["API Sync: Tải bản đồ <br>& POI xung quanh"]
    
    E --> F{"Thiết bị cấp quyền?"}
    F -- "Từ chối" --> G["Hiển thị Bản đồ mặc định"]
    F -- "Cho GPS/Camera" --> H["Phát hiện vị trí (Blue Dot)<br>/ Sẵn sàng Camera"]
    
    G --> I{"Người dùng thao tác?"}
    H --> I
    
    I -- "Chạm POI trên map" --> J["Xem chi tiết POI <br>(Bottom Sheet)"]
    I -- "Quét mã QR tại quán" --> K["Giải mã QR lấy POI ID"]
    I -- "Xem danh sách Tour" --> L["Chọn Food Tour <br> & Xem POI thứ tự"]
    I -- "Đổi ngôn ngữ" --> M["API: Tải dữ liệu nội dung mới"]
    
    K --> J
    L --> J
    M --> I
    
    J --> N{"Bấm 'Nghe thuyết minh'?"}
    N -- "Không" --> I
    N -- "Có" --> O{"Đang có Audio khác?"}
    
    O -- "Có phát" --> P["DỪNG Audio cũ <br>(Single Voice Rule)"]
    O -- "Không phát" --> Q["Tải MP3 từ /api/v1/pois"]
    P --> Q
    
    Q --> R["Bắt đầu Phát & <br> Mở Mini Player điều khiển"]
    R --> S["Gửi dữ liệu Analytics xuống DB"]
    S --> T([Kết thúc])
    
    %% Style adjustments
    classDef startend fill:#d8e5ff,stroke:#6685cc,stroke-width:2px;
    classDef condition fill:#ffe5d8,stroke:#cc8066,stroke-width:2px;
    class A,T startend;
    class C,F,I,N,O condition;
```

## PARTNER

```mermaid
flowchart TD
    A([Bắt đầu]) --> B["Đăng nhập Portal"]
    B --> C{"Verify Role?"}
    C -- "Trượt" --> D["Báo lỗi Auth"]
    
    C -- "Hợp lệ (PARTNER)" --> E["Hiển thị Dashboard Quản lý"]
    
    E --> F{"Chọn hạng mục?"}
    F -- "Quản lý POI" --> G["Tạo mới / Sửa / Xóa <br> Thông tin Quán"]
    F -- "Quản lý Food Tour" --> H["Tạo Lộ trình Tour Tùy chỉnh"]
    F -- "Quản lý Media" --> I["Upload Banner / Hình ảnh <br> (Tải lên /api/v1/partner/..)"]
    
    G --> J["Hệ thống Validation Schema"]
    H --> J
    I --> J
    
    J --> K{"Dữ liệu hợp lệ?"}
    K -- "Không" --> L["Cảnh báo Lỗi Nhập liệu"]
    L --> F
    
    K -- "Có" --> M["Lưu vào Database & <br>Đẩy Record vào Trạng Thái Chờ"]
    M --> N["Gửi Notification Registration Request"]
    N --> P([Kết thúc phiên thao tác])
    
    D --> P
    
    classDef startend fill:#d8e5ff,stroke:#6685cc,stroke-width:2px;
    classDef condition fill:#ffe5d8,stroke:#cc8066,stroke-width:2px;
    class A,P startend;
    class C,F,K condition;
```

## ADMIN

```mermaid
flowchart TD
    A([Bắt đầu]) --> B["Đăng nhập CMS Nền tảng"]
    B --> C{"Verify Role?"}
    C -- "Trượt" --> D["Báo lỗi <br> Insufficient Permissions"]
    
    C -- "Hợp lệ (ADMIN)" --> E["Hiển thị Bảng điều khiển Tổng quan"]
    
    E --> F{"Chọn Nghiệp vụ?"}
    F -- "Kiểm duyệt Partner" --> G["Xem Danh sách / Requests <br> chờ duyệt"]
    F -- "Quản lý Data POI/Tour" --> H["Chỉnh sửa Master File <br> / Publish Nội dung"]
    F -- "Phân quyền User" --> I["Gán Role USER/PARTNER/ADMIN"]
    F -- "Vận hành Hệ thống" --> J["Gửi Lệnh Sync / Invalidate Cache <br> Queue Logs"]
    
    G --> K{"Hành động duyệt?"}
    K -- "Chấp thuận" --> L["Cập nhật Status Active <br> cho Nội dung Partner"]
    K -- "Từ chối" --> M["Gửi Lý do từ chối"]
    
    H --> N{"Yêu cầu xuất bản?"}
    N -- "Ghi đè TTS" --> O["Kích hoạt Background Job <br> Sinh Audio/Thuyết minh tự động"]
    N -- "Chỉ đổi Text" --> P["Cập nhật JSONB Translations"]
    
    L --> Q([Hoàn tất & Kết thúc])
    M --> Q
    O --> Q
    P --> Q
    I --> Q
    J --> Q
    D --> Q([Kết thúc])
    
    classDef startend fill:#e5ffd8,stroke:#66cc66,stroke-width:2px;
    classDef condition fill:#ffe5d8,stroke:#cc8066,stroke-width:2px;
    class A,Q startend;
    class C,F,K,N condition;
```

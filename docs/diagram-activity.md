# Activity Diagram

Source: `apps/backend/src/routes/api/auth.ts`, `apps/backend/src/routes/api/pois.ts`, `apps/backend/src/routes/api/tours.ts`, `apps/backend/src/routes/api/sync.ts`, `apps/backend/src/routes/api/users.ts`, `apps/backend/src/routes/api/partner.ts`, `apps/backend/src/routes/api/admin.ts`, `apps/backend/src/routes/api/analytics.ts`

## USER (Khách hàng / Foodie)
Sơ đồ hoạt động của Người dùng với mô hình tương tác "Tap-to-play".

```mermaid
flowchart TD
    A([Bắt đầu]) --> B["Mở ứng dụng / Web"]
    B --> C{"Xác thực tài khoản?"}
    C -- "Yêu cầu Login" --> D["Đăng nhập / Đăng ký"]
    D --> C
    
    D -- "Quên mật khẩu" --> FP1["Nhập email"]
    FP1 --> FP2["Gửi OTP"]
    FP2 --> FP3["Nhận OTP"]
    FP3 --> FP4["Nhập OTP"]
    FP4 --> FP5{"OTP đúng?"}
    FP5 -- "No (Báo lỗi)" --> FP4
    FP5 -- "Yes" --> FP6["Nhập mật khẩu mới"]
    FP6 --> FP7["Thành công"]
    FP7 --> D
    
    C -- "Đã có Token" --> E["API Sync: Tải bản đồ & POIs xung quanh"]
    
    E --> F{"Bật GPS?"}
    F -- "Từ chối" --> G["Yêu cầu cấp quyền"]
    G --> F
    F -- "Có" --> H["Phát hiện vị trí (Blue Dot) & Sẵn sàng Camera"]
    
    H --> I{"Người dùng thao tác?"}
    
    I -- "Chạm POI trên map" --> J["Xem chi tiết POI (Bottom Sheet)"]
    I -- "Quét mã QR tại quán" --> K["Giải mã QR lấy POI ID"]
    I -- "Xem danh sách Tour" --> L["Chọn Food Tour & Xem POI thứ tự"]
    I -- "Đổi ngôn ngữ (Ngoại ngữ)" --> U{"Tài khoản Premium?"}
    
    U -- "Chưa" --> W["Hiển thị Yêu cầu Mua gói (Packages)"]
    W --> X["Thực hiện thanh toán (MoMo / VNPay)"]
    X --> Y["Webhook Server xác thực giao dịch thành công"]
    Y --> U
    U -- "Rồi" --> M["API: Tải dữ liệu nội dung mới"]
    
    K --> J
    L --> J
    M --> I
    
    J --> N{"Bấm 'Nghe thuyết minh'?"}
    N -- "Không" --> I
    N -- "Có" --> O{"Đang có Audio khác?"}
    
    O -- "Có phát" --> P["DỪNG Audio cũ (Single Voice Rule)"]
    O -- "Không phát" --> Q["Tải MP3 từ /api/v1/pois"]
    P --> Q
    
    Q --> R["Bắt đầu Phát & Mở Mini Player điều khiển"]
    R --> S["Gửi dữ liệu Analytics xuống DB"]
    S --> T([Kết thúc])
    
    %% Style adjustments for Purple Theme matching attached image
    classDef default fill:#EAE4FF,stroke:#B29AF8,stroke-width:1.5px,color:#333;
    classDef startend fill:#FFFFFF,stroke:#B29AF8,stroke-width:2px,color:#333;
    classDef decision fill:#EAE4FF,stroke:#B29AF8,stroke-width:1.5px,color:#333;
    
    class A,T startend;
    class C,F,I,N,O,U,FP5 decision;
```

## PARTNER (Đối tác / Chủ quán)
Sơ đồ hoạt động từ việc đăng nhập Dashboard để quản lý địa điểm POI và Tour tuyến độc quyền.

```mermaid
flowchart TD
    A([Bắt đầu]) --> B["Đăng nhập Portal"]
    B --> C{"Verify Role?"}
    C -- "Trượt" --> D["Báo lỗi Auth & Từ chối truy cập"]
    
    C -- "Hợp lệ (PARTNER)" --> E["Hiển thị Dashboard Quản lý"]
    
    E --> F{"Chọn hạng mục?"}
    F -- "Quản lý POI" --> G["Tạo mới / Sửa / Xóa Thông tin Quán"]
    F -- "Quản lý Food Tour" --> H["Tạo Lộ trình Tour Tùy chỉnh"]
    F -- "Quản lý Media" --> I["Upload Banner / Hình ảnh (Tải lên /api/v1/partner/..)"]
    
    G --> J["Hệ thống Validation Schema"]
    H --> J
    I --> J
    
    J --> K{"Dữ liệu hợp lệ?"}
    K -- "Không" --> L["Cảnh báo Lỗi Nhập liệu"]
    L --> F
    
    K -- "Có" --> M["Lưu vào Database & Đẩy Record vào Trạng Thái Chờ"]
    M --> N["Gửi Notification Request chờ Admin duyệt"]
    N --> P([Kết thúc])
    D --> P
    
    %% Style adjustments for Purple Theme
    classDef default fill:#EAE4FF,stroke:#B29AF8,stroke-width:1.5px,color:#333;
    classDef startend fill:#FFFFFF,stroke:#B29AF8,stroke-width:2px,color:#333;
    classDef decision fill:#EAE4FF,stroke:#B29AF8,stroke-width:1.5px,color:#333;
    
    class A,P startend;
    class C,F,K decision;
```

## ADMIN (Quản trị viên)
Sơ đồ vận hành toàn quyền của Quản trị viên, bao gồm việc duyệt yêu cầu Partner, đồng bộ hệ thống và phân quyền.

```mermaid
flowchart TD
    A([Bắt đầu]) --> B["Đăng nhập CMS Nền tảng"]
    B --> C{"Verify Role?"}
    C -- "Trượt" --> D["Báo lỗi Insufficient Permissions"]
    
    C -- "Hợp lệ (ADMIN)" --> E["Hiển thị Bảng điều khiển Tổng quan"]
    
    E --> F{"Chọn Nghiệp vụ?"}
    F -- "Kiểm duyệt Partner" --> G["Xem Danh sách Yêu cầu chờ duyệt"]
    F -- "Quản lý Data POI/Tour" --> H["Chỉnh sửa Master File / Publish Nội dung"]
    F -- "Phân quyền User" --> I["Gán Role (USER / PARTNER / ADMIN)"]
    F -- "Vận hành Hệ thống" --> J["Gửi Lệnh Sync / Invalidate Cache / Xem Logs"]
    F -- "Quản lý Gói Thanh Toán" --> V["Tạo / Sửa / Xóa cấu hình Payment Packages"]
    
    G --> K{"Duyệt Yêu Cầu?"}
    K -- "Chấp thuận" --> L["Cập nhật Status Active cho Nội dung"]
    K -- "Từ chối" --> M["Gửi Lý do từ chối cho Partner"]
    
    H --> N{"Yêu cầu xuất bản?"}
    N -- "Ghi đè TTS" --> O["Kích hoạt Background Job Sinh Audio Tự động"]
    N -- "Chỉ đổi Text" --> P["Cập nhật JSONB Translations"]
    
    L --> Q([Kết thúc])
    M --> Q
    O --> Q
    P --> Q
    I --> Q
    J --> Q
    V --> Q
    D --> Q
    
    %% Style adjustments for Purple Theme
    classDef default fill:#EAE4FF,stroke:#B29AF8,stroke-width:1.5px,color:#333;
    classDef startend fill:#FFFFFF,stroke:#B29AF8,stroke-width:2px,color:#333;
    classDef decision fill:#EAE4FF,stroke:#B29AF8,stroke-width:1.5px,color:#333;
    
    class A,Q startend;
    class C,F,K,N decision;
```

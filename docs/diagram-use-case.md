# Use-case Diagram

Source: `apps/backend/src/routes/api/*.ts`

## USER

```mermaid
flowchart LR
    %% Actor
    USER(("USER"))

    subgraph System ["Ứng dụng Phố Ẩm Thực (Mobile / Web App)"]
        
        subgraph Group1 ["Tài khoản & Hệ thống"]
            UC1(["Đăng ký / Đăng nhập auth"])
            UC2(["Cập nhật Ngôn ngữ ưu tiên"])
            UC3(["Gửi yêu cầu nâng cấp Role Partner"])
            
            UC1 -. "«extend»" .-> UC2
        end

        subgraph Group2 ["Khám phá & Trải nghiệm"]
            UC4(["Xem Bản đồ & POI xung quanh"])
            UC5(["Chạm / Quét QR nghe Thuyết minh (Tap-to-play)"])
            UC6(["Đi theo Lộ trình Food Tour"])
            UC7(["Tìm kiếm địa điểm"])
            
            UC5 -. "«include»" .-> UC4
            UC6 -. "«include»" .-> UC4
        end

        subgraph Group3 ["Dữ liệu & Nền"]
            UC8(["Đồng bộ Dữ liệu Offline / Cache"])
            UC9(["Ghi nhận Analytics & Tâm trạng (Heartbeat)"])
        end
    end

    %% Connections
    USER --> UC1
    USER --> UC3
    USER --> UC4
    USER --> UC5
    USER --> UC6
    USER --> UC7
    USER --> UC8
    USER --> UC9
    
    %% Styling
    classDef actor fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000
    classDef usecase fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000
    class USER actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9 usecase
```

## PARTNER
```mermaid
flowchart LR
    PARTNER(("PARTNER"))

    subgraph System ["Partner Dashboard (Portal)"]
        
        subgraph Group1 ["Quản lý Tài khoản"]
            UC1(["Đăng nhập Cổng Partner"])
            UC2(["Theo dõi trạng thái Xét duyệt"])
        end

        subgraph Group2 ["Biên tập Cơ sở Dịch vụ"]
            UC3(["Tạo / Sửa / Xóa Bản nháp POI"])
            UC4(["Tải lên Hình ảnh / Banner"])
            UC5(["Tạo Lộ trình Chuyên đề (Food Tour)"])
            
            UC3 -. "«include»" .-> UC4
        end

        subgraph Group3 ["Giao tiếp Nền tảng"]
            UC6(["Gửi Yêu cầu Xuất bản (Request Publish)"])
            UC7(["Xem trước Giao diện Public (Preview)"])
        end
    end

    %% Connections
    PARTNER --> UC1
    PARTNER --> UC2
    PARTNER --> UC3
    PARTNER --> UC5
    PARTNER --> UC6
    PARTNER --> UC7

    %% Styling
    classDef actor fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000
    classDef usecase fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000
    class PARTNER actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7 usecase
```

## ADMIN

```mermaid
flowchart LR
    ADMIN(("👑 Quản trị viên \n (ADMIN)"))

    subgraph System ["Hệ thống CMS Quản trị (Admin Panel)"]
        
        subgraph Group1 ["Mạng lưới Đối tác"]
            UC1(["Duyệt Đăng ký Partner/Thương nhân"])
            UC2(["Phân quyền (Cấp/Tháo gỡ Role)"])
        end

        subgraph Group2 ["Quản trị Nội dung (Master)"]
            UC3(["Kiểm duyệt & Publish POI/Tour"])
            UC4(["Đóng băng/Xóa Nội dung vi phạm"])
            UC5(["Kích hoạt luồng Sinh Audio TTS"])
            
            UC3 -. "«extend»" .-> UC5
        end

        subgraph Group3 ["Vận hành Kỹ thuật"]
            UC6(["Xóa Bộ đệm (Invalidate Cache & Sync)"])
            UC7(["Kiểm tra Hàng đợi Server (TTS Queue)"])
            UC8(["Giám sát Biểu đồ Analytics"])
        end
    end

    %% Connections
    ADMIN --> UC1
    ADMIN --> UC2
    ADMIN --> UC3
    ADMIN --> UC4
    ADMIN --> UC6
    ADMIN --> UC7
    ADMIN --> UC8

    %% Styling
    classDef actor fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000
    classDef usecase fill:#edfff0,stroke:#28a745,stroke-width:2px,color:#000
    class ADMIN actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8 usecase
```

# System Architecture Flow

Source: `apps/backend/src/index.ts`, route files, service files

## USER

```mermaid
flowchart LR
    subgraph "Client Layer"
        U["Web/App Client <br>(Foodie)"]
    end

    subgraph "Application Layer (Node.js API)"
        API["API Gateway / Express.js"]
        
        AuthSVC["Auth & Sync Service"]
        POISVC["POI & Tour Service"]
        AnaSVC["Analytics Service"]
        
        API --> AuthSVC
        API --> POISVC
        API --> AnaSVC
    end

    subgraph "Data & Storage Layer"
        DB[("PostgreSQL <br>(JSONB, PostGIS)")]
        FS[("Local File System <br>(public/audio)")]
    end

    U -- "REST API (HTTPS)" --> API
    
    AuthSVC -- "Query / Save Session" --> DB
    POISVC -- "Query Location Data" --> DB
    AnaSVC -- "Log Tracking Events" --> DB
    
    FS -- "Serve MP3 Static Files" --> U
    
    classDef client fill:#d8e5ff,stroke:#6685cc,stroke-width:2px
    classDef app fill:#e5ffd8,stroke:#66cc66,stroke-width:2px
    classDef db fill:#ffe5d8,stroke:#cc8066,stroke-width:2px
    class U client
    class API,AuthSVC,POISVC,AnaSVC app
    class DB,FS db
```

## PARTNER

```mermaid
flowchart LR
    subgraph "Client Layer"
        P["Partner Dashboard <br>(Chủ quán)"]
    end

    subgraph "Application Layer (Node.js API)"
        API["API Gateway / Express.js"]
        
        AuthSVC["Auth Middleware <br>(Role: PARTNER)"]
        PartnerSVC["Partner Registration <br>& POI Service"]
        UploadSVC["Media Upload Service"]
        
        API --> AuthSVC
        AuthSVC --> PartnerSVC
        AuthSVC --> UploadSVC
    end

    subgraph "Data & Storage Layer"
        DB[("PostgreSQL <br>(Lưu Bản Nháp / Yêu cầu)")]
        Cloudinary[("Cloudinary <br>(Lưu trữ Hình ảnh CDN)")]
    end

    P -- "Submit Form / APIs" --> API
    
    PartnerSVC -- "Save Drafts / Requests" --> DB
    UploadSVC -- "Upload Banner/Menu" --> Cloudinary
    
    classDef client fill:#d8e5ff,stroke:#6685cc,stroke-width:2px
    classDef app fill:#e5ffd8,stroke:#66cc66,stroke-width:2px
    classDef db fill:#ffe5d8,stroke:#cc8066,stroke-width:2px
    class P client
    class API,AuthSVC,PartnerSVC,UploadSVC app
    class DB,Cloudinary db
```

## ADMIN

```mermaid
flowchart LR
    subgraph "Client Layer"
        A["Admin CMS <br>(Quản trị viên / Hệ thống)"]
    end

    subgraph "Application Layer (Node.js API)"
        API["API Gateway / Express.js"]
        
        AuthSVC["Auth Middleware <br>(Role: ADMIN)"]
        AdminSVC["Admin Approvals <br>& Core POI Master"]
        TTSSVC["TTS Generator Service <br>(Worker)"]
        UserSVC["User & Role Management"]
        
        API --> AuthSVC
        AuthSVC --> AdminSVC
        AuthSVC --> TTSSVC
        AuthSVC --> UserSVC
    end

    subgraph "Data & Storage Layer"
        DB[("PostgreSQL <br>(Core/Master Data)")]
        Redis[("Redis <br>(Background Jobs Queue)")]
        FS[("Local File System <br>(public/audio)")]
        Cloudinary[("Cloudinary <br>(Lưu trữ Hình ảnh CDN)")]
    end

    A -- "Manage System via HTTPS" --> API
    
    AdminSVC -- "Approve & Publish" --> DB
    AdminSVC -- "Cleanup Media" --> Cloudinary
    TTSSVC -- "Push / Consume Job" --> Redis
    TTSSVC -- "Save MP3 Results" --> FS
    UserSVC -- "Update Grants" --> DB
    
    classDef client fill:#d8e5ff,stroke:#6685cc,stroke-width:2px
    classDef app fill:#e5ffd8,stroke:#66cc66,stroke-width:2px
    classDef db fill:#ffe5d8,stroke:#cc8066,stroke-width:2px
    class A client
    class API,AuthSVC,AdminSVC,TTSSVC,UserSVC app
    class DB,Redis,FS,Cloudinary db
```

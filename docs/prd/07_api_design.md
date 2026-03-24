# Section 9: API Assumptions

← [Back to Index](index.md)

---

## 9. API Assumptions

### 9.1 Overview

Mobile App giao tiếp với Backend qua REST API. Mọi data được pull về SQLite khi sync, sau đó app hoạt động offline hoàn toàn. Chỉ có 3 loại request trong thời gian thực: xác thực, sync data, và analytics upload.

**Base URL:** `https://api.phoamthuc.local/v1`

**Authentication:** JWT Bearer Token trong header `Authorization: Bearer <token>`

---

### 9.2 Authentication Endpoints

#### POST /api/v1/auth/payment/initiate

**Purpose:** Khởi tạo đơn hàng thanh toán online

**Request:**

```json
{
  "paymentMethod": "vnpay",
  "deviceId": "anon-uuid-xxxx",
  "amount": 50000,
  "currency": "VND"
}
```

**Success Response (200):**

```json
{
  "orderId": "order-uuid",
  "paymentUrl": "https://vnpay.vn/pay?token=...",
  "expiresIn": 900
}
```

---

#### POST /api/v1/auth/payment/callback

**Purpose:** Webhook từ VNPay/Momo sau thanh toán thành công

**Response (200):**

```json
{
  "token": "jwt-token-string",
  "expiresIn": 86400,
  "deviceId": "anon-uuid-xxxx"
}
```

---

#### POST /api/v1/auth/claim

**Purpose:** Xác thực bằng mã vé tham gia (mua tại quầy)

**Request:**

```json
{
  "code": "ABC123",
  "deviceId": "anon-uuid-xxxx"
}
```

**Success Response (200):**

```json
{
  "token": "jwt-token-string",
  "expiresIn": 86400
}
```

---

### 9.3 Content Sync Endpoints

#### GET /api/v1/sync/manifest

**Purpose:** Kiểm tra version nội dung hiện tại

**Response (200):**

```json
{
  "contentVersion": 45,
  "totalPois": 50,
  "totalTours": 3,
  "lastUpdatedAt": "2026-03-24T08:00:00Z",
  "checksum": "sha256-abc123..."
}
```

---

#### GET /api/v1/sync/full

**Purpose:** Tải toàn bộ nội dung POI quán ăn và Tour

**Headers:** `Authorization: Bearer <token>`

**Query Params:** `?version=45` 

**Response (200):**

```json
{
  "contentVersion": 45,
  "pois": [
    {
      "id": "poi-uuid-1",
      "name": { "vi": "Phở Thìn Lò Đúc", "en": "Pho Thin Lo Duc", "ko": "퍼 틴" },
      "description": { "vi": "Đặc trưng phở xào lăn...", "en": "Signature stir-fried beef pho..." },
      "audioUrls": { "vi": "https://cdn.phoamthuc.local/audio/vi/pho-thin.mp3", "en": "https://cdn.phoamthuc.local/audio/en/pho-thin.mp3" },
      "latitude": 21.0163,
      "longitude": 105.8557,
      "type": "Món chính",
      "image": "https://cdn.phoamthuc.local/poi/pho-thin.jpg"
    }
  ],
  "tours": [
    {
      "id": "tour-uuid-1",
      "name": { "vi": "Lộ trình Buổi Sáng", "en": "Morning Route" },
      "description": { "vi": "Bún, Phở, Cà phê truyền thống...", "en": "Noodles and traditional coffee..." },
      "duration": 90,
      "poiIds": ["poi-uuid-1", "poi-uuid-2", "poi-uuid-3"],
      "image": "https://cdn.phoamthuc.local/tours/morning.jpg",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

**Notes:**

- Response được compress bằng gzip
- Tương tác với SQLite để Atomic Replace

---

### 9.4 Analytics Endpoint

#### POST /api/v1/analytics/batch

**Purpose:** Upload analytics events được buffer từ hoạt động chọn quán/nghe của user

**Request:**

```json
{
  "deviceId": "anon-uuid-xxxx",
  "sessionId": "session-uuid",
  "events": [
    {
      "poiId": "poi-uuid-1",
      "action": "PLAY",
      "durationMs": 0,
      "language": "vi-VN",
      "timestamp": 1741852800000
    },
    {
      "poiId": "poi-uuid-1",
      "action": "STOP",
      "durationMs": 45300,
      "language": "vi-VN",
      "timestamp": 1741852845300
    }
  ]
}
```

**Response (200):**

```json
{ "accepted": 2, "failed": 0 }
```

**API Conventions:**
- **Rate Limiting:** Tối đa 10 requests/phút per device
- Format JSON, HTTP 2xx/4xx.

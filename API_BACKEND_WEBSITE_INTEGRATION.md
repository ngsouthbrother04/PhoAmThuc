# Backend APIs - Website Integration Complete Guide

## 📋 Table of Contents
1. [Existing APIs](#existing-apis)
2. [New APIs to Implement](#new-apis-to-implement)
3. [Implementation Examples](#implementation-examples)
4. [Frontend Integration Guide](#frontend-integration-guide)
5. [Environment Setup](#environment-setup)

---

## Existing APIs

### 🔐 Authentication APIs (`/api/v1/auth`)

#### 1. Register New User
```
POST /api/v1/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "Nguyễn Văn A",
  "deviceId": "device-unique-id"
}

Response:
{
  "message": "Đăng ký thành công.",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A"
  }
}
```

#### 2. Login
```
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "deviceId": "device-unique-id"
}

Response:
{
  "message": "Đăng nhập thành công.",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "isPremium": false
  }
}
```

#### 3. Refresh Token
```
POST /api/v1/auth/token-refresh
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "message": "Làm mới phiên đăng nhập thành công.",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### 4. Logout
```
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}

Response:
{
  "message": "Logout successfully"
}
```

#### 5. Redeem Claim Code
```
POST /api/v1/auth/payment/claim
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "code": "CLAIM_CODE_12345"
}

Response:
{
  "message": "Success",
  "claimCode": { ... },
  "isPremium": true
}
```

#### 6. Initiate Payment
```
POST /api/v1/auth/payment/initiate
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "provider": "vnpay",  // or "momo"
  "amount": 50000,
  "currency": "VND",
  "deviceId": "device-id",
  "returnUrl": "https://app.example.com/payment/return"
}

Response:
{
  "message": "Khởi tạo thanh toán thành công.",
  "transactionId": "TXN_12345",
  "paymentUrl": "https://payment-provider.com/...",
  "expiresAt": "2026-04-08T10:30:00Z"
}
```

---

### 🗺️ Public POI APIs (`/api/v1/pois`)

#### 1. Get All POIs (Paginated)
```
GET /api/v1/pois?page=1&limit=20
Authorization: Bearer {accessToken}

Response:
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": { "vi": "Phở Hà Nội", "en": "Ha Noi Pho" },
        "description": { "vi": "Quán phở nổi tiếng...", "en": "Famous pho restaurant..." },
        "latitude": 21.028511,
        "longitude": 105.804163,
        "type": "FOOD",
        "image": "https://cdnx.xyz/image.jpg",
        "isPublished": true,
        "audioUrls": {
          "vi": "https://cdn.xyz/audio-vi.mp3",
          "en": "https://cdn.xyz/audio-en.mp3"
        }
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 2. Get POI by ID
```
GET /api/v1/pois/{poiId}
Authorization: Bearer {accessToken}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": { "vi": "Phở Hà Nội", "en": "Ha Noi Pho" },
    "description": { ... },
    "latitude": 21.028511,
    "longitude": 105.804163,
    "type": "FOOD",
    "image": "https://cdnx.xyz/image.jpg",
    "isPublished": true,
    "audioUrls": { ... },
    "reviews": [ ... ],
    "rating": 4.5
  }
}
```

#### 3. Search POIs by Radius
```
POST /api/v1/pois/search/radius
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "latitude": 21.028511,
  "longitude": 105.804163,
  "radiusM": 1000,
  "limit": 50
}

Response:
{
  "status": "success",
  "items": [
    {
      "id": "uuid",
      "name": { ... },
      "description": { ... },
      "distanceM": 245,
      "latitude": 21.025,
      "longitude": 105.808
    }
  ],
  "meta": {
    "count": 12,
    "minDistance": 100,
    "maxDistance": 950
  }
}
```

---

### 🎫 Tour APIs (`/api/v1/tours`)

#### 1. Get All Tours
```
GET /api/v1/tours?page=1&limit=20
Authorization: Bearer {accessToken}

Response:
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": { "vi": "Tour Phố Cổ", "en": "Old Quarter Tour" },
        "description": { ... },
        "duration": 120,
        "image": "https://cdnx.xyz/tour.jpg",
        "isPublished": true,
        "poiIds": ["uuid1", "uuid2", "uuid3"],
        "poiCount": 3
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 2. Get Tour by ID
```
GET /api/v1/tours/{tourId}
Authorization: Bearer {accessToken}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": { ... },
    "description": { ... },
    "duration": 120,
    "image": "https://cdnx.xyz/tour.jpg",
    "pois": [
      {
        "id": "uuid1",
        "name": { ... },
        "latitude": 21.028,
        "longitude": 105.804,
        "distanceFromPrevious": 350,
        "audioUrls": { ... }
      }
    ]
  }
}
```

---

### 📊 Sync APIs (`/api/v1/sync`)

#### 1. Get Sync Manifest
```
GET /api/v1/sync/manifest
Authorization: Bearer {accessToken}

Response:
{
  "contentVersion": 42,
  "lastSyncTime": "2026-04-08T09:30:00Z",
  "poiCount": 156,
  "tourCount": 28,
  "estimateBytes": 2500000,
  "supportedLanguages": ["vi", "en", "ko", "ja"]
}
```

#### 2. Get Full Sync Payload
```
GET /api/v1/sync/full?version=42
Authorization: Bearer {accessToken}

Response:
{
  "contentVersion": 42,
  "needsSync": false,  // or true if version < 42
  "pois": [
    {
      "id": "uuid",
      "name": { ... },
      "audioUrls": { ... },
      "latitude": 21.028,
      "longitude": 105.804
    }
  ],
  "tours": [
    {
      "id": "uuid",
      "name": { ... },
      "poiIds": ["uuid1", "uuid2"]
    }
  ]
}
```

#### 3. Get Incremental Sync
```
POST /api/v1/sync/incremental
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "fromVersion": 40
}

Response (if within delta window):
{
  "contentVersion": 42,
  "changes": [
    {
      "entity": "POI",
      "entityId": "uuid",
      "action": "UPSERT",
      "data": { ... }
    },
    {
      "entity": "TOUR",
      "entityId": "uuid2",
      "action": "DELETE"
    }
  ]
}

Response (if version too old - need full sync):
{
  "status": 409,
  "message": "Delta window exceeded. Use /sync/full instead.",
  "requiresFullSync": true
}
```

---

### 📈 Analytics APIs (`/api/v1/analytics`)

#### 1. Submit Batch Events
```
POST /api/v1/analytics/events
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "events": [
    {
      "deviceId": "device-id",
      "sessionId": "session-id",
      "poiId": "uuid",
      "action": "PLAY",  // or PAUSE, STOP, QR_SCAN
      "durationMs": 30000,
      "language": "vi",
      "timestamp": 1712573400000
    }
  ]
}

Response:
{
  "status": "success",
  "processedCount": 5,
  "failedCount": 0
}
```

#### 2. Send Presence Heartbeat
```
POST /api/v1/analytics/presence/heartbeat
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "deviceId": "device-id",
  "timestamp": 1712573400000
}

Response:
{
  "status": "success",
  "acknowledged": true,
  "serverTime": 1712573401000
}
```

#### 3. Get Analytics Stats (Statistics)
```
GET /api/v1/analytics/stats
Authorization: Bearer {accessToken}

Response:
{
  "status": "success",
  "data": {
    "activeUsersLast24h": 145,
    "totalEventsProcessed": 8952,
    "onlineNow": 23,
    "topPoiIds": ["uuid1", "uuid2"],
    "topLanguages": ["vi", "en"]
  }
}
```

---

### 👨‍💼 Admin APIs (`/api/v1/admin`) - Protected with Bearer JWT Token + Role ADMIN

#### 1. List POIs (Admin View)
```
GET /api/v1/admin/pois
Authorization: Bearer {adminAccessToken}

Response:
{
  "items": [
    {
      "id": "uuid",
      "name": { ... },
      "isPublished": false,
      "publishedAt": null,
      "deletedAt": null,
      "contentVersion": 1,
      "createdBy": "admin-uuid",
      "createdAt": "2026-04-01T10:00:00Z"
    }
  ],
  "total": 156
}
```

#### 2. Get POI Detail (Admin)
```
GET /api/v1/admin/pois/{poiId}
Authorization: Bearer {adminAccessToken}

Response:
{
  "id": "uuid",
  "name": { ... },
  "description": { ... },
  "latitude": 21.028,
  "longitude": 105.804,
  "type": "FOOD",
  "image": "https://...",
  "isPublished": false,
  "audioUrls": { ... },
  "createdBy": "admin-uuid",
  "createdAt": "2026-04-01T10:00:00Z",
  "updatedAt": "2026-04-08T09:00:00Z"
}
```

#### 3. Create POI
```
POST /api/v1/admin/pois
Authorization: Bearer {adminAccessToken}
Content-Type: application/json

Request:
{
  "name": { "vi": "Phở Mới", "en": "New Pho" },
  "description": { "vi": "Mô tả...", "en": "Description..." },
  "latitude": 21.028,
  "longitude": 105.804,
  "type": "FOOD",
  "image": "https://...",
  "reason": "Adding new POI"
}

Response:
{
  "message": "Tạo POI thành công.",
  "id": "new-uuid",
  "isPublished": false
}
```

#### 4. Update POI
```
PATCH /api/v1/admin/pois/{poiId}
Authorization: Bearer {adminAccessToken}
Content-Type: application/json

Request:
{
  "name": { "vi": "Phở Cập Nhật", "en": "Updated Pho" },
  "description": { ... },
  "reason": "Fixed typo"
}

Response:
{
  "message": "Cập nhật POI thành công.",
  "id": "uuid",
  "contentVersion": 2
}
```

#### 5. Publish POI (+ auto-enqueue TTS)
```
POST /api/v1/admin/pois/{poiId}/publish
Authorization: Bearer {adminAccessToken}
Content-Type: application/json

Request:
{
  "reason": "Content ready for users"
}

Response:
{
  "message": "Publish POI thành công.",
  "isPublished": true,
  "publishedAt": "2026-04-08T10:00:00Z",
  "ttsQueued": true,
  "ttsJobId": "job-123"
}
```

#### 6. Delete POI (Soft Delete)
```
DELETE /api/v1/admin/pois/{poiId}
Authorization: Bearer {adminAccessToken}

Response:
{
  "message": "Xóa POI thành công.",
  "id": "uuid",
  "deletedAt": "2026-04-08T10:00:00Z"
}
```

#### 7. Upload POI Image
```
POST /api/v1/admin/pois/{poiId}/image/upload
Authorization: Bearer {adminAccessToken}
Content-Type: multipart/form-data

Body:
- image: <binary file>

Response:
{
  "message": "Upload ảnh thành công.",
  "poiId": "uuid",
  "imageUrl": "https://cdn.xyz/image.jpg"
}
```

#### 8. Create Tour
```
POST /api/v1/admin/tours
Authorization: Bearer {adminAccessToken}
Content-Type: application/json

Request:
{
  "name": { "vi": "Tour Mới", "en": "New Tour" },
  "description": { ... },
  "duration": 120,
  "poiIds": ["uuid1", "uuid2", "uuid3"],
  "image": "https://...",
  "reason": "New tour created"
}

Response:
{
  "message": "Tạo Tour thành công.",
  "id": "tour-uuid",
  "isPublished": false
}
```

#### 9. Update Tour
```
PATCH /api/v1/admin/tours/{tourId}
Authorization: Bearer {adminAccessToken}
Content-Type: application/json

Request:
{
  "name": { ... },
  "poiIds": ["uuid1", "uuid2", "uuid3", "uuid4"],
  "reason": "Added new POI to tour"
}

Response:
{
  "message": "Cập nhật Tour thành công.",
  "id": "tour-uuid",
  "contentVersion": 2
}
```

#### 10. Upload Tour Image
```
POST /api/v1/admin/tours/{tourId}/image/upload
Authorization: Bearer {adminAccessToken}
Content-Type: multipart/form-data

Response:
{
  "message": "Upload ảnh thành công.",
  "tourId": "uuid",
  "imageUrl": "https://cdn.xyz/tour.jpg"
}
```

#### 11. Queue TTS Generation
```
POST /api/v1/admin/pois/{poiId}/audio/generate
Authorization: Bearer {adminAccessToken}

Response:
{
  "message": "Đã đưa tác vụ TTS vào queue.",
  "poiId": "uuid",
  "queued": true,
  "jobId": "job-123",
  "languages": ["vi", "en", "ko"]
}
```

#### 12. Get TTS Queue Status
```
GET /api/v1/admin/tts/queue/status
Authorization: Bearer {adminAccessToken}

Response:
{
  "queueStats": {
    "waiting": 15,
    "active": 3,
    "completed": 1250,
    "failed": 2
  },
  "recentJobs": [
    {
      "id": "job-123",
      "poiId": "uuid",
      "status": "active",
      "languages": ["vi", "en"],
      "progress": 50
    }
  ]
}
```

#### 13. Validate TTS Configuration
```
GET /api/v1/admin/tts/config/validate
Authorization: Bearer {adminAccessToken}

Response:
{
  "valid": true,
  "pipeAvailable": true,
  "redisConnected": true,
  "storageWritable": true,
  "modelsAvailable": ["vi", "en", "ko"],
  "warnings": []
}
```

#### 14. Get Sync Manifest (Admin)
```
GET /api/v1/sync/manifest
Authorization: Bearer {adminAccessToken}

Response:
{
  "contentVersion": 42,
  "lastContentChange": "2026-04-08T09:30:00Z",
  "poiCount": 156,
  "tourCount": 28,
  "publishedPoiCount": 145,
  "estimateBytes": 2500000
}
```

---

## New APIs to Implement

### 🏠 Website Home Page Features

#### 1. Featured POIs (Home Showcase)
```
GET /api/v1/pois/featured?limit=6
Authorization: Bearer {accessToken}

Purpose: Show top-rated or newly published POIs on home
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": { ... },
      "description": { ... },
      "image": "https://...",
      "rating": 4.8,
      "reviewCount": 245,
      "distanceFromCenter": "2.5 km"
    }
  ]
}
```

#### 2. Featured Tours (Home Showcase)
```
GET /api/v1/tours/featured?limit=4
Authorization: Bearer {accessToken}

Purpose: Show recommended tours on home
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": { ... },
      "image": "https://...",
      "duration": 120,
      "poiCount": 5,
      "rating": 4.6,
      "bookingCount": 342
    }
  ]
}
```

#### 3. Search POIs/Tours (Global)
```
GET /api/v1/search?q=phở&type=poi,tour&limit=20
Authorization: Bearer {accessToken}

Purpose: Global search across POIs and tours
Response:
{
  "status": "success",
  "results": {
    "pois": [
      {
        "id": "uuid",
        "name": { ... },
        "type": "FOOD",
        "match": "name"
      }
    ],
    "tours": [
      {
        "id": "uuid",
        "name": { ... },
        "match": "description"
      }
    ]
  }
}
```

#### 4. Get POI Reviews
```
GET /api/v1/pois/{poiId}/reviews?page=1&limit=10
Authorization: Bearer {accessToken}

Purpose: Display user reviews for each POI
Response:
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "review-uuid",
        "userId": "user-uuid",
        "userName": "Nguyễn A",
        "rating": 5,
        "text": "Great place!",
        "createdAt": "2026-04-07T10:00:00Z",
        "helpful": 12
      }
    ],
    "total": 45,
    "averageRating": 4.6
  }
}
```

#### 5. Submit POI Review
```
POST /api/v1/pois/{poiId}/reviews
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "rating": 5,
  "text": "Excellent narration experience!",
  "language": "en"
}

Response:
{
  "message": "Review submitted successfully",
  "reviewId": "review-uuid",
  "poiRating": 4.7
}
```

### 📍 Map Features

#### 6. Get Map Bounds Data
```
POST /api/v1/pois/bounds
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "bounds": {
    "north": 21.05,
    "south": 21.00,
    "east": 105.85,
    "west": 105.80
  },
  "zoomLevel": 15
}

Purpose: Optimized query for showing POIs within map bounds
Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": { "vi": "...", "en": "..." },
      "latitude": 21.028,
      "longitude": 105.804,
      "type": "FOOD",
      "isPublished": true
    }
  ]
}
```

### 👤 User Profile Features

#### 7. Get User Profile
```
GET /api/v1/users/me
Authorization: Bearer {accessToken}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://...",
    "isPremium": true,
    "premiumExpiresAt": "2026-06-08T00:00:00Z",
    "deviceId": "device-id",
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

#### 8. Update User Profile
```
PATCH /api/v1/users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "fullName": "Nguyễn Văn B",
  "avatar": "https://..."
}

Response:
{
  "message": "Profile updated successfully",
  "data": { ... }
}
```

#### 9. Get User's Favorite POIs
```
GET /api/v1/users/me/favorites?page=1&limit=20
Authorization: Bearer {accessToken}

Response:
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": { ... },
        "savedAt": "2026-04-05T10:00:00Z"
      }
    ],
    "total": 8
  }
}
```

#### 10. Add/Remove Favorite POI
```
POST /api/v1/pois/{poiId}/favorite
Authorization: Bearer {accessToken}

Request: (empty body or { "action": "add" })

Response:
{
  "message": "Added to favorites",
  "isFavorite": true
}

DELETE /api/v1/pois/{poiId}/favorite
Authorization: Bearer {accessToken}

Response:
{
  "message": "Removed from favorites",
  "isFavorite": false
}
```

### 🎵 Audio & Media

#### 11. Get Audio URL with Analytics Tracking
```
POST /api/v1/pois/{poiId}/audio/stream
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "language": "vi",
  "deviceId": "device-id",
  "sessionId": "session-id"
}

Purpose: Track audio play events and return signed URL if needed
Response:
{
  "status": "success",
  "audioUrl": "https://cdn.xyz/audio-vi.mp3",
  "duration": 45,
  "format": "mp3",
  "trackingId": "track-123"
}
```

### 💳 Premium/Subscription

#### 12. Get Premium Status
```
GET /api/v1/users/premium/status
Authorization: Bearer {accessToken}

Response:
{
  "isPremium": true,
  "expiresAt": "2026-06-08T00:00:00Z",
  "autoRenew": true,
  "planType": "MONTHLY",
  "nextBillingDate": "2026-05-08T00:00:00Z"
}
```

#### 13. Quick Payment Link
```
POST /api/v1/users/premium/checkout
Authorization: Bearer {accessToken}
Content-Type: application/json

Request:
{
  "planType": "MONTHLY",  // MONTHLY, QUARTERLY, ANNUAL
  "provider": "vnpay"
}

Response:
{
  "message": "Checkout initiated",
  "paymentUrl": "https://payment-provider.com/...",
  "planPrice": 50000,
  "currency": "VND"
}
```

---

## Implementation Examples

### Backend Implementation Pattern

All new APIs should follow this pattern:

```typescript
// File: src/routes/api/pois.ts (new endpoints)

import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middlewares/authMiddleware';
import asyncHandler from '../../utils/asyncHandler';
import ApiError from '../../utils/ApiError';

const router = Router();

/**
 * GET /api/v1/pois/featured
 * @summary Get featured POIs
 * @description Return top-rated or newly published POIs for homepage showcase
 * @tags POIs
 * @security bearerAuth
 * @param {number} limit.query - Max items (default: 6, max: 20)
 * @return {object} 200 - Featured POIs list
 * @return {object} 401 - Unauthorized
 * @return {object} 500 - Internal Server Error
 */
router.get(
  '/featured',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 6, 20);
    
    const data = await getFeaturedPois(limit);
    
    return res.status(200).json({
      status: 'success',
      data
    });
  })
);

export default router;
```

### Service Layer (Business Logic)

```typescript
// File: src/services/poiPublicService.ts (add this function)

export async function getFeaturedPois(limit: number) {
  const pois = await prisma.pointOfInterest.findMany({
    where: {
      isPublished: true,
      deletedAt: null
    },
    take: limit,
    orderBy: [
      { publishedAt: 'desc' }  // Recent first
    ],
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      latitude: true,
      longitude: true,
      type: true,
      audioUrls: true
    }
  });

  return pois;
}
```

---

## Frontend Integration Guide

### 1. Setup API Client

```javascript
// File: apps/website/src/lib/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = {
  // Auth
  register: (email, password, fullName) =>
    fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, deviceId: getDeviceId() })
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceId: getDeviceId() })
    }).then(r => r.json()),

  // POIs
  getPois: (page, limit, token) =>
    fetch(`${API_BASE_URL}/api/v1/pois?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  getFeaturedPois: (token, limit = 6) =>
    fetch(`${API_BASE_URL}/api/v1/pois/featured?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  searchPoisByRadius: (lat, lng, radiusM, token) =>
    fetch(`${API_BASE_URL}/api/v1/pois/search/radius`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ latitude: lat, longitude: lng, radiusM })
    }).then(r => r.json()),

  // Tours
  getTours: (page, limit, token) =>
    fetch(`${API_BASE_URL}/api/v1/tours?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  // Sync
  getSyncManifest: (token) =>
    fetch(`${API_BASE_URL}/api/v1/sync/manifest`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  // Analytics
  sendEvents: (events, token) =>
    fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ events })
    }).then(r => r.json())
};

function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'web-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}
```

### 2. Frontend Hook for Token Management

```javascript
// File: apps/website/src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiClient.login(email, password);
      if (data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return { token, user, loading, login, logout };
}
```

### 3. Frontend Page Example (Featured POIs)

```javascript
// File: apps/website/src/pages/Home.jsx

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/api';

export default function Home() {
  const { token } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    apiClient.getFeaturedPois(token, 6)
      .then(res => {
        if (res.status === 'success') {
          setFeatured(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Featured POIs</h2>
      
      {loading && <p>Loading...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map(poi => (
          <div key={poi.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
            {poi.image && <img src={poi.image} alt={poi.name.en} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <h3 className="font-bold text-lg">{poi.name.en}</h3>
              <p className="text-gray-600 text-sm">{poi.name.vi}</p>
              <p className="mt-2 text-gray-700">{poi.description.en.substring(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Environment Setup

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://admin:password123@localhost:5433/pho_am_thuc?schema=public"

# JWT & Auth
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Admin API Protection (optional)
ADMIN_API_KEY="your-admin-key"

# Server
PORT=3000
NODE_ENV=development

# TTS
REDIS_URL="redis://localhost:6379"
PIPER_BIN="piper"
PIPER_MODEL_DIR="./piper/models"
TTS_LOCAL_AUDIO_DIR="./public/audio"
TTS_PUBLIC_BASE_URL="/audio"

# Cloud Storage (Cloudinary for images)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Payment
PAYMENT_CALLBACK_SECRET="your-payment-secret"
VNPAY_MERCHANT_ID="your-merchant-id"
VNPAY_HASH_SECRET="your-hash-secret"
MOMO_PARTNER_CODE="your-partner-code"
MOMO_ACCESS_KEY="your-access-key"
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ADMIN_API_KEY=your-admin-key
VITE_MAP_API_KEY=your-map-provider-key
VITE_APP_NAME="Phố Ẩm Thực"
```

---

## 🚀 Next Steps

1. **Implement Missing Backend APIs** - Create routes and services for new endpoints
2. **Add Database Queries** - Extend Prisma queries to support new features
3. **Build Frontend Pages** - Create React components for new features
4. **Setup Error Handling** - Ensure consistent error responses
5. **Add Tests** - Write integration tests for all API endpoints
6. **API Documentation** - Generate OpenAPI/Swagger docs

---

## 📝 Summary

**Existing APIs (Already Implemented):**
- ✅ Auth (Register, Login, Refresh, Logout, Payments)
- ✅ Public POIs (List, Get, Search by Radius)
- ✅ Public Tours (List, Get)
- ✅ Sync (Manifest, Full, Incremental)
- ✅ Analytics (Events, Heartbeat, Stats)
- ✅ Admin (POIs, Tours, TTS Management)

**New APIs to Implement:**
- ⏳ Featured POIs/Tours
- ⏳ Global Search
- ⏳ Reviews System
- ⏳ User Favorites
- ⏳ User Profile
- ⏳ Map Bounds Data
- ⏳ Premium/Subscription
- ⏳ Audio Stream Tracking

All endpoints use JWT Bearer tokens for authentication and follow RESTful conventions with Vietnamese error messages.

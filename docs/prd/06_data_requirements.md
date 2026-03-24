# Section 8: Data Requirements

← [Back to Index](index.md)

---

## 8. Data Requirements

### 8.1 POI Data Model (SQLite – Local Mirror)

```typescript
interface POI {
  id: string;                           // UUID
  name: Record<string, string>;         // { "vi": "Phở Thìn", "en": "Thin Pho", ... }
  description: Record<string, string>;  // Short description, đa ngôn ngữ
  audioUrls: Record<string, string>;    // URL file âm thanh MP3 { "vi": "url", "en": "url" }
  latitude: number;                     // Vị trí (float64)
  longitude: number;                    // Vị trí (float64)
  type: POIType;                        // FOOD | DRINK | SNACK | WC
  image: string;                        // URL ảnh đại diện
}

enum POIType {
  FOOD   = 'Món chính',
  DRINK  = 'Đồ uống',
  SNACK  = 'Ăn vặt',
  WC     = 'Nhà vệ sinh'
}
```

**SQLite Schema:**

```sql
CREATE TABLE pois (
  id TEXT PRIMARY KEY,
  name_json TEXT NOT NULL,          -- JSON string
  description_json TEXT NOT NULL,   -- JSON string
  audio_urls_json TEXT NOT NULL,    -- JSON string
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  type TEXT NOT NULL,
  image TEXT,
  content_version INTEGER NOT NULL  
);

CREATE INDEX idx_pois_type ON pois(type);
```

**Field Validation Rules:** Bỏ GeoJSON polygon, chỉ cần điểm lat, lng.

---

### 8.2 Tour/Food Route Data Model (SQLite – Local Mirror)

```typescript
interface Tour {
  id: string;                          
  name: Record<string, string>;        
  description: Record<string, string>; 
  estimatedTime: number;               // Phút ước tính
  poiIds: string[];                    // Thứ tự POI ăn dọc tuyến
  image?: string;                      
  createdAt: string;                   
}
```

**SQLite Schema:**

```sql
CREATE TABLE tours (
  id TEXT PRIMARY KEY,
  name_json TEXT NOT NULL,
  description_json TEXT NOT NULL,
  estimated_time INTEGER NOT NULL DEFAULT 0,
  poi_ids_json TEXT NOT NULL,   
  image TEXT,
  created_at TEXT NOT NULL
);
```

---

### 8.3 Sync Manifest

```typescript
interface SyncManifest {
  contentVersion: number;    
  totalPois: number;
  totalTours: number;
  lastUpdatedAt: string;     
  checksum: string;          
}
```

---

### 8.4 User Preferences (Zustand Store + AsyncStorage)

```typescript
interface UserPreferences {
  selectedLocale: string;   
  volume: number;           
}
```

---

### 8.5 Analytics Telemetry (Local Buffer → Batch Upload)

```typescript
interface UserTelemetry {
  deviceId: string;      
  sessionId: string;     
  interactions: {
    poiId: string;
    action: "PLAY" | "PAUSE" | "STOP" | "QR_SCAN";
    durationMs: number;
    language: string;
    timestamp: number;
  }[];
}
```

**SQLite Schema (Analytics Buffer):**

```sql
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  poi_id TEXT,
  action TEXT NOT NULL,       -- PLAY, PAUSE, STOP, QR_SCAN
  duration_ms INTEGER,
  language TEXT,
  timestamp INTEGER NOT NULL,
  uploaded INTEGER NOT NULL DEFAULT 0
);
```

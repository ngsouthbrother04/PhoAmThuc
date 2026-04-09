# Frontend to Backend Integration Guide

## 📁 Project Structure

```
apps/
├── backend/        # Express API Server
│   ├── src/
│   │   ├── routes/api/
│   │   │   ├── auth.ts
│   │   │   ├── pois.ts
│   │   │   ├── tours.ts
│   │   │   ├── users.ts
│   │   │   ├── search.ts
│   │   │   ├── sync.ts
│   │   │   ├── analytics.ts
│   │   │   └── admin.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── poiPublicService.ts
│   │   │   ├── tourPublicService.ts
│   │   │   ├── publicContentService.ts (NEW)
│   │   │   ├── userService.ts (NEW)
│   │   │   ├── syncService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── ...
│   │   └── index.ts
│   └── package.json
│
└── website/        # React Frontend
    ├── src/
    │   ├── lib/
    │   │   └── api.js (Frontend API Client)
    │   ├── hooks/
    │   │   └── useApi.js (React Hooks for APIs)
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Map.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── ...
    │   ├── components/
    │   │   ├── MapComponent.jsx
    │   │   ├── POIDetailPanel.jsx
    │   │   └── ...
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

## 🔧 Step 1: Backend Setup

### New Backend Services Created

#### A. `publicContentService.ts`
Functions for featured content and search:
- `getFeaturedPois()` - Get recently published POIs
- `getFeaturedTours()` - Get recently published tours
- `searchContent()` - Global search across POIs/tours
- `getPoisByBounds()` - Get POIs within map area

#### B. `userService.ts`
User profile management:
- `getUserProfile()` - Get user info
- `updateUserProfile()` - Update profile
- `getUserFavoritePois()` - Get saved POIs

### New Routes Added

#### A. Enhanced `/api/v1/pois` Routes:
```
GET    /api/v1/pois/featured?limit=6
POST   /api/v1/pois/bounds
```

#### B. Enhanced `/api/v1/tours` Routes:
```
GET    /api/v1/tours/featured?limit=4
```

#### C. New `/api/v1/search` Router:
```
GET    /api/v1/search?q=keyword&type=poi,tour
```

#### D. New `/api/v1/users` Router:
```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users/me/favorites
```

### Installation Steps

1. **Install new service files** - Already done
2. **Update main `index.ts`** - Routes registered
3. **Run database migration** (if needed):
```bash
cd apps/backend
npm run db:setup
```

4. **Start backend server**:
```bash
npm run dev
```

Expected output:
```
Server running on http://0.0.0.0:3000
Database connected successfully
TTS worker initialized
```

---

## 🎨 Step 2: Frontend Setup

### Environment Configuration

Create `apps/website/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ADMIN_API_KEY=your-optional-admin-key
```

### API Client Usage

#### Option A: Direct API Calls (Simplest)

```javascript
import { poisAPI, toursAPI, authAPI } from './lib/api';

// Usage in components
const response = await poisAPI.getFeatured(6);
console.log(response.data);
```

#### Option B: React Hooks (Recommended)

```javascript
import { useFeaturedPois, useAuth } from './hooks/useApi';

function HomePage() {
  const { pois, loading } = useFeaturedPois(6);
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <ul>
          {pois.map(poi => (
            <li key={poi.id}>{poi.name.en}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Example Component Implementations

#### 1. Home Page with Featured Content

```javascript
// apps/website/src/pages/Home.jsx
import { useFeaturedPois, useFeaturedTours } from '../hooks/useApi';

export default function Home() {
  const { pois, loading: poisLoading } = useFeaturedPois(6);
  const { tours, loading: toursLoading } = useFeaturedTours(4);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-12">Phố Ẩm Thực</h1>

      {/* Featured POIs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Restaurants</h2>
        {poisLoading ? (
          <p>Loading POIs...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pois.map(poi => (
              <POICard key={poi.id} poi={poi} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Tours */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Tours</h2>
        {toursLoading ? (
          <p>Loading tours...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function POICard({ poi }) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      {poi.image && (
        <img 
          src={poi.image} 
          alt={poi.name.en} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg">{poi.name.en}</h3>
        <p className="text-gray-600 text-sm">{poi.name.vi}</p>
        <p className="mt-2 text-gray-700">{poi.description.en.substring(0, 100)}...</p>
        <div className="mt-4 flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {poi.type}
          </span>
        </div>
      </div>
    </div>
  );
}
```

#### 2. Search Component

```javascript
// apps/website/src/components/SearchBar.jsx
import { useState } from 'react';
import { useSearch } from '../hooks/useApi';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          placeholder="Search POIs, tours..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {loading && <p className="mt-2">Searching...</p>}

      {results && (
        <div className="mt-4 space-y-4">
          {results.pois?.length > 0 && (
            <div>
              <h3 className="font-bold">POIs</h3>
              {results.pois.map(poi => (
                <div key={poi.id} className="p-2 hover:bg-gray-100">
                  {poi.name.en}
                </div>
              ))}
            </div>
          )}

          {results.tours?.length > 0 && (
            <div>
              <h3 className="font-bold">Tours</h3>
              {results.tours.map(tour => (
                <div key={tour.id} className="p-2 hover:bg-gray-100">
                  {tour.name.en}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### 3. User Profile Component

```javascript
// apps/website/src/pages/Profile.jsx
import { useUserProfile } from '../hooks/useApi';
import { Edit2 } from 'lucide-react';

export default function Profile() {
  const { user, loading, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  const handleUpdate = async () => {
    await updateProfile(fullName);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="bg-white rounded-lg p-6 shadow">
          <p>Email: {user.email}</p>
          <p>Name: {user.fullName}</p>
          <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>

          {isEditing ? (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="Full name"
              />
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 flex items-center gap-2 text-blue-500"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 4. Map with Real POIs

```javascript
// apps/website/src/components/MapComponent.jsx
import { useEffect, useRef, useState } from 'react';
import { poisAPI } from '../lib/api';

export default function MapComponent() {
  const mapRef = useRef(null);
  const [pois, setPois] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => {
    // Simulate map bounds change
    const bounds = {
      north: 21.05,
      south: 21.00,
      east: 105.85,
      west: 105.80
    };

    poisAPI.getByBounds(bounds.north, bounds.south, bounds.east, bounds.west)
      .then(res => {
        if (res.status === 'success') {
          setPois(res.data);
        }
      });
  }, [mapBounds]);

  return (
    <div ref={mapRef} className="w-full h-full">
      {/* Map rendering logic */}
      <div>Map with {pois.length} POIs</div>
    </div>
  );
}
```

---

## 🚀 Running the Full Stack

### Terminal 1: Backend
```bash
cd apps/backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd apps/website
npm install
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173 (Vite default)
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api-docs

---

## 📋 API Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/pois` | ✓ | List all POIs |
| GET | `/api/v1/pois/featured` | ✓ | Get featured POIs |
| GET | `/api/v1/pois/:id` | ✓ | Get POI details |
| POST | `/api/v1/pois/search/radius` | ✓ | Search by location |
| POST | `/api/v1/pois/bounds` | ✓ | Get POIs in map area |
| GET | `/api/v1/tours` | ✓ | List all tours |
| GET | `/api/v1/tours/featured` | ✓ | Get featured tours |
| GET | `/api/v1/tours/:id` | ✓ | Get tour details |
| GET | `/api/v1/search` | ✓ | Global search |
| GET | `/api/v1/users/me` | ✓ | Get user profile |
| PATCH | `/api/v1/users/me` | ✓ | Update profile |
| GET | `/api/v1/users/me/favorites` | ✓ | Get favorite POIs |
| POST | `/api/v1/auth/register` | ✗ | Create account |
| POST | `/api/v1/auth/login` | ✗ | Login |
| POST | `/api/v1/auth/logout` | ✓ | Logout |
| GET | `/api/v1/sync/manifest` | ✓ | Get sync info |
| POST | `/api/v1/analytics/events` | ✓ | Track analytics |

---

## 🔍 Testing APIs

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Result stores accessToken
export TOKEN="eyJhbGc..."

# Get featured POIs
curl http://localhost:3000/api/v1/pois/featured \
  -H "Authorization: Bearer $TOKEN"

# Search
curl "http://localhost:3000/api/v1/search?q=pho&type=poi,tour" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Database Seeding

Test data is automatically seeded. To re-seed:

```bash
cd apps/backend
npm run prisma:seed
```

Seeded data includes:
- 50+ POIs with multilingual content
- 5+ Tours with POI sequences
- Sample Analytics events

---

## ✅ Checklist for Full Integration

- [ ] Backend running (`npm run dev` in apps/backend)
- [ ] Frontend environment configured (.env in apps/website)
- [ ] Frontend running (`npm run dev` in apps/website)
- [ ] Test login endpoint working
- [ ] Featured POIs displaying on Home page
- [ ] Search functionality working
- [ ] Map showing real POI data
- [ ] User profile page accessible
- [ ] Analytics events being tracked

---

## 🐛 Troubleshooting

### "CORS blocked" Error
- Ensure backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend .env

### "Token is invalid" Error
- Token may have expired
- Frontend should automatically refresh using refreshToken

### "POIs not loading"
- Check `npm run db:setup` was run
- Verify database connection in backend logs
- Ensure /api/v1/pois route is registered

### "Search returning empty"
- Query must be >= 2 characters
- Check that POIs are published (isPublished: true)

---

## 📚 Documentation Files

Created:
- [API_BACKEND_WEBSITE_INTEGRATION.md](./API_BACKEND_WEBSITE_INTEGRATION.md) - Complete API reference
- [Frontend-Integration-Guide.md](./Frontend-Integration-Guide.md) - This file
- New service files in backend/src/services/
- New route files in backend/src/routes/api/

All services follow the existing patterns and are fully TypeScript typed.

# 10. Technical Constraints

[Back to Index](index.md)

---

## 1. Required Web Stack

1. React 18+ with Vite (browser runtime).
2. TypeScript 5+.
3. Browser Geolocation API for foreground location only.
4. HTMLAudioElement / Howler.js for MP3 playback.
5. Browser storage for preferences and session state.
6. Standard browser fetch and audio playback APIs.
7. Leaflet + OpenStreetMap for map rendering.
8. zustand for app and audio state.

## 2. Required Backend Stack

1. Node.js 20+ with Express.
2. PostgreSQL with PostGIS.
3. Prisma ORM.
4. Redis cache.
5. Background job worker for TTS generation.

## 3. Hard Constraints

1. No geofence and no background location monitoring.
2. No on-device TTS generation.
3. No microservices/Kafka/RabbitMQ for MVP.
4. No GraphQL for MVP APIs.

## 4. Integration Dependencies

1. Payment providers: VNPay and Momo.
2. TTS provider: Piper (self-hosted, free, no account).
3. Storage: audio on local filesystem; images on Cloudinary.

## 5. Known Limitations

1. Fetched MP3 assets increase network dependency during playback.
2. Base map tiles depend on network provider availability.
3. Data updates are request-based, not real-time streaming.

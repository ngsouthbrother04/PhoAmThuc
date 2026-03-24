# Implementation Task Breakdown

Execution plan derived from SPEC_CANONICAL.md.

Execution tracker:
- EXECUTION_TODO_ISSUES.md

Status: active
Version: 1.0
Last updated: 2026-03-24

## 1. Scope and Priority

P0 modules (must build first):
1. Auth and Access Gate
2. Backend TTS Audio Generation
3. Content Sync and Offline SQLite Mirror
4. Map UI and Marker Engine 
5. Audio Player State Machine (Tap to Play)
6. QR Direct Fallback

P1 modules (next):
1. Language and Playback Controls
2. Tour Mode (Food Routes)
3. Settings and Re-sync UX

## 2. Workstream Structure

Workstream A: Backend API and Data
Workstream B: Mobile Core Runtime & Map Engine
Workstream C: Mobile Feature UX
Workstream D: Quality and Release Readiness

## 3. Detailed Task Breakdown

### Workstream A: Backend API and Data
A1. Boot Backend (Express, Node 20+, Postgres, S3/Local Storage)
A2. Auth/Payment Endpoints
A3. TTS Generation Integration (Google Cloud TTS to produce MP3 files)
A4. Sync Endpoints (Manifest & Full Payload with audioUrls)

### Workstream B: Mobile Core Runtime
B1. App Shell and Navigation Stack
B2. Local SQLite Layer for offline sync
B3. Sync Service implementation
B4. **Map UI & Markers**: Display POIs fetched from SQLite onto `react-native-maps`. Implement foreground blue dot.
B5. **Audio Player State Machine**: Implement IDLE -> PLAYING -> PAUSED using `expo-av`. Enforce Single Voice Rule (stopping old audio mp3 when new is requested).

### Workstream C: Mobile Feature UX
C1. Point of Interest Bottom Sheet & Detail View.
C2. Auth / Sync UX with Offline Fallback.
C3. Language Picker & Expo Settings.
C4. Playback UI Controls (Mini Player).

### Workstream D: Quality and Release Readiness
D1. Unit test State Machine for interruption correctly shutting down TTS.
D2. Integration testing from Auth to Tap-to-play.
D3. UI Performance benchmarking (map render speed, tap latency `< 500ms`).

## 4. Change Management Rule

If any task requires changing semantics:
1. Update SPEC_CANONICAL.md first.
2. Ensure no Geofence/Auto-play code leaks into the repository.

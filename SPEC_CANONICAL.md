# Spec Canonical

Single source of truth for implementation and AI code generation.

Status: active
Version: 1.0
Last updated: 2026-03-24

## 1. Product Identity

Location-Based Food Narration System (Phố Ẩm Thực).

Core principle:
User-controlled food exploration is the priority. Narration plays ONLY when the user explicitly interacts (Tap/QR).

## 2. Non-Negotiable Invariants

1. User UI Interaction (Tap/QR) is the ONLY trigger for narration.
2. GPS tracking alone NEVER triggers audio directly.
3. Single voice rule: strictly one narration at a time. Previous stops when new starts.
4. Background Location is forbidden. GPS is foreground only.
5. Offline-first after first successful sync.
6. Analytics logging must not be removed.

## 3. QR Semantics

1. QR is a direct trigger.
2. QR uses Narration Engine State Machine and single-voice rules.

## 4. Canonical Runtime and Stack

Mobile:
- React Native with Expo managed workflow
- TypeScript
- expo-location (Foreground only)
- expo-av (Audio File Playback)
- expo-file-system (Audio caching)
- expo-sqlite
- zustand
- react-native-maps

Backend:
- Node.js 20+
- Express + TypeScript
- PostgreSQL 
- Redis
- Google Cloud TTS API (or similar free tier API)
- Storage (Local/S3 for audio files)

## 5. Canonical State Machine

States:
- IDLE
- PLAYING
- PAUSED

Transitions:
- IDLE -> PLAY_EVENT -> PLAYING
- PLAYING -> PAUSE_EVENT -> PAUSED
- PAUSED -> RESUME_EVENT -> PLAYING
- PLAYING/PAUSED -> STOP_EVENT -> IDLE
- PLAYING -> PLAY_EVENT(New POI) -> IDLE (Stop active) -> PLAYING

## 6. Canonical Timing Defaults

1. Tap Response: < 500ms bottom sheet opening.
2. Audio Start: < 1-2s after pressing "Nghe thuyết minh".

## 7. Canonical Data Naming

Backend primary POI table:
- points_of_interest

Mobile offline mirror table:
- pois

Important:
- Do not rename these without migration plan.

## 8. Sync Contract

1. App launch or manual refresh checks sync manifest.
2. If server version is newer, perform full sync.
3. SQLite write must be atomic replace.
4. Exploration session reads POI content from SQLite only.

## 9. Implementation Guardrails for AI Codegen

1. Never implement Geofence or background location tracking.
2. Never auto-play audio.
3. Never assume always-online network. (Audio files must be cached for offline play).
4. Never implement parallel narration for two POIs (strict Single Voice).
5. Do NOT introduce microservices or event-driven frameworks (Kafka/RabbitMQ) for TTS generation. Keep it simple in the monolith backend.
6. **Strict Testing Requirement**: A feature is NOT complete until comprehensive Unit Tests are written and passing. Do not propose opening a PR or moving to the next task if tests are missing or failing.

## 10. Primary References

- Source of Truth: README.md
- AI invariants: AI_GUIDELINES.md
- System architecture: ARCHITECTURE.md
- User PRD index: docs/prd/index.md

## 11. Conflict Resolution Rule

If documentation conflicts:
1. **README.md (Absolute Source of Truth)**
2. SPEC_CANONICAL.md (this file)
3. AI_GUIDELINES.md
4. ARCHITECTURE.md
5. docs/prd/* (bao gồm cả 15_admin_requirements.md)

## 12. Admin CMS Rules (Canonical for Backend & AI Codegen)

**Scope:** Admin Dashboard là **Web CMS riêng** (không nằm trong Mobile App).  
Tất cả codegen liên quan đến Admin phải tuân thủ các invariant sau:

### 12.1 Non-Negotiable Admin Invariants
1. **TTS Generation is Server-Side Only**  
   - Khi Admin Create/Edit POI → Backend **phải** trigger background job gọi Google Cloud TTS (hoặc tương đương) để sinh file MP3 cho **15 ngôn ngữ**.  
   - Mobile App **không bao giờ** sinh TTS (expo-speech chỉ dùng để playback file đã có sẵn).

2. **Atomic Publish Flow**  
   - Thay đổi POI/Tour chỉ được áp dụng khi Admin nhấn **“Publish”**.  
   - Chỉ lúc này `contentVersion` mới tăng và Sync Manifest được cập nhật.  
   - Trước Publish, mobile app vẫn thấy version cũ.

3. **Audio & Media Handling**  
   - Image upload → AWS S3/CDN (theo 10_technical_constraints.md).  
   - Audio files lưu dưới dạng `audioUrls` JSONB trong bảng `points_of_interest`.  
   - Có nút “Regenerate Audio” cho từng POI (chỉ regenerate ngôn ngữ bị thay đổi nếu có thể).

4. **No Impact on Mobile Invariants**  
   - Admin CRUD **không được** thay đổi bất kỳ quy tắc nào của User:  
     - Single Voice Rule  
     - User-Trigger only (Tap/QR)  
     - Offline-first  
     - Foreground GPS only  
   - Backend chỉ cung cấp data; mobile vẫn đọc từ SQLite Mirror.

### 12.2 Reference
- Chi tiết đầy đủ Admin Requirements: `docs/prd/15_admin_requirements.md`
- Backend implementation phải tuân thủ `ARCHITECTURE.md §3.4` (TTS background job) và `backend_design.md §1.2`.

**AI Codegen Guardrail:**  
Khi AI sinh code cho backend (Express routes, TTS worker, Admin controllers), **bắt buộc** kiểm tra lại 12.1 trước khi hoàn thành.

When updating behavior or defaults, align with README.md first.

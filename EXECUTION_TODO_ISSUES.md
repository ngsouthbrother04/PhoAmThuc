# Execution TODO Issues

Issue-style execution tracker mapped to current repository files.

Source alignment:
- SPEC_CANONICAL.md
- IMPLEMENTATION_TASK_BREAKDOWN.md

Status legend:
- TODO
- IN_PROGRESS
- IN_REVIEW
- QA
- BLOCKED
- DONE
- DONE_WITH_NOTES

All core logic must comply with SPEC_CANONICAL.md (Single Voice Rule, Map Tap Triggers).

## Sprint S1 (P0 Foundation)

### ISSUE-001 - Backend bootstrap hardening
Status: TODO
Priority: P0
Scope: Update backend app bootstrap and config loading.
Target files: apps/backend/src/index.ts

### ISSUE-002 - Auth API skeleton and validation
Status: TODO
Priority: P0
Scope: Add payment-initiate and claim-code API contracts.

### ISSUE-003 - Backend TTS Processing (Google Cloud)
Status: TODO
Priority: P0
Scope: Implement job to call Cloud TTS, save MP3 files to S3/Local, and store audio_urls in PostgreSQL.

### ISSUE-003B - Sync manifest and full content endpoints
Status: TODO
Priority: P0
Scope: Implement manifest check and full sync response for POIs (including audio_urls).

### ISSUE-004 - Mobile app shell and routing baseline
Status: TODO
Priority: P0
Scope: Replace placeholder UI with auth + main app shell.

### ISSUE-005 - SQLite data layer baseline
Status: TODO
Priority: P0
Scope: Add local persistence layer for pois, tours.

### ISSUE-006 - Sync service and offline-first bootstrap
Status: TODO
Priority: P0
Scope: Add launch-time manifest compare and sync flow.

### ISSUE-007 - Map UI and Marker Engine
Status: TODO
Priority: P0
Scope: Renders POIs on the map and handles user tap interactions.
Target files: apps/mobile/App.tsx
Verify steps: 
1. Map displays markers. 
2. Tapping markers opens bottom sheet.

### ISSUE-008 - Audio Player State Machine using expo-av
Status: TODO
Priority: P0
Scope: Add IDLE, PLAYING, PAUSED transitions via `expo-av` and enforce Single Voice Rule so only one POI's audio plays at a time.

## Sprint S2 (P0 Completion + P1 Core UX)

### ISSUE-009 - QR manual fallback path
Status: TODO
Priority: P0
Scope: Implement QR trigger through same narration State Machine.

### ISSUE-010 - Language and playback controls
Status: TODO
Priority: P1
Scope: Add language selection and player controls (Play/Pause/Stop).

### ISSUE-011 - Tour list/detail and active mode
Status: TODO
Priority: P1
Scope: Build tour browsing and filter map to show current tour stops.

## Sprint S3 (Quality + Hardening)

### ISSUE-012 - Unit tests for State Machine
Status: TODO
Priority: P1
Scope: Test the Single Voice Rule (interruptions) and Play/Pause logic.

### ISSUE-013 - Integration and scenario tests
Status: TODO
Priority: P1
Scope: Validate core end-to-end scenarios from docs/test_scenarios.md.

## Current blockers snapshot
1. Mobile dependencies required by canonical spec are not installed yet.
2. Backend route structure is still single-file and needs modularization.

## Rules for execution
1. Any behavior/default change must update SPEC_CANONICAL.md first.
2. Do not merge changes that violate the single-voice invariants or attempt to add auto-play geo logic.

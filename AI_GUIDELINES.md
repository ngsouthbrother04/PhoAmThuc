# AI Guidelines

> **Audience**: GitHub Copilot, AI Agents, Developers using AI assistance
>
> **Purpose**: Define system invariants, constraints, and non-negotiable rules that AI-generated code MUST follow.

---

## 1. System Identity

This project is a **Location-Based Food Narration System** (Phố Ẩm Thực).

Core principle:
> **User-controlled food exploration is the priority.** Narration plays *only* when the user explicitly interacts with the app (Tap on Map POI or Scan QR).

---

## 2. No Background GPS or Auto-Play

- The system strictly avoids automatic audio triggers.
- Background location tracking is REMOVED.
- Geofences are REMOVED.
- Do not implement ray-casting or complex geolocation math for triggers.

---

## 3. Offline‑First Constraint

- POI data and narration scripts MUST be available offline
- **SQLite** (via expo-sqlite) is the REQUIRED local storage mechanism for POI Data
- Network availability MUST NOT be assumed during active exploration sessions.

---

## 4. Single Voice Rule

- The app MUST NEVER play two audio narrations at the same time.
- Playing a new POI MUST immediately stop the previous audio before starting the new one.

---

## 5. QR Code Usage Rules

- QR codes represent fixed, physical Points of Interest (Food stalls).
- QR trigger is a direct interaction path and MUST still pass through the Narration Engine State Machine (single voice rules).

---

## 6. Explicit Non‑Goals (DO NOT)

AI MUST NOT:
- Implement any form of Geofencing or Auto-play audio.
- Run continuous GPS tracking in the background.
- Assume continuous internet connectivity.

---

## 7. AI Prompt Hint

When generating code or analysis, assume:

"This system prioritizes explicit user interaction (Tap to Play), offline availability, and the strict Single Voice Rule over any form of automatic geographical triggers."

### 7.3 Strict Unit Testing Mandate

- **No Code Complete Without Tests**: Whenever you write a feature or refactor a logic block, you MUST immediately write or update the corresponding Unit Tests (e.g., using Jest for Mobile, or Vitest/Jest for Backend).
- **Passing State**: You cannot mark a task as DONE unless the test suite passes locally.
- **AAA Pattern**: Always use Arrange-Act-Assert.

---

## 8. Technology Stack (MANDATORY)

### 8.1 Mobile Application
- **Framework**: React Native with **Expo managed workflow**.
- **Core Features**: Location mapping (foreground only), **Audio Player (expo-av)**, SQLite (expo-sqlite), **Offline File Caching (expo-file-system)**.

### 8.2 Backend API
- **Runtime**: Node.js 20+ + Express (TypeScript). Monolith architecture.
- **Protocol**: REST API.
- **TTS Generation**: Backend calls Cloud TTS API (e.g., Google TTS) when Admin creates/updates a POI, saving audio files to storage. Do NOT use microservices.

### 8.3 Database & Storage
- **Primary DB**: **PostgreSQL** (SQL).
- **Cache**: **Redis**.
- **Offline DB**: **SQLite**.
- **File Storage**: Local FS or S3 for MP3 audio files.

### 8.4 Payment Processing
- **Gateways**: **VNPay** (Default) or **Momo**.

---

**End of AI_GUIDELINES**

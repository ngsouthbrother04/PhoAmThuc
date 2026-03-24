# Use Cases

> **Project**: Phố Ẩm Thực – Mapped Food Narration System
>
> **Template Source**: Focused Use Cases (School of Computing)
>
> **Purpose**: Define system use cases for academic submission, following the standard Use Case Report format.
>
> **Technical Context**: All use cases assume **React Native (Expo)** implementation with **Offline-first** architecture.

---

## Revision History

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-24 | 2.0 | Shifted to Food Street Tap-to-Play Model | Antigravity |

---

## Table of Contents

- UC1 – Access Application & Authorization
- UC2 – Map-Based POI Narration (Tap-to-Play)
- UC3 – Manual POI Activation (QR Code)
- UC4 – Select Language & Playback Control
- UC5 – View Food Tour & Exploration

---

All narration, QR, and state-machine rules are governed by SPEC_CANONICAL.md.

## UC1 – Access Application & Authorization

**Actor(s)**: Foodie (Visitor)

**Maturity**: Focused

**Summary**: Visitor accesses the application after authorization (payment/claim code) and downloads offline content.

### Basic Course of Events

| Actor Action | System Response | Technical Realization |
|-------------|----------------|-----------------------|
| 1. Visitor opens the application | 2. System checks Auth State | `SecureStore` check |
| 3. Visitor selects payment method or enters Code | 4. System validates authorization | `Axios` call to Node.js / `WebView` |
| 5. Authorization successful | 6. **CRITICAL**: System syncs all POI data | Atomic Write to `SQLite` |

---

## UC2 – Map-Based POI Narration (Tap-to-Play)

**Actor(s)**: Foodie

**Maturity**: Focused

**Summary**: Visitor generates speech when tapping a specific POI marker on the map.

### Basic Course of Events

| Actor Action | System Response | Technical Realization |
|-------------|----------------|-----------------------|
| 1. Visitor taps a POI Marker on the map | 2. System opens Bottom Sheet | `react-native-maps` onMarkerPress |
| 3. Visitor taps "Nghe thuyết minh" | 4. Audio State Machine receives `PLAY` | State Machine transitioning to `PLAYING` |
|  | 5. System generates Audio | `expo-speech.speak(text)` |

### Alternative Paths
- A1: Visitor plays another POI while one is already playing → Previous narration stops immediately (`expo-speech.stop()`), new one starts (Single Voice Rule).

### Postconditions
- Events logged to `AnalyticsBuffer` (in-memory -> SQLite -> Batch Upload)

---

## UC3 – Manual POI Activation (QR Code)

**Actor(s)**: Foodie

**Maturity**: Focused

**Summary**: Visitor scans QR code at the physical food stall to trigger TTS.

### Basic Course of Events

| Actor Action | System Response | Technical Realization |
|-------------|----------------|-----------------------|
| 1. Visitor scans QR code | 2. System detects POI ID | `expo-camera` / `expo-barcode-scanner` |
|  | 3. System looks up Text Content | Query `SQLite` by `poi_id` |
|  | 4. System triggers TTS | `expo-speech.speak(text)` |

### Constraints
- QR codes still use the Narration Audio State Machine (Single Voice Rule).

---

## UC4 – Select Language & Playback Control

**Actor(s)**: Foodie

**Maturity**: Focused

**Summary**: Visitor selects language and controls audio playback.

### Basic Course of Events

| Actor Action | System Response | Technical Realization |
|-------------|----------------|-----------------------|
| 1. Visitor selects language (e.g., KR) | 2. System updates Preference State | `Zustand` store update |
|  | 3. TTS Engine switches Voice ID | `expo-speech` config |
| 3. Visitor presses Pause in Mini Player | 4. TTS pauses | `expo-speech.pause()` |

---

## UC5 – View Food Tour & Exploration

**Actor(s)**: Foodie

**Maturity**: Focused

**Summary**: Visitor explores a predefined food tour with markers filtered on map.

### Basic Course of Events

| Actor Action | System Response | Technical Realization |
|-------------|----------------|-----------------------|
| 1. Visitor selects a Food Tour | 2. System filters Map to show only tour POIs | `react-native-maps` Markers |
| 3. Visitor taps markers along route | 4. Narration plays | Inherits **UC2** logic |

---

**End of USE_CASES**

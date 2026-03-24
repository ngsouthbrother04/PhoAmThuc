# USE CASE ↔ TEST SCENARIO ↔ ARCHITECTURE MAPPING

> **Purpose**: Demonstrate traceability between academic use cases, test scenarios, and system architecture.
>
> **Value**: Strong alignment artifact for project defense and grading.

---

## Mapping Table

| Use Case | Test Scenario (Kịch bản test) | Architecture Component (Specific Libs) |
|---------|------------------------------|----------------------------------------|
| UC1 – Access Application | Scenario 1 – Thanh toán | **AuthModule** (`SecureStore`, `WebView`), **DataSync** (`Axios`, `SQLite`) |
| UC2 – Map-Based POI Narration | Scenario 1 – Tương tác Tap-to-Play | **MapEngine** (`react-native-maps`), **TTSEngine** (`expo-speech`) |
| UC3 – Manual POI Activation | Scenario 1 – Chọn POI qua mã QR | **QRHandler** (`expo-camera`), **TTSEngine** (`expo-speech`) |
| UC4 – Language & Playback | Scenario 1 – Chọn ngôn ngữ, Play/Pause | **TTSEngine** (`expo-speech`), **PreferencesStore** (`Zustand`) |
| UC5 – Food Tour Exploration | Scenario 2 – Lộ trình Ẩm thực | **MapModule** (`react-native-maps` Filtering) |

---

## Architectural Trace Examples

### UC2 – Map-Based POI Narration

- **Trigger**: `TAPPED_POI_LISTEN` event from Map Engine popup.
- **Decision**: User Interface Map marker selection.
- **Execution**: Narration Engine (State Machine: `IDLE` -> `PLAYING`).
- **Output**: `expo-speech.speak()` (Text from SQLite).
- **Logging**: Analytics Module (`SQLite` buffer -> Batch Upload).

---

### UC3 – QR Code Activation

- **Trigger**: QR scan via `expo-camera` looking at the stall's menu.
- **Execution**: Narration Engine (dispatch `PLAY_EVENT`, still enforces single voice + interrupt rules).

---

## Defense Notes (For Presentation)

- **Technical Integrity**: All use cases map to specific Expo libraries (Maps, Speech, SQLite).
- **Offline-first**: UC1 ensures all data is available locally, enabling UC2-UC5 to function without network.
- **Traceability**: Every user action results in a measurable Architectural Event.

---

**End of USE CASE MAPPING**

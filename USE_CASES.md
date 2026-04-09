# Use Cases – Phố Ẩm Thực

> **Project**: Phố Ẩm Thực – Location-Based Food Narration System  
> **Version**: 3.0  
> **Last Updated**: 2026-03-25  
> **Purpose**: Define all system use cases for academic submission per standard UC format

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-03-24 | 2.0 | Shifted to Food Street Tap-to-Play Model | Team |
| 2026-03-25 | 3.0 | Expanded with detailed flows, edge cases, preconditions | Architect |

---

## Table of Contents

1. **UC1** – Access & Authorization
2. **UC2** – Explore Map (POI Discovery)
3. **UC3** – Play POI Narration (Tap-to-Play)
4. **UC4** – Scan QR Code for Narration
5. **UC5** – Switch Language & Settings
6. **UC6** – Control Audio Playback (Pause/Resume/Stop)
7. **UC7** – View Food Tour & Exploration
8. **UC8** – Network Required Content Access

---

## UC1 – Access Application & Authorization

**Actor**: Foodie / Visitor  
**Maturity**: Focused  
**Priority**: Critical  

Visitor accesses the web application after authenticating via email and password (Log In or Sign Up), and the system loads content from the backend.

---

### Preconditions
- Web app is opened in a modern browser
- Internet connection available (for initial sync)
- Device has sufficient storage (>100MB)

---

### Basic Flow

| Step | Actor | System | Technical Realization |
|------|-------|--------|----------------------|
| 1 | Opens Phố Ẩm Thực app | Displays login/auth screen | App starts in unauthenticated state |
| 2 | Chooses action | Shows: (a) Login, (b) Register | UI branch logic |
| 3a | **Path A: Register** | | |
| 3a1 | Enters email, password, name | System creates user account | POST `/api/v1/auth/register` |
| 3a2 | | Account created | Requires login next |
| 3b | **Path B: Login** | | |
| 3b1 | Enters email & password | System validates credentials | POST `/api/v1/auth/login` |
| 3b2 | | Credentials valid | Returns JWT token + user session |
| 4 | | **CRITICAL**: Load content from API | GET `/api/v1/pois?language=...` → GET `/api/v1/tours` |
| 5 | | Receives POI data + audio URLs | Render from API response |
| 6 | | Displays map with all POI markers | Shows live data ready for exploration |
| 7 | User sees map screen | System ready for exploration | Auth state: AUTHORIZED |
| 8 | User continues session | Refreshes token or logout when needed | POST `/api/v1/auth/token-refresh`, POST `/api/v1/auth/logout` |

---

### Postconditions
- User is authenticated (JWT token stored in browser storage)
- All POI data loaded from API responses
- Audio MP3 files are fetched when needed
- User can explore while connected

---

### Alternative Paths

**A1: Invalid Login Credentials**
- User enters wrong email or password
- System returns 401 error: "Sai tài khoản hoặc mật khẩu"
- User must retry with correct credentials

**A2: Email Already Exists (Register)**
- User registers with an email already in the system
- System returns 400 error: "Email này đã được sử dụng"
- User is prompted to login instead

**A4: Network Issue During Sync**
- Sync fails mid-process
- System retries sync automatically on next launch
- User can manually trigger "Sync Now" button

**A5: Token Expired During Active Session**
- API returns 401 due to expired access token
- Client calls POST `/api/v1/auth/token-refresh`
- If refresh fails, client clears session and calls POST `/api/v1/auth/logout`

---

### Edge Cases & Exception Handling

| Scenario | Behavior |
|----------|----------|
| User closes app during sync | Sync resume on next app launch (delta sync) |
| Storage full (no space for audio) | Show warning: "Lưu trữ thiết bị gần đầy" |
| Corrupted local browser store | Wipe & re-sync from server |
| Token expired | Re-authenticate when online |
| Server version newer, but no internet | Show last cached version, prompt to reconnect |

---

### Related Use Cases
- UC2 – Explore Map
- UC8 – Network Required Content Access

---

## UC2 – Explore Map (POI Discovery)

**Actor**: Foodie  
**Maturity**: Focused  
**Priority**: Critical  

### Summary
After authorization, user explores the map view with POI markers representing food stalls, restaurants, and drink spots.

---

### Preconditions
- User is authenticated (UC1 completed)
- Content loaded from API
- Location permission granted
- Map is displayed

---

### Basic Flow

| Step | Actor | System | Technical Details |
|------|-------|--------|-------------------|
| 1 | Views map screen | Renders all POI markers | Leaflet + API query |
| 2 | Moves/scrolls map | Map updates visible markers | Viewport change listener |
| 3 | User location updates | Shows blue dot on map | Browser geolocation foreground tracking |
| 4 | Location near POI (visual highlight) | Nearby POIs highlighted/animated | UI enhancement (NOT auto-play) |
| 4a | User clicks map to simulate position | Nearest POI is highlighted with an enlarged anchor style | UI enhancement (NOT auto-play) |
| 5 | Taps a POI marker | Bottom sheet opens | `onMarkerPress` event |
| 6 | | Displays POI details in bottom sheet: | |
| | | - POI name (current language) | Text from API |
| | | - Description snippet | JSONB → current lang |
| | | - Main image | Image URL from cache |
| | | - "Nghe thuyết minh" (Listen) button | Audio playback button |
| 7 | (Next: Tap "Listen" button) | → UC3: Play Narration | |

---

### Postconditions
- POI details displayed in bottom sheet
- Ready for user to tap "Listen" button
- Analytics event logged: { action: "TAP", poiId, timestamp }

---

### Alternative Paths

**A1: Tap Same POI Again**
- Bottom sheet already open for same POI
- System updates/refreshes display (or keeps existing)

**A2: Tap Different POI While First open**
- Bottom sheet for new POI replaces previous one
- Analytics event logged for new POI

**A3: Tap on Empty Map Area**
- Bottom sheet closes (if open)
- Map remains displayed

---

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| POI has no audio file | Show message: "Phiên bản âm thanh chưa có" |
| POI description missing in current language | Fallback to Vietnamese or English |
| User denies location permission | Show map, but no blue dot |
| Map tiles (streets) not loaded | Markers still visible (cached data) |

---

### Related Use Cases
- UC3 – Play Narration
- UC4 – Scan QR Code
- UC7 – View Food Tour

---

## UC3 – Play POI Narration (Tap-to-Play)

**Actor**: Foodie  
**Maturity**: Focused  
**Priority**: Critical  
**Constraint**: **Single Voice Rule** – Only one audio plays at a time  

### Summary
User taps "Nghe thuyết minh" (Listen) button in POI details to play pre-recorded audio narration in the selected language. If another audio is playing, it stops immediately.

---

### Preconditions
- POI details bottom sheet is open (UC2)
- Audio file exists for current language
- State Machine is in IDLE or PLAYING state

---

### Basic Flow

| Step | Actor | System | State Machine & Code |
|------|-------|--------|------|
| 1 | Views POI details in bottom sheet | System in IDLE state | audioState = IDLE |
| 2 | Taps "Nghe thuyết minh" button | Dispatch PLAY_EVENT | audioDispatch({ type: 'PLAY_EVENT', poiId }) |
| 3 | | Check if audio already playing | if (currentAudio.poiId !== newPoiId) { stop() } |
| 4 | | Load audio file from local cache | Browser cache / local URL |
| 5 | | Start playback | `new Audio(audioUrl)` + `.play()` |
| 6 | | **Transition State → PLAYING** | audioState = PLAYING |
| 7 | | Display mini player (pause/stop controls) | Mini player UI appears |
| 8 | | Audio plays (narration) | TTS audio plays for 30-60 seconds |
| 9 | Audio finishes | State → IDLE | Playback complete listener |
| 10 | | Close mini player (optional) | UI update |
| 11 | User hears complete narration | | |

---

### Postconditions
- Audio narration has been played
- User heard complete description of POI
- Mini player closed, state = IDLE
- Analytics event logged: { action: "PLAY", poiId, durationMs, language }

---

### Alternative Paths

**A1: User Taps Different POI While Audio Playing**  
(Implements **Single Voice Rule**)

| Step | Actor | System | Code |
|------|-------|--------|------|
| 1 | Audio of POI-1 is playing (45s in) | State = PLAYING, poiId="poi_001" | |
| 2 | User scrolls & taps POI-2 on map | New bottom sheet appears for POI-2 | |
| 3 | User taps "Nghe thuyết minh" | Dispatch PLAY_EVENT(poi_002) | Dispatch new event |
| 4 | | **CRITICAL**: Stop previous audio immediately | `currentSound.stopAsync()` |
| 5 | | Clear playback UI for POI-1 | Mini player disappears |
| 6 | | **Transition → IDLE, then → PLAYING** | State machine atomic transition |
| 7 | | Load & play audio of POI-2 | Play new audio file |
| 8 | | Analytics logged for both: | { poiId: "poi_001", durationMs: 45000 }, then { poiId: "poi_002", action: "PLAY" } |

---

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Audio file corrupted / missing | Show error: "Không thể phát âm thanh" |
| Network disconnected | Show retry / unavailable message |
| Device volume = 0 | Audio plays silently (expected) |
| User locks screen during playback | Audio continues in background / stops if policy set |
| Low battery mode | Audio plays normally (no optimization needed) |
| Multiple taps while loading | Ignore, don't queue multiple plays |

---

### Related Use Cases
- UC6 – Control Audio (Pause/Resume/Stop)
- UC4 – QR Code Scanning (alternative trigger)

---

## UC4 – Scan QR Code for Narration

**Actor**: Foodie  
**Maturity**: Focused  
**Priority**: High  

### Summary
User scans a QR code (physical sticker at food stall) to directly trigger audio narration for that POI without tapping the map. QR also uses the Single Voice Rule.

---

### Preconditions
- QR code exists at physical location (physical sticker with POI ID)
- Camera permission granted
- Current app state = foreground (or resumed)

---

### Basic Flow

| Step | Actor | System | Technical Details |
|------|-------|--------|-------------------|
| 1 | Taps "Scan QR" button in app | Opens camera view | Navigation to QR scanner screen |
| 2 | Points camera at QR sticker | Camera stream active | Browser camera / QR scanner library |
| 3 | QR code scanned | System decodes QR data | Read POI ID from QR: "poi_001" |
| 4 | | Lookup POI via API | `GET /api/v1/pois/poi_001?language=vi` |
| 5 | | **Dispatch PLAY_EVENT** (same as UC3) | Same State Machine logic |
| 6 | | **Apply Single Voice Rule** | Stop any playing audio first |
| 7 | | Navigate to POI narration + play | Show bottom sheet + start audio |
| 8 | | User hears narration | |

---

### Postconditions
- Audio narration playing for scanned POI
- Bottom sheet displayed with POI details
- Analytics event logged: { action: "QR_SCAN", poiId, language }

---

### Alternative Paths

**A1: Invalid QR Code**
- QR data is not format "poi_XXX"
- Show error: "Mã QR không hợp lệ"

**A2: POI Not Found in Local Database**
- POI ID doesn't exist in backend response
- Show error: "Địa điểm không tồn tại"
- Suggest manual sync

---

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| QR code torn/unreadable | Scanner fails, show retry prompt |
| Multiple QR codes visible | Scanner reads first one in focus |
| User cancel QR scanner | Close camera, return to map |
| Audio still playing from previous POI | Stop immediately (Single Voice Rule) |

---

### Related Use Cases
- UC3 – Play Narration
- UC2 – Explore Map

---

## UC5 – Switch Language & Settings

**Actor**: Foodie  
**Maturity**: Focused  
**Priority**: High  

### Summary
User accesses Settings screen to change preferred language. When language is changed, all POI content (text + audio URLs) update accordingly on the map and narration.

---

### Preconditions
- User is authenticated & in main app
- At least 2 languages loaded in database

---

### Basic Flow

| Step | Actor | System | Technical Details |
|------|-------|--------|-------------------|
| 1 | Opens Settings screen | Shows language selector dropdown | UI navigation |
| 2 | Current language highlighted (e.g., "Tiếng Việt") | Displays all available languages | List: VI, EN, KO, JA, FR, DE, ES, PT, RU, ZH, TH, ID, HI, AR, TR |
| 3 | Selects new language (e.g., "한국어") | System checks user tier (Freemium vs Premium) | Account tier verification |
| 4 | | User is Premium: Updates preference state | `zustand` store update + `localStorage` save |
| 5 | | Re-queries API with new language | Fetch all POIs filtered by new language |
| 6 | | Updates map display (names, descriptions) | Re-render POI popup text |
| 7 | | Downloads new audio URLs if not cached | Check backend local static for MP3s |
| 8 | User sees all content in new language | New language active | UI refreshed |
| 9 | Closes Settings | Returns to map | Map shows translated text |

---

### Postconditions
- Language preference saved persistently
- All POI text displayed in selected language
- Audio narrations available in selected language
- Analytics event logged: { action: "LANGUAGE_CHANGE", oldLang: "vi", newLang: "ko" }

---

### Alternative Paths

**A1: Language Audio Not Yet Downloaded**
- Selected language audio files not cached locally
- Show progress: "Tải dữ liệu tiếng..."
- Auto-download MP3s in background from backend local static path
- Once complete, language ready to use

**A2: Network Unavailable, Language Audio Missing**
- Fallback to Vietnamese or English when available
- Show note: "Âm thanh tiếng này chưa sẵn sàng"

**A3: Freemium User Selects Premium Language**
- User with Freemium tier selects a language other than Tiếng Việt (VI) or Tiếng Anh (EN).
- System halts the change and displays an Upgrade Prompt: "Nâng cấp Premium để mở khóa tính năng đa ngôn ngữ."
- Prompts user to proceed to Payment/Redeem page.
- Current language remains unchanged (still EN/VI).

---

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| POI description missing in selected language | Fallback to English, then Vietnamese |
| Audio not available for language | Still show text, disable Listen button |
| Language change while audio playing | Stop current audio, ready new language |

---

### Related Use Cases
- UC3 – Play Narration (language affects audio)

---

## UC6 – Control Audio Playback (Pause/Resume/Stop)

**Actor**: Foodie  
**Maturity**: Focused  
**Priority**: Medium  

### Summary
User controls audio playback via mini player controls: Pause, Resume, Stop.

---

### Preconditions
- Audio is playing (State = PLAYING)
- Mini player controls visible

---

### Basic Flow

| Step | Actor | Action | System Response | State |
|------|-------|--------|-----------------|-------|
| 1 | Audio playing | (Initial) | | PLAYING |
| 2 | Taps **Pause** button | Pause pressed | Call `audio.pause()` | **→ PAUSED** |
| 3 | | Playback halted at current position | Mini player shows Resume button | PAUSED |
| 4 | Taps **Resume** button | Resume pressed | Call `audio.play()` | **→ PLAYING** |
| 5 | | Playback continues from paused position | Mini player shows Pause button | PLAYING |
| 6 | Taps **Stop** button | Stop pressed | Call `audio.pause(); audio.currentTime = 0` | **→ IDLE** |
| 7 | | Playback stops, mini player closes | Map/bottom sheet still visible | IDLE |

---

### Postconditions (per control)

**After Pause**:
- Audio stream paused
- Current playback position saved
- Ready to resume

**After Resume**:
- Audio continues from pause point
- Mini player updates (back to Pause button)

**After Stop**:
- Audio playback completely stopped
- Mini player closed
- State = IDLE
- Analytics logged: { action: "STOP", poiId, durationMs }

---

### Alternative Paths

**A1: User Closes Bottom Sheet While Audio Playing**
- Bottom sheet dismissed (swipe down or back button)
- Audio continues playing (optional: show mini player in notification)
- State remains PLAYING

**A2: User Navigates Away (e.g., opens Settings)**
- Audio may pause depending on app pause handler
- App can resume audio on return (optional)

---

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| User presses Pause twice | Second press ignored (already paused) |
| Resume without Pause (shouldn't happen) | Resume button inactive in PLAYING state |
| Stop clears mini UI | Mini player closes immediately |
| Device memory pressure | Audio unloads if app backgrounded |

---

### Related Use Cases
- UC3 – Play Narration

---

## UC7 – View Food Tour & Exploration

**Actor**: Foodie  
**Maturity**: Focused  
**Priority**: Medium  

### Summary
User selects a predefined food tour (e.g., "Ăn vặt Sinh viên") to explore multiple POIs in a structured sequence. Tour shows ordered POI markers on map.

---

### Preconditions
- User authenticated & at map screen
- Tours loaded from API
- At least 1 tour exists

---

### Basic Flow

| Step | Actor | System | Technical Details |
|------|-------|--------|-------------------|
| 1 | Taps "Tours" tab / menu | Shows list of available tours | UI list of all tours |
| 2 | | Displays: Tour name, image, POI count, duration | From API response |
| 3 | Taps a tour (e.g., "Ăn vặt Sinh viên") | System filters map | tour.poi_ids = ["poi_001", "poi_003", "poi_005"] |
| 4 | | Shows only tour POIs on map with numbers | Markers labeled 1, 2, 3, ... in order |
| 5 | | Highlights tour info (duration, description) | Bottom banner shows tour details |
| 6 | User explores tour | Can tap any POI marker in sequence | POI → bottom sheet → Listen |
| 7 | Taps POI on tour | Same as UC2/UC3 (map + narration) | Normal exploration flow |
| 8 | Completes tour | All POIs visited | Tour completion (optional analytics) |
| 9 | Exits tour | Taps "Exit Tour" or back navigation | Map returns to all POIs |

---

### Postconditions
- User has explored tour POIs
- Analytics events logged for each POI tapped/played
- Tour marked as "visited" (optional tracking)

---

### Alternative Paths

**A1: Tour Changed During Exploration**
- User selects different tour mid-exploration
- Previous tour markers disappear
- New tour POIs displayed

**A2: POI Not Available (Deleted)**
- POI in tour.poi_ids no longer exists
- Skip that POI, show warning
- Continue with remaining tour POIs

---

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Tour has only 1 POI | Still displayed as tour |
| Empty tour (no POIs) | Don't show in tour list |
| Tour duration wrong | Show as estimated (TBD) |

---

### Related Use Cases
- UC2 – Explore Map
- UC3 – Play Narration

---

## UC8 – Network Required Content Access

**Actor**: Foodie  
**Maturity**: Focused  
**Priority**: Medium  

### Summary
User can explore map, view POI details, and listen to narrations while connected to the network. All content is sourced from backend API responses and fetched MP3 URLs.

---

### Preconditions
- User is authenticated (UC1)
- Backend API is reachable
- Browser location permission granted if map position is used

---

### Basic Flow

| Step | Actor | System | Source |
|------|-------|--------|--------|
| 1 | User opens app | Content loads from server | Server → API response |
| 2 | Views map | Map loads and markers render | Leaflet + API query |
| 3 | Sees all POI markers | Markers rendered from API data | pois response |
| 4 | Taps POI | Bottom sheet shows details | API: name, description, image_url |
| 5 | Taps "Listen" | Audio plays from fetched MP3 URL | HTMLAudioElement |
| 6 | | API calls remain available during use | Online-first architecture |
| 7 | User completes exploration | Full functionality while connected | |

---

### Postconditions
- User successfully explored while connected
- Analytics events are sent according to backend policy
- App remains responsive to transient network failures

---

### Alternative Paths

**A1: User Tries to Refresh While Network Is Unavailable**
- Show retry / network unavailable message
- Does not fail hard (graceful degradation)
- Refreshes automatically when connection restored

**A2: Storage Full (Browser Cache or Downloaded Audio)**
- Show warning about storage
- User can clear browser data and reload content

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| POI edited on server, but current session has old data | User sees current session data until refresh |
| New tour added after page load | Appears on next refresh |
| App update while disconnected | Uses current loaded data, updates on next refresh |

---

### Related Use Cases
- UC1 – Authorization & Initial Load (prerequisite)
- UC2 – Map Exploration
- UC3 – Narration Playback

---

## Use Case Summary Table

| UC | Title | Actor | Trigger | Outcome |
|:--|:------|:------|:--------|:---------|
| UC1 | Authorization & Sync | Foodie | App launch | Authorized, content synced |
| UC2 | Explore Map | Foodie | View map | POI marker tapped |
| UC3 | Play Narration | Foodie | Tap "Listen" | Audio plays (Single Voice Rule) |
| UC4 | Scan QR | Foodie | Scan physical QR | Audio triggered for POI |
| UC5 | Switch Language | Foodie | Open Settings | Language changed, text/audio updated |
| UC6 | Control Audio | Foodie | Tap Pause/Resume/Stop | Audio paused/resumed/stopped |
| UC7 | View Tour | Foodie | Select tour | Ordered POI exploration |
| UC8 | Network Required Content Access | Foodie | Open app online | Content accessible from API |

---

## Actor Definition

**Foodie (Primary Actor)**
- Person using web app
- May or may not have internet
- Speaks multiple languages
- Wants to discover food culture via narration
- Uses map interface intuitively

---

## System Boundary

The system includes:
- ✅ Web app (React + TypeScript)
- ✅ Backend API (Node.js)
- ✅ PostgreSQL database
- ✅ Local file storage
- ❌ Admin dashboard (separate system)
- ❌ Payment gateway (external service)

---

## Cross-Cutting Concerns

### Analytics
All major actions logged:
- PLAY, PAUSE, STOP, QR_SCAN
- Sent to analytics API with retry policy

### Online-First
API responses and browser state drive functionality during use

### Single Voice Rule
Only valid for UC3 & UC4 (audio playback)

### Localization
All text/audio dynamic per selected language

---

## References

- SPEC_CANONICAL.md – Canonical rules
- ARCHITECTURE.md – System design
- backend_design.md – API endpoints
- database_design.md – Data schema

# 08. UI and UX

[Back to Index](index.md)

---

## 1. UX Principles

1. Interaction-first: narration starts only after explicit tap or QR scan.
2. Exploration-first: map and POI detail access must remain available while connected.
3. Clarity-first: playback state is always visible and controllable.

## 2. Navigation Structure

1. Auth stack: claim/payment, then initial sync bootstrap.
2. Main tabs: map, tours/explore, settings.
3. QR scanner is reachable from map context.

## 3. Map and POI UX

1. Map shows POIs from backend data.
2. Marker tap opens bottom sheet with image, text, and Listen action.
3. Blue dot indicates user position in foreground mode only.
4. Nearby highlight is visual-only and does not trigger playback.
5. Clicking on the map can simulate a user position for testing; the nearest POI is highlighted with a larger anchor/marker style, but audio still requires explicit Listen or QR.

## 4. Playback UX

1. Mini player appears on active narration.
2. Controls: pause, resume, stop.
3. Transition to new POI playback must immediately stop existing playback.

## 5. Language UX

1. Language selector supports 15 languages.
2. UI and content update consistently after language switch.
3. Content fallback is data-level fallback (requested, English, Vietnamese).

## 6. Network and Error States

1. If network is unavailable, app shows retry / unavailable state.
2. If content fetch fails, app retries gracefully and preserves current UI state.
3. Invalid QR and missing POI show user-safe error without crash.

# Google Cloud TTS Setup

This backend supports two TTS providers:

- `piper` (default)
- `google`

Set provider in `.env`:

```env
TTS_PROVIDER="google"
```

## 1. Install dependency

```bash
npm install
```

## 2. Configure Google credentials

Use one method below.

### Method A: credential file path

```env
GOOGLE_APPLICATION_CREDENTIALS="D:/path/to/service-account.json"
```

### Method B: inline credential JSON

```env
GOOGLE_TTS_CREDENTIALS_JSON="{\"type\":\"service_account\",...}"
```

## 3. Optional voice map

```env
GOOGLE_TTS_VOICE_MAP="{\"en\":\"en-US-Neural2-C\",\"vi\":\"vi-VN-Standard-A\"}"
GOOGLE_TTS_SPEAKING_RATE=1
GOOGLE_TTS_PITCH=0
```

If `GOOGLE_TTS_VOICE_MAP` is empty, backend uses language defaults from `languageCode`.

## 4. Validate config

```bash
npm run tts:validate
```

## 5. Run backend

```bash
npm run dev
```

## Notes

- Audio files are still stored locally via existing `TTS_LOCAL_AUDIO_DIR`.
- Queue mode (`bullmq` or `in-memory`) is unchanged.
- Preview endpoint and POI generation both follow `TTS_PROVIDER`.

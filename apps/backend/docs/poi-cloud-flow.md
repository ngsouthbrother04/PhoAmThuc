# POI Creation and Cloud Upload - Main Functions

Tai lieu nay chi ra cac ham chinh lien quan den:

- Tao POI
- Upload anh POI len cloud (Cloudinary)
- Sinh audio tu text va upload audio len cloud

## 1) Entry points (routes)

### Tao POI

- [src/routes/api/partner.ts](../src/routes/api/partner.ts#L125)
  - `POST /api/v1/partner/pois`
  - Goi `createAdminPoi(...)` de tao POI.
- [src/routes/api/admin.ts](../src/routes/api/admin.ts#L174)
  - `POST /api/v1/admin/pois`
  - Cung goi `createAdminPoi(...)`.

### Upload anh POI

- [src/routes/api/partner.ts](../src/routes/api/partner.ts#L70)
  - `POST /api/v1/partner/pois/:id/image/upload`
  - Goi `uploadPoiImage(poiId, req.file)`.

## 2) Core service for creating POI

### `createAdminPoi(...)`

- Vi tri: [src/services/poiAdminService.ts](../src/services/poiAdminService.ts#L494)
- Vai tro:
  - Validate va normalize input (`name`, `description`, `type`, `lat/lng`, `radius`, `audioUrls`).
  - Tao ban ghi POI trong DB (`pointOfInterest.create`).
  - Neu request khong gui `audioUrls`, he thong se tu dong sinh audio va cap nhat lai `audioUrls`.

### Auto-generate audio after create (when `audioUrls` is empty)

- Vi tri goi: [src/services/poiAdminService.ts](../src/services/poiAdminService.ts#L560)
- Ham duoc goi: `generateMultiLanguageAudioForPoi(...)`

## 3) Core services for cloud upload

### Upload image to Cloudinary

- Ham public: `uploadPoiImage(...)`
  - Vi tri: [src/services/imageService.ts](../src/services/imageService.ts#L227)
  - Vai tro:
    - Kiem tra Cloudinary config (`ensureCloudinaryConfig`).
    - Upload file anh len cloud.
    - Update `pointOfInterest.image` trong DB.
    - Cleanup anh cu tren cloud neu co.

- Ham upload low-level: `uploadImageBufferToCloudinary(...)`
  - Vi tri: [src/services/imageService.ts](../src/services/imageService.ts#L191)
  - Vai tro:
    - Nhan buffer anh tu multer memory.
    - Dung `cloudinary.uploader.upload_stream(...)` de upload.

### Upload audio buffer to Cloudinary

- Ham: `uploadAudioBufferToCloudinary(...)`
  - Vi tri: [src/services/imageService.ts](../src/services/imageService.ts#L307)
  - Vai tro:
    - Nhan `audioBuffer` va upload len folder audio tren Cloudinary.
    - Tra ve `secure_url`.

## 4) Audio generation from text -> upload cloud

### Main entry for POI audio generation

- Ham public: `generateMultiLanguageAudioForPoi(...)`
  - Vi tri: [src/services/poiAudioGenerationService.ts](../src/services/poiAudioGenerationService.ts#L81)
  - Vai tro:
    - Nhan description map theo ngon ngu.
    - Chuan hoa danh sach ngon ngu muc tieu.
    - Goi ham noi bo de synthesize + upload.

### Internal synthesize/upload loop

- Ham noi bo: `generateAndUploadAudio(...)`
  - Vi tri: [src/services/poiAudioGenerationService.ts](../src/services/poiAudioGenerationService.ts#L18)
  - Vai tro moi ngon ngu:
    1. Lay `text` tu `descriptions[language]`
    2. Goi Google TTS: `synthesizeWithGoogleCloud(text, language)`
    3. Upload audio buffer: `uploadAudioBufferToCloudinary(...)`
    4. Ghep ket qua vao `audioUrls[language]`

## 5) Update POI and audio regeneration behavior

### `updateAdminPoi(...)`

- Vi tri: [src/services/poiAdminService.ts](../src/services/poiAdminService.ts#L675)
- Dieu kien regen audio:
  - `shouldRegenerateAudioFromDescription = input.description !== undefined && input.audioUrls === undefined`
  - Vi tri: [src/services/poiAdminService.ts](../src/services/poiAdminService.ts#L775)
- Neu dieu kien dung:
  - Tam xoa `audioUrls` trong update dau tien.
  - Cleanup audio cu tren cloud.
  - Goi `generateMultiLanguageAudioForPoi(...)` de tao audio moi.
  - Update lai `audioUrls` vao DB.

## 6) Ham text-to-audio thu cong (preview)

Neu ban can endpoint nhan text truc tiep de sinh file audio preview:

- Ham: `synthesizePreviewAudioFromText(text, language)`
- Vi tri: [src/services/ttsService.ts](../src/services/ttsService.ts#L428)
- Ham low-level duoc goi ben duoi: `synthesizeWithGoogleCloud(text, language)`
  - Vi tri: [src/services/googleTtsClient.ts](../src/services/googleTtsClient.ts#L142)

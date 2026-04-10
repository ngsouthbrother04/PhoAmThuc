import crypto from "crypto";
import { synthesizeWithGoogleCloud } from "./googleTtsClient";
import { uploadAudioBufferToCloudinary } from "./imageService";
import {
  normalizePoiLanguages,
  POI_TARGET_LANGUAGES,
  type PoiLanguage,
} from "./poiLanguageConfig";

interface AudioUrlsMap {
  [language: string]: string;
}

/**
 * Generate audio for target languages and upload to Cloudinary
 * Generates unique filenames for each audio file
 */
async function generateAndUploadAudio(
  descriptions: Record<string, string>,
  languages: PoiLanguage[],
): Promise<AudioUrlsMap> {
  const audioUrls: AudioUrlsMap = {};
  const randomSuffix = crypto.randomUUID().slice(0, 8);

  try {
    for (const language of languages) {
      const text = String(descriptions[language] ?? "").trim();
      if (!text || !text.trim()) {
        console.warn(`[POI Audio Gen] Skipping ${language}: empty description`);
        continue;
      }

      try {
        // Synthesize audio using Google TTS
        const audioBuffer = await synthesizeWithGoogleCloud(text, language);

        // Create a unique filename for this audio
        const audioFileName = `poi-audio-${language}-${randomSuffix}.wav`;

        // Upload to Cloudinary (using empty poiId since POI not yet created)
        const audioUrl = await uploadAudioBufferToCloudinary(
          "temp",
          "poi",
          audioFileName,
          audioBuffer,
        );

        audioUrls[language] = audioUrl;
        console.log(
          `[POI Audio Gen] Generated and uploaded ${language} audio: ${audioUrl}`,
        );
      } catch (audioError) {
        console.error(
          `[POI Audio Gen] Failed to generate ${language} audio:`,
          audioError instanceof Error ? audioError.message : audioError,
        );
        // Continue with other languages even if one fails
      }
    }

    if (Object.keys(audioUrls).length === 0) {
      throw new Error("AUDIO_GENERATION_FAILED_ALL_LANGUAGES");
    }

    return audioUrls;
  } catch (error) {
    console.error("[POI Audio Gen] Error:", error);
    throw new Error(
      `Failed to generate multi-language audio: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Main entry point for POI audio generation
 * Synthesizes description in multiple languages and uploads to Cloudinary
 * Returns map of language -> audio URL
 */
export async function generateMultiLanguageAudioForPoi(
  descriptions: Record<string, string>,
  targetLanguages: string[] = [...POI_TARGET_LANGUAGES],
): Promise<Record<string, string>> {
  const languages = normalizePoiLanguages(targetLanguages);

  if (languages.length === 0) {
    console.warn("[POI Audio Gen] No supported languages specified");
    return {};
  }

  return generateAndUploadAudio(descriptions, languages);
}

import textToSpeech from "@google-cloud/text-to-speech";

const LANGUAGE_CODE_MAP: Record<string, string> = {
  vi: "vi-VN",
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  pt: "pt-PT",
  ru: "ru-RU",
  zh: "cmn-CN",
  th: "th-TH",
  id: "id-ID",
  hi: "hi-IN",
  ar: "ar-XA",
  tr: "tr-TR",
  ja: "ja-JP",
  ko: "ko-KR",
};

type GoogleTextToSpeechClient = InstanceType<
  typeof textToSpeech.TextToSpeechClient
>;

let client: GoogleTextToSpeechClient | null = null;

function resolveCredentials(): {
  clientOptions?: {
    credentials?: { client_email: string; private_key: string };
  };
} {
  const raw = process.env.GOOGLE_TTS_CREDENTIALS_JSON?.trim();
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const clientEmail =
      typeof parsed.client_email === "string" ? parsed.client_email : "";
    const privateKey =
      typeof parsed.private_key === "string" ? parsed.private_key : "";

    if (!clientEmail || !privateKey) {
      throw new Error("GOOGLE_TTS_CREDENTIALS_JSON_MISSING_FIELDS");
    }

    return {
      clientOptions: {
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
      },
    };
  } catch {
    throw new Error("GOOGLE_TTS_CREDENTIALS_JSON_INVALID");
  }
}

function getClient(): GoogleTextToSpeechClient {
  if (client) {
    return client;
  }

  const { clientOptions } = resolveCredentials();
  client = clientOptions
    ? new textToSpeech.TextToSpeechClient(clientOptions)
    : new textToSpeech.TextToSpeechClient();

  return client;
}

function parseVoiceMap(): Record<string, string> {
  const raw = process.env.GOOGLE_TTS_VOICE_MAP?.trim();
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("GOOGLE_TTS_VOICE_MAP_INVALID");
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof value !== "string") {
        continue;
      }

      const normalizedLang = key.trim().toLowerCase();
      const normalizedVoice = value.trim();
      if (!normalizedLang || !normalizedVoice) {
        continue;
      }

      result[normalizedLang] = normalizedVoice;
    }

    return result;
  } catch {
    throw new Error("GOOGLE_TTS_VOICE_MAP_INVALID_JSON");
  }
}

function resolveLanguageCode(language: string): string {
  const normalized = language.trim().toLowerCase();
  const base = normalized.split("-")[0];

  return LANGUAGE_CODE_MAP[normalized] ?? LANGUAGE_CODE_MAP[base] ?? "en-US";
}

function resolveVoiceName(language: string): string | undefined {
  const voiceMap = parseVoiceMap();
  const normalized = language.trim().toLowerCase();
  const base = normalized.split("-")[0];

  return voiceMap[normalized] ?? voiceMap[base];
}

function getSpeakingRate(): number {
  const raw = Number(process.env.GOOGLE_TTS_SPEAKING_RATE ?? "1");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 1;
  }

  return raw;
}

function getPitch(): number {
  const raw = Number(process.env.GOOGLE_TTS_PITCH ?? "0");
  if (!Number.isFinite(raw)) {
    return 0;
  }

  return raw;
}

export async function synthesizeWithGoogleCloud(
  text: string,
  language: string,
): Promise<Buffer> {
  const ttsClient = getClient();
  const languageCode = resolveLanguageCode(language);
  const voiceName = resolveVoiceName(language);

  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: "LINEAR16",
      speakingRate: getSpeakingRate(),
      pitch: getPitch(),
    },
  });

  const output = response.audioContent;
  if (!output) {
    throw new Error("GOOGLE_TTS_EMPTY_AUDIO");
  }

  return Buffer.isBuffer(output) ? output : Buffer.from(output as Uint8Array);
}

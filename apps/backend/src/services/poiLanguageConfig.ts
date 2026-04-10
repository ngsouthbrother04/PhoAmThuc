export const POI_TARGET_LANGUAGES = [
  "vi",
  "ja",
  "ko",
  "th",
  "zh",
  "en",
] as const;

export type PoiLanguage = (typeof POI_TARGET_LANGUAGES)[number];

const POI_LANGUAGE_ALIAS_MAP: Record<string, PoiLanguage> = {
  vi: "vi",
  vn: "vi",
  vietnamese: "vi",
  ja: "ja",
  jp: "ja",
  japanese: "ja",
  ko: "ko",
  korean: "ko",
  th: "th",
  thai: "th",
  thailand: "th",
  zh: "zh",
  cn: "zh",
  chinese: "zh",
  en: "en",
  english: "en",
};

export function normalizePoiLanguage(
  language: string,
): PoiLanguage | undefined {
  return POI_LANGUAGE_ALIAS_MAP[String(language).trim().toLowerCase()];
}

export function normalizePoiLanguages(languages: string[]): PoiLanguage[] {
  const normalized = languages
    .map((language) => normalizePoiLanguage(language))
    .filter((language): language is PoiLanguage => Boolean(language));

  return Array.from(new Set(normalized));
}

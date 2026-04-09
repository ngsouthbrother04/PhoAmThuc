import { createContext, useContext, useState, useEffect } from "react";
import translations from "../locales/translations";

const LanguageContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const SUPPORTED_LANGUAGES = {
  vi: "Tiếng Việt",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  th: "ไทย",
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem("preferredLanguage");
    if (saved && SUPPORTED_LANGUAGES[saved]) {
      return saved;
    }

    // Fall back to browser language
    const browserLang = (navigator.language || "vi")
      .split("-")[0]
      .toLowerCase();
    if (SUPPORTED_LANGUAGES[browserLang]) {
      return browserLang;
    }

    // Default to Vietnamese
    return "vi";
  });

  // Persist language selection
  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (SUPPORTED_LANGUAGES[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
  const { language } = useLanguage();
  return translations[language] || translations.en;
}

// Extract localized text using selected language
// eslint-disable-next-line react-refresh/only-export-components
export function pickLocalizedText(value, selectedLanguage, fallback = "") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;

  // Try selected language first
  if (value[selectedLanguage]) return value[selectedLanguage];

  // Fall back to common languages
  return (
    value.vi ||
    value.en ||
    value.ja ||
    value.ko ||
    value.zh ||
    value.th ||
    fallback
  );
}

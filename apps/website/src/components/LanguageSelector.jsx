import { useLanguage, SUPPORTED_LANGUAGES } from "../hooks/useLanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe size={18} className="text-slate-600 hidden sm:block" />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-2 sm:px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:border-slate-400 transition focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

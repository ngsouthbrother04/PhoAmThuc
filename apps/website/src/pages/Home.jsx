import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { poisAPI, toursAPI } from "../lib/api";
import {
  useLanguage,
  pickLocalizedText,
  useTranslation,
} from "../hooks/useLanguageContext";

export default function Home() {
  const [rawFeatured, setRawFeatured] = useState({ pois: [], tours: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslation();

  // Normalize featured data based on current language
  const featured = useMemo(
    () => ({
      pois: (rawFeatured.pois || []).map((poi) => ({
        ...poi,
        name: pickLocalizedText(poi.name, language, "Untitled POI"),
        description: pickLocalizedText(poi.description, language, ""),
      })),
      tours: (rawFeatured.tours || []).map((tour) => ({
        ...tour,
        name: pickLocalizedText(tour.name, language, "Untitled Tour"),
        description: pickLocalizedText(tour.description, language, ""),
      })),
    }),
    [rawFeatured, language],
  );

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [pois, tours] = await Promise.all([
          poisAPI.getFeatured(6).catch(() => []),
          toursAPI.getFeatured(4).catch(() => []),
        ]);
        setRawFeatured({ pois: pois || [], tours: tours || [] });
      } catch (err) {
        console.error("Failed to fetch featured content:", err);
        setError("Failed to load featured content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <div className="text-xl text-slate-600">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-orange-500 to-rose-500 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">{t.home.title}</h1>
          <p className="text-xl mb-2">{t.home.subtitle}</p>
          <p className="text-orange-100">{t.home.description}</p>
        </div>
      </div>

      {/* Featured POIs */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          {t.home.featured}
        </h2>
        {featured.pois.length === 0 ? (
          <div className="text-center py-8 text-slate-600">{t.home.error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.pois.map((poi) => (
              <div
                key={poi.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/poi/${poi.id}`)}
              >
                {poi.imageUrl && (
                  <img
                    src={poi.imageUrl}
                    alt={poi.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {poi.name}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                    {poi.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    📍 {poi.address || "Location unknown"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Tours */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          {t.home.tours}
        </h2>
        {featured.tours.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            {t.home.error}
            No featured tours available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featured.tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/tour/${tour.id}`)}
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {tour.name}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-2">
                  {tour.description}
                </p>
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>🚶 {tour.poiIds?.length || 0} stops</span>
                  <span className="text-orange-600 font-semibold">
                    View Tour →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg m-6 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

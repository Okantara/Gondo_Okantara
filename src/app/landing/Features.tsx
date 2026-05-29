import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Leaf, ShieldCheck, Award, MapPin, Sparkles } from "lucide-react";

interface KeunggulanItem {
  id: number;
  title: string;
  subtitle: string;
  gambar: string;
  created_at: string;
}

// Mapping icon berdasarkan title
const iconMap: Record<string, any> = {
  Bergizi: Leaf,
  "Produk Halal": ShieldCheck,
  "Tanpa Pengawet": Award,
  "Tradisional Indonesia": MapPin,
};

export function Features() {
  const [features, setFeatures] = useState<KeunggulanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  async function fetchFeatures() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("keunggulan")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setFeatures(data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal memuat data keunggulan. Silakan refresh halaman.");
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p>Memuat data...</p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block mb-4">
              {error}
            </div>
            <button
              onClick={fetchFeatures}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* DATA */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = iconMap[feature.title] || Sparkles;

              return (
                <div
                  key={feature.id}
                  className="text-center p-6 rounded-2xl bg-linear-to-br from-[#FFF8F0] to-white border border-[#FFE8D6] hover:shadow-lg transition-shadow"
                >
                  {/* IMAGE / ICON */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E31E24] text-white rounded-full mb-4 overflow-hidden mx-auto">
                    {feature.gambar ? (
                      <img
                        src={feature.gambar}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon size={32} />
                    )}
                  </div>

                  {/* CONTENT */}
                  <h3 className="text-xl mb-2 text-gray-900 font-semibold">
                    {feature.title}
                  </h3>

                  <p className="text-lg text-gray-600 leading-7 break-words whitespace-normal max-w-[220px] mx-auto">
                    {feature.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && features.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Belum ada data keunggulan
          </div>
        )}
      </div>
    </section>
  );
}

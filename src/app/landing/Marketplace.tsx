import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface MitraKerja {
  id: number;
  nama: string;
  gambar: string;
  created_at: string;
}

export function Marketplace() {
  const [mitra, setMitra] = useState<MitraKerja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMitra = async () => {
      const { data, error } = await supabase
        .from("mitrakerja")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setMitra(data || []);
      setLoading(false);
    };

    fetchMitra();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Mitra Kerja</h2>

          <p className="mt-3 text-gray-600">
            Mitra yang bekerja sama dengan kami
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : mitra.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada data mitra</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mitra.map((item) => (
              <div
                key={item.id}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#FFF8F0] to-white border border-[#FFE8D6] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-4 flex justify-center">
                  {item.gambar ? (
                    <img
                      src={item.gambar}
                      alt={item.nama}
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#E31E24]"
                    />
                  ) : (
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E31E24] text-white rounded-full">
                      <Building2 size={32} />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {item.nama}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

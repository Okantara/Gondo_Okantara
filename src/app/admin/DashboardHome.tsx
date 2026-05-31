import { useEffect, useState } from "react";
import { ImagePlay, ShoppingBasket, Image, Handshake } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { VisitorStatsComponent } from "./VisitorStats";

export function DashboardHome() {
  const [counts, setCounts] = useState({
    slider: 0,
    produk: 0,
    varian: 0,
    mitra: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);

      const [sliderResult, produkResult, varianResult, mitraResult] =
        await Promise.all([
          supabase.from("slides").select("*", { count: "exact", head: true }),

          supabase.from("katalog").select("*", { count: "exact", head: true }),

          supabase.from("gallery").select("*", { count: "exact", head: true }),

          supabase
            .from("mitrakerja")
            .select("*", { count: "exact", head: true }),
        ]);

      if (sliderResult.error) console.error(sliderResult.error);
      if (produkResult.error) console.error(produkResult.error);
      if (varianResult.error) console.error(varianResult.error);
      if (mitraResult.error) console.error(mitraResult.error);

      setCounts({
        slider: sliderResult.count || 0,
        produk: produkResult.count || 0,
        varian: varianResult.count || 0,
        mitra: mitraResult.count || 0,
      });

      setLoading(false);
    };

    fetchCounts();
  }, []);

  const stats = [
    {
      title: "Image Slider",
      value: counts.slider,
      icon: ImagePlay,
      color: "bg-blue-500",
    },
    {
      title: "Katalog Produk",
      value: counts.produk,
      icon: ShoppingBasket,
      color: "bg-green-500",
    },
    {
      title: "Varian Abon",
      value: counts.varian,
      icon: Image,
      color: "bg-purple-500",
    },
    {
      title: "Mitra Kerja",
      value: counts.mitra,
      icon: Handshake,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang di admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>

                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </div>

                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Data</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Total image slider: {counts.slider}</p>
              <p className="text-sm text-gray-600">
                Data diambil dari tabel image_slider
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">
                Total katalog produk: {counts.produk}
              </p>
              <p className="text-sm text-gray-600">
                Data diambil dari tabel produk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Total varian abon: {counts.varian}</p>
              <p className="text-sm text-gray-600">
                Data diambil dari tabel varian_abon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Total mitra kerja: {counts.mitra}</p>
              <p className="text-sm text-gray-600">
                Data diambil dari tabel mitrakerja
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Stats Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Statistik Pengunjung
        </h2>
        <VisitorStatsComponent />
      </div>
    </div>
  );
}

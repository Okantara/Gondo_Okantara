import { useEffect, useState } from "react";
import {
  ImagePlay,
  ShoppingBasket,
  Image,
  Handshake,
  Home,
  DollarSign,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { VisitorStatsComponent } from "./VisitorStats";

interface PembelianRecord {
  total: number;
  created_at: string;
}

export function DashboardHome() {
  const [counts, setCounts] = useState({
    slider: 0,
    produk: 0,
    varian: 0,
    mitra: 0,
  });

  const [salesStats, setSalesStats] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  const [loading, setLoading] = useState(true);

  const formatRupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        sliderResult,
        produkResult,
        varianResult,
        mitraResult,
        pembelianResult,
      ] = await Promise.all([
        supabase.from("slides").select("*", { count: "exact", head: true }),

        supabase.from("katalog").select("*", { count: "exact", head: true }),

        supabase.from("gallery").select("*", { count: "exact", head: true }),

        supabase.from("mitrakerja").select("*", { count: "exact", head: true }),

        supabase.from("pembelian").select("total, created_at"),
      ]);

      if (sliderResult.error) console.error(sliderResult.error);
      if (produkResult.error) console.error(produkResult.error);
      if (varianResult.error) console.error(varianResult.error);
      if (mitraResult.error) console.error(mitraResult.error);
      if (pembelianResult.error) console.error(pembelianResult.error);

      setCounts({
        slider: sliderResult.count || 0,
        produk: produkResult.count || 0,
        varian: varianResult.count || 0,
        mitra: mitraResult.count || 0,
      });

      const pembelianData = (pembelianResult.data || []) as PembelianRecord[];
      const now = new Date();

      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);

      const startWeek = new Date(now);
      startWeek.setDate(now.getDate() - now.getDay());
      startWeek.setHours(0, 0, 0, 0);

      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startMonth.setHours(0, 0, 0, 0);

      const totalToday = pembelianData
        .filter(
          (item: PembelianRecord) => new Date(item.created_at) >= startToday,
        )
        .reduce(
          (sum: number, item: PembelianRecord) => sum + Number(item.total || 0),
          0,
        );

      const totalWeek = pembelianData
        .filter(
          (item: PembelianRecord) => new Date(item.created_at) >= startWeek,
        )
        .reduce(
          (sum: number, item: PembelianRecord) => sum + Number(item.total || 0),
          0,
        );

      const totalMonth = pembelianData
        .filter(
          (item: PembelianRecord) => new Date(item.created_at) >= startMonth,
        )
        .reduce(
          (sum: number, item: PembelianRecord) => sum + Number(item.total || 0),
          0,
        );

      setSalesStats({
        today: totalToday,
        week: totalWeek,
        month: totalMonth,
      });
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const salesCards = [
    {
      title: "Penjualan Hari Ini",
      value: salesStats.today,
      icon: DollarSign,
      color: "bg-red-500",
    },
    {
      title: "Penjualan Minggu Ini",
      value: salesStats.week,
      icon: CalendarDays,
      color: "bg-indigo-500",
    },
    {
      title: "Penjualan Bulan Ini",
      value: salesStats.month,
      icon: CalendarRange,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Selamat datang di admin dashboard
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow transition hover:shadow-lg"
        >
          <div className="rounded-md bg-blue-500 p-2">
            <Home className="text-white" size={20} />
          </div>

          <div>
            <p className="font-semibold text-gray-900">Home</p>
          </div>
        </a>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">{stat.title}</p>

                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </div>

                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Statistik Penjualan
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {salesCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">{item.title}</p>

                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : formatRupiah(item.value)}
                    </p>
                  </div>

                  <div className={`${item.color} rounded-lg p-3`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Statistik Pengunjung
        </h2>
        <VisitorStatsComponent />
      </div>
    </div>
  );
}

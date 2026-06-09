import { useEffect, useState } from "react";
import { Users, Shield, Lock, Home, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { VisitorStatsComponent } from "../admin/VisitorStats";

interface StatsData {
  totalAdmins: number;
  totalKasirs: number;
  activeUsers: number;
  inactiveUsers: number;
}

export function MasterDashboardHome() {
  const [stats, setStats] = useState<StatsData>({
    totalAdmins: 0,
    totalKasirs: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("role, is_active");

      if (error) {
        console.error("Error fetching profiles:", error);
        return;
      }

      const adminCount =
        profiles?.filter((p) => p.role === "admin").length || 0;
      const kasirCount =
        profiles?.filter((p) => p.role === "kasir").length || 0;
      const activeCount = profiles?.filter((p) => p.is_active).length || 0;
      const inactiveCount = profiles?.filter((p) => !p.is_active).length || 0;

      setStats({
        totalAdmins: adminCount,
        totalKasirs: kasirCount,
        activeUsers: activeCount,
        inactiveUsers: inactiveCount,
      });
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: "Total Admin",
      value: stats.totalAdmins,
      icon: Shield,
      color: "bg-blue-500",
    },
    {
      title: "Total Kasir",
      value: stats.totalKasirs,
      icon: Users,
      color: "bg-orange-500",
    },
    {
      title: "Pengguna Aktif",
      value: stats.activeUsers,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Pengguna Tidak Aktif",
      value: stats.inactiveUsers,
      icon: Lock,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mt-10 text-3xl font-bold text-gray-900">
            Master Dashboard
          </h1>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow transition hover:shadow-lg"
        >
          <div className="rounded-md bg-purple-500 p-2">
            <Home className="text-white" size={20} />
          </div>

          <div>
            <p className="font-semibold text-gray-900">Home</p>
          </div>
        </a>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">{card.title}</p>

                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : card.value}
                  </p>
                </div>

                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
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

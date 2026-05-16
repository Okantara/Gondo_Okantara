import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBasket,
  Image,
  User,
  ImagePlay,
  Handshake,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/slides", icon: ImagePlay, label: "Image Slides" },
  { path: "/admin/Katalog", icon: Image, label: "Katalog Produk" },
  { path: "/admin/Galerry", icon: ShoppingBasket, label: "Varian Abon" },
  { path: "/admin/MitraPage", icon: Handshake, label: "Mitra Kerja" },
  { path: "/admin/profile", icon: User, label: "Profil" },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 menit

  useEffect(() => {
    const checkSession = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const loginTime = localStorage.getItem("loginTime");

      if (!isAuthenticated || !loginTime) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const now = Date.now();
      const elapsed = now - parseInt(loginTime);

      if (elapsed > SESSION_TIMEOUT) {
        alert("Session Anda telah habis (15 menit idle).");

        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("loginTime");

        navigate("/admin/login", { replace: true });
      }
    };

    // cek saat pertama load
    checkSession();

    // cek tiap 1 menit
    const interval = setInterval(checkSession, 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  // ✅ AUTO REFRESH SESSION (IDLE DETECTION)
  useEffect(() => {
    const refreshSession = () => {
      localStorage.setItem("loginTime", Date.now().toString());
    };

    window.addEventListener("click", refreshSession);
    window.addEventListener("keypress", refreshSession);
    window.addEventListener("mousemove", refreshSession);

    return () => {
      window.removeEventListener("click", refreshSession);
      window.removeEventListener("keypress", refreshSession);
      window.removeEventListener("mousemove", refreshSession);
    };
  }, []);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("loginTime");

      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-8 px-3">
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Kelola toko Anda</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBasket,
  Image,
  User,
  ImagePlay,
  Handshake,
  Feather,
  Menu,
  X,
  LogOut,
  CreditCard,
  // Lock,
  Users,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { path: "/master", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/master/admin-management", icon: Users, label: "Kelola Admin" },
  { path: "/master/kasir-management", icon: Users, label: "Kelola Kasir" },
  { path: "/master/slides", icon: ImagePlay, label: "Image Slides" },
  { path: "/master/Katalog", icon: Image, label: "Katalog Produk" },
  { path: "/master/Galerry", icon: ShoppingBasket, label: "Varian Produk" },
  { path: "/master/MitraPage", icon: Handshake, label: "Data Mitra" },
  { path: "/master/mitra-management", icon: Handshake, label: "Kelola Mitra" },
  { path: "/master/kasir-tempat", icon: Users, label: "Karyawan & Wilayah" },
  { path: "/master/profile", icon: User, label: "Profil Toko" },
  {
    path: "/master/keunggulan-produk",
    icon: Feather,
    label: "Keunggulan Produk",
  },
  {
    path: "/master/metode-pembayaran",
    icon: CreditCard,
    label: "Metode Pembayaran",
  },
  {
    path: "/master/arsip-nota",
    icon: FileText,
    label: "Arsip Nota Penjualan",
  },
  {
    path: "/master/rekap-penjualan",
    icon: BarChart3,
    label: "Rekap Penjualan",
  },
  // {
  //   path: "/master/password-management",
  //   icon: Lock,
  //   label: "Manajemen Password",
  // },
];

export function MasterDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      try {
        await signOut();
        navigate("/master/login", { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
        alert("Gagal logout");
      }
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
            <h1 className="text-2xl font-bold text-purple-800">
              Master Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Kelola sistem</p>
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
                      ? "bg-purple-50 text-purple-600"
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

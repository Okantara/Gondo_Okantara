import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

interface KasirNavbarProps {
  title?: string;
}

export function KasirNavbar({
  title = "Kasir - Order Produk",
}: KasirNavbarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      try {
        await signOut();
        navigate("/kasir/login", { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
        alert("Gagal logout");
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center ">
        <h1 className="text-xl font-bold text-gray-900 px-12">{title}</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Menu, X, Store, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import LogoPakGondo from "../../assets/Logo_Pak_Gondo.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Tentukan path kasir berdasarkan login status
  const kasirPath =
    user && profile?.role === "kasir" ? "/kasir" : "/kasir/login";

  const menuItems = [
    { name: "Beranda", path: "/" },
    { name: "Katalog", path: "/katalog" },
    { name: "Varian Abon", path: "/gallery" },
    { name: "Mitra Kerja", path: "/mitra-kerja" },
    { name: "Gabung Mitra", path: "/gabung-mitra" },
    { name: "Kasir", path: kasirPath, icon: true },
  ];

  const handleLogoClick = () => {
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white ${
        isScrolled
          ? "bg-white shadow-md py-3 backdrop-blur-sm"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* LOGO */}
        <button onClick={handleLogoClick} className="cursor-pointer">
          <img
            src={LogoPakGondo}
            alt="Pak Gondo Logo"
            className="h-10 object-contain"
          />
        </button>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 font-medium text-black">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="hover:text-orange-500 transition-colors"
            >
              {item.icon ? <Store size={22} /> : item.name}
            </Link>
          ))}

          {/* LOGOUT BUTTON - Hanya tampil jika user login */}
          {user && profile && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="text-sm">Logout</span>
            </button>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md px-4 py-4 flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-orange-500 transition-colors"
            >
              {item.icon ? <Store size={22} /> : item.name}
            </Link>
          ))}

          {/* LOGOUT BUTTON - Hanya tampil jika user login */}
          {user && profile && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors w-full"
            >
              <LogOut size={20} />
              <span className="text-sm">Logout</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

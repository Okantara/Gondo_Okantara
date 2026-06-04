import { useState, useEffect } from "react";
import { Menu, X, Store, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../../lib/supabase";

import LogoPakGondo from "../../assets/Logo_Pak_Gondo.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(LogoPakGondo);

  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // AMBIL LOGO DARI DATABASE
  useEffect(() => {
    const fetchLogo = async () => {
      const { data, error } = await supabase
        .from("profile_data")
        .select("logo")
        .limit(1)
        .single();

      if (!error && data?.logo) {
        setLogoUrl(data.logo);
      } else {
        setLogoUrl(LogoPakGondo);
      }
    };

    fetchLogo();
  }, []);

  const kasirPath =
    user && profile?.role === "kasir" ? "/kasir" : "/kasir/login";

  const menuItems = [
    { name: "Beranda", path: "/" },
    { name: "Katalog", path: "/katalog" },
    { name: "Varian Produk", path: "/gallery" },
    { name: "Mitra Kerja", path: "/mitra-kerja" },
    { name: "Gabung Mitra", path: "/gabung-mitra" },
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
        <div className="flex items-center gap-3">
          <Link
            to={kasirPath}
            className="flex items-center gap-2 hover:text-orange-500 transition-colors"
          >
            <Store size={22} />
          </Link>
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

          {/* LOGO */}
          <button onClick={handleLogoClick} className="cursor-pointer">
            <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
          </button>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 font-medium text-black">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="hover:text-orange-500 transition-colors"
            >
              {item.name}
            </Link>
          ))}
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
          <Link
            to={kasirPath}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 hover:text-orange-500 transition-colors"
          >
            <Store size={22} />
            <span>Kasir</span>
          </Link>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-orange-500 transition-colors"
            >
              {item.name}
            </Link>
          ))}

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

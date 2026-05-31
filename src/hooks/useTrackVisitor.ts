import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackVisitor } from "@/lib/trackVisitor";

export function useTrackVisitor() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    // Hanya track halaman landing, jangan track admin dan kasir
    const isAdminPage = pathname.startsWith("/admin");
    const isKasirPage = pathname.startsWith("/kasir");
    const isLoginPage = pathname.includes("/login");

    if (!isAdminPage && !isKasirPage && !isLoginPage) {
      const pageName = pathname || "home";
      trackVisitor(pageName);
    }
  }, [location.pathname]);
}

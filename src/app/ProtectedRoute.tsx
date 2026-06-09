import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  requiredRole?: "admin" | "kasir" | "master";
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading, signOut } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Set timeout 15 detik untuk loading
    const timeout = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    // Jangan redirect saat loading
    if (loading) return;

    // Jika tidak ada user, redirect ke login sesuai role yang dibutuhkan
    if (!user || !profile) {
      const loginPath =
        requiredRole === "kasir"
          ? "/kasir/login"
          : requiredRole === "master"
            ? "/master/login"
            : "/admin/login";
      navigate(loginPath, { replace: true });
      return;
    }

    // Validasi role - STRICT CHECK
    // Jika ada role requirement, user HARUS memiliki role yang tepat
    if (requiredRole && profile.role !== requiredRole) {
      // Jika user mencoba akses area dengan role berbeda, logout dan redirect ke login
      const handleMismatch = async () => {
        try {
          await signOut();
        } catch (err) {
          console.error("Logout error:", err);
        }

        // Redirect ke login page yang sesuai dengan role user
        let loginPath = "/admin/login";
        if (profile.role === "kasir") loginPath = "/kasir/login";
        else if (profile.role === "master") loginPath = "/master/login";

        navigate(loginPath, { replace: true });
      };

      handleMismatch();
      return;
    }

    // Jika akun tidak aktif, redirect ke login
    if (!profile.is_active) {
      let loginPath = "/admin/login";
      if (profile.role === "kasir") loginPath = "/kasir/login";
      else if (profile.role === "master") loginPath = "/master/login";

      navigate(loginPath, { replace: true });
      return;
    }
  }, [user, profile, loading, navigate, requiredRole, location, signOut]);

  // Saat loading, tampilkan loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          {loadingTimeout && (
            <div className="mt-4">
              <p className="text-red-600 text-sm mb-2">Loading lama...</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Halaman
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Jika user dan profile ada dan role sesuai, render outlet
  if (user && profile && (!requiredRole || profile.role === requiredRole)) {
    return <Outlet />;
  }

  // Fallback (seharusnya tidak sampai sini karena sudah redirect di useEffect)
  return null;
}

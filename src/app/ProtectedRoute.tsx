import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  requiredRole?: "admin" | "kasir";
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
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
        requiredRole === "kasir" ? "/kasir/login" : "/admin/login";
      navigate(loginPath, { replace: true });
      return;
    }

    // Jika ada role requirement, cek apakah user memiliki role yang tepat
    if (requiredRole && profile.role !== requiredRole) {
      // Redirect ke halaman login yang sesuai dengan role user
      const loginPath =
        profile.role === "kasir" ? "/kasir/login" : "/admin/login";
      navigate(loginPath, { replace: true });
      return;
    }

    // Jika akun tidak aktif, logout
    if (!profile.is_active) {
      navigate("/admin/login", { replace: true });
      return;
    }
  }, [user, profile, loading, navigate, requiredRole]);

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

  // Jika user dan profile ada, render outlet
  if (user && profile) {
    return <Outlet />;
  }

  // Fallback (seharusnya tidak sampai sini karena sudah redirect di useEffect)
  return null;
}

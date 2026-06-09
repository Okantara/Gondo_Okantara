import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LogoPakGondo from "../../assets/Logo_Pak_Gondo.png";

interface UnifiedLoginPageProps {
  mode: "admin" | "kasir" | "master" | "auto";
}

export function UnifiedLoginPage({ mode }: UnifiedLoginPageProps) {
  const navigate = useNavigate();
  const { signIn, user, profile, signOut } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Jika sudah login dengan role yang sesuai, redirect ke dashboard
  useEffect(() => {
    if (user && profile) {
      // Jika mode adalah admin dan user adalah admin, redirect ke admin
      if (mode === "admin" && profile.role === "admin") {
        navigate("/admin", { replace: true });
      }
      // Jika mode adalah kasir dan user adalah kasir, redirect ke kasir
      else if (mode === "kasir" && profile.role === "kasir") {
        navigate("/kasir/order", { replace: true });
      }
      // Jika mode adalah master dan user adalah master, redirect ke master
      else if (mode === "master" && profile.role === "master") {
        navigate("/master", { replace: true });
      }
      // Jika mode adalah auto, redirect ke dashboard sesuai role
      else if (mode === "auto") {
        if (profile.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (profile.role === "kasir") {
          navigate("/kasir", { replace: true });
        } else if (profile.role === "master") {
          navigate("/master", { replace: true });
        }
      }
      // Jika sudah login tapi role tidak sesuai dengan mode, tampilkan pesan
      // (user akan diminta logout di handleSubmit)
    }
  }, [user, profile, navigate, mode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Jika sudah ada session dengan role berbeda, minta konfirmasi
      if (user && profile) {
        const targetRole =
          mode === "admin"
            ? "admin"
            : mode === "kasir"
              ? "kasir"
              : mode === "master"
                ? "master"
                : profile.role;

        if (profile.role !== targetRole) {
          const confirmed = window.confirm(
            `Anda sudah login sebagai ${profile.role}. Apakah Anda ingin logout dan login sebagai ${targetRole}?`,
          );

          if (!confirmed) {
            setIsLoading(false);
            return;
          }

          // Logout session sebelumnya
          try {
            await signOut();
          } catch (logoutErr) {
            console.error("Logout error:", logoutErr);
          }
        }
      }

      const newProfile = await signIn(formData.username, formData.password);

      // Validasi role berdasarkan mode login
      if (mode === "admin" && newProfile.role !== "admin") {
        throw new Error(
          "Akun ini bukan admin. Silakan login dengan akun admin.",
        );
      }

      if (mode === "kasir" && newProfile.role !== "kasir") {
        throw new Error(
          "Akun ini bukan kasir. Silakan login dengan akun kasir.",
        );
      }

      if (mode === "master" && newProfile.role !== "master") {
        throw new Error(
          "Akun ini bukan master. Silakan login dengan akun master.",
        );
      }

      // Redirect berdasarkan role user
      if (newProfile.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (newProfile.role === "kasir") {
        navigate("/kasir", { replace: true });
      } else if (newProfile.role === "master") {
        navigate("/master", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminMode = mode === "admin";
  const isKasirMode = mode === "kasir";
  const isMasterMode = mode === "master";
  const bgColor = isAdminMode
    ? "from-blue-50 to-blue-100"
    : isMasterMode
      ? "from-purple-50 to-purple-100"
      : "from-orange-50 to-orange-100";
  const headerColor = isAdminMode
    ? "from-blue-600 to-blue-700"
    : isMasterMode
      ? "from-purple-600 to-purple-700"
      : "from-orange-600 to-orange-700";
  const ringColor = isAdminMode
    ? "focus:ring-blue-500"
    : isMasterMode
      ? "focus:ring-purple-500"
      : "focus:ring-orange-500";
  const buttonColor = isAdminMode
    ? "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
    : isMasterMode
      ? "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
      : "from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800";
  const title = isAdminMode
    ? "Login Admin"
    : isMasterMode
      ? "Login Master"
      : isKasirMode
        ? "Login Kasir"
        : "Login";
  const subtitle = isAdminMode
    ? "Silakan login untuk mengakses dashboard admin"
    : isMasterMode
      ? "Silakan login untuk mengakses panel master"
      : isKasirMode
        ? ""
        : "Silakan login untuk melanjutkan";

  return (
    <div
      className={`min-h-screen bg-linear-to-br ${bgColor} flex items-center justify-center p-4`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* HEADER */}
        <div className={`bg-linear-to-br ${headerColor} p-8 text-center`}>
          <div className="flex justify-center mb-4">
            <img
              src={LogoPakGondo}
              alt="Logo Pak Gondo"
              className="w-32 h-auto"
            />
          </div>

          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p
            className={`mt-2 ${isAdminMode ? "text-blue-100" : "text-orange-100"}`}
          >
            {subtitle}
          </p>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* USERNAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value,
                    })
                  }
                  className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-linear-to-br ${buttonColor} text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 ${ringColor} focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading
                ? "Memproses..."
                : `Login ${isAdminMode ? "Admin" : isKasirMode ? "Kasir" : ""}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

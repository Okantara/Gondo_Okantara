import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserAccount {
  id: string;
  email: string;
  user_role: string;
  created_at: string;
}

export function PasswordManagementPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get users from profiles table
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, email, user_role, created_at")
        .neq("user_role", null);

      if (fetchError) {
        setError(
          "Gagal memuat data akun. Pastikan RLS policy sudah dikonfigurasi: " +
            fetchError.message,
        );
        console.error(fetchError);
        setAccounts([]);
        return;
      }

      setAccounts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat akun");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (userId: string, userEmail: string) => {
    try {
      setError(null);
      setSuccess(null);

      // Validasi
      if (!newPassword || !confirmPassword) {
        setError("Password baru dan konfirmasi harus diisi");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Password tidak cocok");
        return;
      }

      if (newPassword.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Session tidak ditemukan. Silakan login kembali.");
        return;
      }

      // Call edge function untuk update password
      const { error: updateError } = await supabase.functions.invoke(
        "update-user-password",
        {
          body: {
            userId,
            newPassword,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (updateError) {
        throw updateError;
      }

      setSuccess(`Password untuk ${userEmail} berhasil diperbarui`);
      setEditingId(null);
      setNewPassword("");
      setConfirmPassword("");

      // Reset success message setelah 3 detik
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memperbarui password",
      );
      console.error(err);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Password</h1>
        <p className="text-gray-600 mt-2">
          Kelola password akun admin dan kasir
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle
            className="text-green-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <p className="font-semibold text-green-900">Sukses</p>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Lock className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-gray-600">Tidak ada akun yang ditemukan</p>
            <p className="text-sm text-gray-500 mt-2">
              Pastikan RLS policy sudah dikonfigurasi di tabel profiles. Lihat
              file SETUP_PASSWORD_MANAGEMENT.md untuk panduan lengkap.
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{account.email}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Role:{" "}
                    <span
                      className={`font-medium ${
                        account.user_role === "admin"
                          ? "text-blue-600"
                          : "text-purple-600"
                      }`}
                    >
                      {account.user_role === "admin" ? "Admin" : "Kasir"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dibuat:{" "}
                    {new Date(account.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    account.user_role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {account.user_role === "admin" ? "Admin" : "Kasir"}
                </span>
              </div>

              {/* Edit Password Form */}
              {editingId === account.id ? (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword[account.id] ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(account.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword[account.id] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        type={
                          showPassword[`${account.id}-confirm`]
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi password baru"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility(`${account.id}-confirm`)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword[`${account.id}-confirm`] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() =>
                        handleUpdatePassword(account.id, account.email)
                      }
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Simpan Password
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingId(account.id)}
                  className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  Ubah Password
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Catatan:</span> Untuk menggunakan
          fitur ini, pastikan:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>RLS policy sudah dikonfigurasi di tabel profiles</li>
            <li>Edge Function "update-user-password" sudah dibuat</li>
            <li>Password minimal 6 karakter</li>
          </ul>
        </p>
      </div>
    </div>
  );
}

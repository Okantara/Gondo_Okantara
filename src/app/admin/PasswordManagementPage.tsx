import { useEffect, useState } from "react";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserAccount {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function PasswordManagementPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .in("role", ["admin", "kasir"])
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("FETCH ACCOUNTS ERROR:", fetchError);
        setError("Gagal memuat data akun: " + fetchError.message);
        setAccounts([]);
        return;
      }

      setAccounts(data || []);
    } catch (err) {
      console.error("FETCH ACCOUNTS ERROR:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat akun");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (userId: string, userEmail: string) => {
    try {
      setError(null);
      setSuccess(null);

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

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("Session tidak ditemukan. Silakan login kembali.");
        return;
      }

      console.log("LOGIN USER ID:", session.user.id);
      console.log("LOGIN EMAIL:", session.user.email);

      setSaving(true);

      const response = await fetch(
        "https://xnxczlhkwqftylxdmxeh.supabase.co/functions/v1/update-user-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "updatePassword",
            userId,
            newPassword,
          }),
        },
      );

      const result = await response.json();

      console.log("STATUS:", response.status);
      console.log("RESULT:", result);

      if (!response.ok) {
        setError(
          result.error ||
            result.detail ||
            result.message ||
            "Gagal memperbarui password",
        );
        return;
      }

      setSuccess(
        result.message || `Password untuk ${userEmail} berhasil diperbarui`,
      );

      setEditingId(null);
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("UPDATE PASSWORD ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memperbarui password",
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />

        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-20 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 mt-10">
        <h1 className="text-3xl font-bold text-gray-900">User Password</h1>
      </div>

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

      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Lock className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-gray-600">Tidak ada akun yang ditemukan</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{account.role}</p>

                  <p className="text-sm text-gray-600 mt-1">
                    User:{" "}
                    <span
                      className={`font-medium ${
                        account.role === "admin"
                          ? "text-blue-600"
                          : "text-purple-600"
                      }`}
                    >
                      {account.role === "admin" ? "Admin" : "Kasir"}
                    </span>
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Dibuat:{" "}
                    {account.created_at
                      ? new Date(account.created_at).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    account.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {account.role === "admin" ? "Admin" : "Kasir"}
                </span>
              </div>

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
                      ></button>
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
                      ></button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePassword(account.id, account.email)
                      }
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? "Menyimpan..." : "Simpan Password"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(account.id);
                    setNewPassword("");
                    setConfirmPassword("");
                    setError(null);
                    setSuccess(null);
                  }}
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
    </div>
  );
}

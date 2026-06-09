import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ToggleRight,
  Pencil,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    is_active: true,
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const keyword = searchTerm.toLowerCase();

    const filtered = admins.filter(
      (admin) =>
        admin.username.toLowerCase().includes(keyword) ||
        admin.email.toLowerCase().includes(keyword),
    );

    setFilteredAdmins(filtered);
  }, [searchTerm, admins]);

  const callUserFunction = async (body: Record<string, unknown>) => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const token = sessionData.session?.access_token;

    if (!token) {
      throw new Error("Session tidak ditemukan. Silakan login ulang.");
    }

    const { data, error } = await supabase.functions.invoke(
      "update-user-password",
      {
        body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (error) {
      throw error;
    }

    return data;
  };

  const fetchAdmins = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, is_active, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data admin:", error);
      alert("Gagal mengambil data admin");
    } else {
      setAdmins(data || []);
      setFilteredAdmins(data || []);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      is_active: true,
    });
    setEditingAdmin(null);
    setShowPassword(false);
    setShowModal(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setForm({
      username: admin.username,
      email: admin.email,
      password: "",
      is_active: admin.is_active,
    });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      alert("Username dan email wajib diisi");
      return;
    }

    if (!editingAdmin && !form.password.trim()) {
      alert("Password wajib diisi untuk admin baru");
      return;
    }

    if (form.password && form.password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    setSaving(true);

    try {
      if (editingAdmin) {
        await callUserFunction({
          action: "update",
          userId: editingAdmin.id,
          username: form.username,
          email: form.email,
          is_active: form.is_active,
        });

        if (form.password.trim()) {
          await callUserFunction({
            action: "updatePassword",
            userId: editingAdmin.id,
            newPassword: form.password,
          });
        }

        alert("Admin berhasil diubah");
      } else {
        await callUserFunction({
          action: "create",
          username: form.username,
          email: form.email,
          password: form.password,
          role: "admin",
          is_active: form.is_active,
        });

        alert("Admin berhasil ditambahkan");
      }

      resetForm();
      fetchAdmins();
    } catch (error) {
      console.error("Gagal menyimpan data admin:", error);
      alert("Gagal menyimpan data admin. Pastikan akun login adalah master.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      await callUserFunction({
        action: "updateStatus",
        userId: adminId,
        is_active: !currentStatus,
      });

      fetchAdmins();
    } catch (error) {
      console.error("Gagal mengubah status admin:", error);
      alert("Gagal mengubah status admin");
    }
  };

  const deleteAdmin = async (adminId: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus admin ini?");
    if (!confirmDelete) return;

    try {
      await callUserFunction({
        action: "delete",
        userId: adminId,
      });

      alert("Admin berhasil dihapus");
      fetchAdmins();
    } catch (error) {
      console.error("Gagal menghapus admin:", error);
      alert("Gagal menghapus admin");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="mt-10 text-3xl font-bold text-gray-900">
              Manajemen Admin
            </h1>
            <p className="mt-2 text-gray-600">Kelola akun admin sistem</p>
          </div>

          <Button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} />
            Tambah Admin
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Search size={20} className="text-gray-500" />
          <Input
            placeholder="Cari username atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    Tidak ada admin ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.username}
                    </TableCell>

                    <TableCell>{admin.email}</TableCell>

                    <TableCell>{formatDate(admin.created_at)}</TableCell>

                    <TableCell>
                      {admin.is_active ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={18} />
                          <span className="text-sm">Aktif</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle size={18} />
                          <span className="text-sm">Tidak Aktif</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            toggleAdminStatus(admin.id, admin.is_active)
                          }
                          className="inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-200"
                        >
                          <ToggleRight size={16} />
                          Status
                        </button>

                        <button
                          onClick={() => openEditModal(admin)}
                          className="inline-flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 transition hover:bg-blue-200"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="inline-flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-sm text-red-700 transition hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="font-medium text-gray-700">
          Total Admin:{" "}
          <span className="font-bold text-blue-600">{admins.length}</span>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Aktif: {admins.filter((a) => a.is_active).length} | Tidak Aktif:{" "}
          {admins.filter((a) => !a.is_active).length}
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingAdmin ? "Edit Admin" : "Tambah Admin"}
              </h2>

              <button onClick={resetForm}>
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />

              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    editingAdmin
                      ? "Password baru, kosongkan jika tidak diganti"
                      : "Password"
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <select
                value={form.is_active ? "true" : "false"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active: e.target.value === "true",
                  })
                }
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Batal
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

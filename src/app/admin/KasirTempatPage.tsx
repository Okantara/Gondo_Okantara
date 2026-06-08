import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle, Circle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

interface MasterKasir {
  id: number;
  nama_kasir: string;
  status: boolean;
  created_at: string;
}

interface TempatPenjualan {
  id: number;
  nama_tempat: string;
  status: boolean;
  created_at: string;
}

export function KasirTempatPage() {
  // State for Master Kasir
  const [kasirData, setKasirData] = useState<MasterKasir[]>([]);
  const [kasirLoading, setKasirLoading] = useState(true);
  const [kasirDialogOpen, setKasirDialogOpen] = useState(false);
  const [kasirEditingId, setKasirEditingId] = useState<number | null>(null);
  const [kasirFormData, setKasirFormData] = useState({
    nama_kasir: "",
    status: true,
  });

  // State for Tempat Penjualan
  const [tempatData, setTempatData] = useState<TempatPenjualan[]>([]);
  const [tempatLoading, setTempatLoading] = useState(true);
  const [tempatDialogOpen, setTempatDialogOpen] = useState(false);
  const [tempatEditingId, setTempatEditingId] = useState<number | null>(null);
  const [tempatFormData, setTempatFormData] = useState({
    nama_tempat: "",
    status: true,
  });

  useEffect(() => {
    fetchKasirData();
    fetchTempatData();
  }, []);

  // ==================== KASIR FUNCTIONS ====================
  const fetchKasirData = async () => {
    try {
      setKasirLoading(true);
      const { data: result, error } = await supabase
        .from("master_kasir")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKasirData(result || []);
    } catch (error) {
      console.error("Error fetching kasir data:", error);
      alert("Gagal mengambil data kasir");
    } finally {
      setKasirLoading(false);
    }
  };

  const handleKasirOpenDialog = (item?: MasterKasir) => {
    if (item) {
      setKasirEditingId(item.id);
      setKasirFormData({
        nama_kasir: item.nama_kasir,
        status: item.status,
      });
    } else {
      setKasirEditingId(null);
      setKasirFormData({
        nama_kasir: "",
        status: true,
      });
    }
    setKasirDialogOpen(true);
  };

  const handleKasirSave = async () => {
    if (!kasirFormData.nama_kasir.trim()) {
      alert("Nama kasir tidak boleh kosong");
      return;
    }

    try {
      if (kasirEditingId) {
        const { error } = await supabase
          .from("master_kasir")
          .update(kasirFormData)
          .eq("id", kasirEditingId);

        if (error) throw error;
        alert("Data kasir berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from("master_kasir")
          .insert([kasirFormData]);

        if (error) throw error;
        alert("Data kasir berhasil ditambahkan");
      }

      setKasirDialogOpen(false);
      fetchKasirData();
    } catch (error) {
      console.error("Error saving kasir:", error);
      alert("Gagal menyimpan data kasir");
    }
  };

  const handleKasirDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kasir ini?")) {
      try {
        const { error } = await supabase
          .from("master_kasir")
          .delete()
          .eq("id", id);

        if (error) throw error;
        alert("Kasir berhasil dihapus");
        fetchKasirData();
      } catch (error) {
        console.error("Error deleting kasir:", error);
        alert("Gagal menghapus kasir");
      }
    }
  };

  const handleKasirStatusChange = async (id: number, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("master_kasir")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      fetchKasirData();
    } catch (error) {
      console.error("Error updating kasir status:", error);
      alert("Gagal mengubah status kasir");
    }
  };

  // ==================== TEMPAT PENJUALAN FUNCTIONS ====================
  const fetchTempatData = async () => {
    try {
      setTempatLoading(true);
      const { data: result, error } = await supabase
        .from("tempat_penjualan")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTempatData(result || []);
    } catch (error) {
      console.error("Error fetching tempat data:", error);
      alert("Gagal mengambil data tempat penjualan");
    } finally {
      setTempatLoading(false);
    }
  };

  const handleTempatOpenDialog = (item?: TempatPenjualan) => {
    if (item) {
      setTempatEditingId(item.id);
      setTempatFormData({
        nama_tempat: item.nama_tempat,
        status: item.status,
      });
    } else {
      setTempatEditingId(null);
      setTempatFormData({
        nama_tempat: "",
        status: true,
      });
    }
    setTempatDialogOpen(true);
  };

  const handleTempatSave = async () => {
    if (!tempatFormData.nama_tempat.trim()) {
      alert("Nama tempat tidak boleh kosong");
      return;
    }

    try {
      if (tempatEditingId) {
        const { error } = await supabase
          .from("tempat_penjualan")
          .update(tempatFormData)
          .eq("id", tempatEditingId);

        if (error) throw error;
        alert("Data tempat berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from("tempat_penjualan")
          .insert([tempatFormData]);

        if (error) throw error;
        alert("Data tempat berhasil ditambahkan");
      }

      setTempatDialogOpen(false);
      fetchTempatData();
    } catch (error) {
      console.error("Error saving tempat:", error);
      alert("Gagal menyimpan data tempat");
    }
  };

  const handleTempatDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus tempat penjualan ini?")) {
      try {
        const { error } = await supabase
          .from("tempat_penjualan")
          .delete()
          .eq("id", id);

        if (error) throw error;
        alert("Tempat penjualan berhasil dihapus");
        fetchTempatData();
      } catch (error) {
        console.error("Error deleting tempat:", error);
        alert("Gagal menghapus tempat penjualan");
      }
    }
  };

  const handleTempatStatusChange = async (id: number, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tempat_penjualan")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      fetchTempatData();
    } catch (error) {
      console.error("Error updating tempat status:", error);
      alert("Gagal mengubah status tempat");
    }
  };

  return (
    <div>
      <div className="mb-8 mt-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Manajemen Kasir & Tempat Penjualan
        </h1>
      </div>

      <Tabs defaultValue="kasir" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="kasir">Master Kasir</TabsTrigger>
          <TabsTrigger value="tempat">Tempat Penjualan</TabsTrigger>
        </TabsList>

        {/* ==================== TAB MASTER KASIR ==================== */}
        <TabsContent value="kasir" className="mt-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Master Kasir</h2>
              <p className="mt-1 text-gray-600">
                Kelola data kasir/petugas penjualan Anda
              </p>
            </div>

            <Button
              onClick={() => handleKasirOpenDialog()}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <Plus size={20} />
              Tambah Kasir
            </Button>
          </div>

          {kasirLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : kasirData.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <p className="text-gray-500">Belum ada data kasir</p>
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama Kasir
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tanggal Dibuat
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {kasirData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.nama_kasir}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() =>
                            handleKasirStatusChange(item.id, !item.status)
                          }
                          className="flex items-center gap-2"
                        >
                          {item.status ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <Circle className="text-gray-300" size={20} />
                          )}
                          <span
                            className={
                              item.status ? "text-green-600" : "text-gray-500"
                            }
                          >
                            {item.status ? "Aktif" : "Nonaktif"}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleKasirOpenDialog(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleKasirDelete(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Kasir Dialog */}
          <Dialog open={kasirDialogOpen} onOpenChange={setKasirDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {kasirEditingId ? "Edit Kasir" : "Tambah Kasir"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_kasir">Nama Kasir</Label>
                  <Input
                    id="nama_kasir"
                    value={kasirFormData.nama_kasir}
                    onChange={(e) =>
                      setKasirFormData({
                        ...kasirFormData,
                        nama_kasir: e.target.value,
                      })
                    }
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="kasir_status">Status Aktif</Label>
                  <Switch
                    id="kasir_status"
                    checked={kasirFormData.status}
                    onCheckedChange={(checked) =>
                      setKasirFormData({
                        ...kasirFormData,
                        status: checked,
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setKasirDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleKasirSave}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ==================== TAB TEMPAT PENJUALAN ==================== */}
        <TabsContent value="tempat" className="mt-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Tempat Penjualan
              </h2>
              <p className="mt-1 text-gray-600">
                Kelola lokasi penjualan produk Anda
              </p>
            </div>

            <Button
              onClick={() => handleTempatOpenDialog()}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <Plus size={20} />
              Tambah Tempat Penjualan
            </Button>
          </div>

          {tempatLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : tempatData.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <p className="text-gray-500">Belum ada data tempat penjualan</p>
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama Tempat
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tanggal Dibuat
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tempatData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.nama_tempat}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() =>
                            handleTempatStatusChange(item.id, !item.status)
                          }
                          className="flex items-center gap-2"
                        >
                          {item.status ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <Circle className="text-gray-300" size={20} />
                          )}
                          <span
                            className={
                              item.status ? "text-green-600" : "text-gray-500"
                            }
                          >
                            {item.status ? "Aktif" : "Nonaktif"}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleTempatOpenDialog(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleTempatDelete(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tempat Dialog */}
          <Dialog open={tempatDialogOpen} onOpenChange={setTempatDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {tempatEditingId
                    ? "Edit Tempat Penjualan"
                    : "Tambah Tempat Penjualan"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_tempat">Nama Tempat</Label>
                  <Input
                    id="nama_tempat"
                    value={tempatFormData.nama_tempat}
                    onChange={(e) =>
                      setTempatFormData({
                        ...tempatFormData,
                        nama_tempat: e.target.value,
                      })
                    }
                    placeholder="Contoh: Toko Jakarta"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="tempat_status">Status Aktif</Label>
                  <Switch
                    id="tempat_status"
                    checked={tempatFormData.status}
                    onCheckedChange={(checked) =>
                      setTempatFormData({
                        ...tempatFormData,
                        status: checked,
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTempatDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleTempatSave}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

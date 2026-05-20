import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Loader,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface MitraItem {
  id: number;
  nama: string;
  gambar: string;
  created_at?: string;
}

export function MitraManagementPage() {
  const [mitras, setMitras] = useState<MitraItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    gambar: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchMitras();
  }, []);

  async function fetchMitras() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("mitrakerja")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMitras(data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data mitra");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `mitrakerja/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gondo-okantara")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("gondo-okantara")
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        gambar: data.publicUrl,
      }));

      setError("");
    } catch (err) {
      console.error(err);
      setError("Gagal upload gambar");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nama || !formData.gambar) {
      setError("Nama dan gambar wajib diisi");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        const { error } = await supabase
          .from("mitrakerja")
          .update({
            nama: formData.nama,
            gambar: formData.gambar,
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("mitrakerja").insert([
          {
            nama: formData.nama,
            gambar: formData.gambar,
          },
        ]);

        if (error) throw error;
      }

      await fetchMitras();

      setShowModal(false);
      setEditingId(null);
      setFormData({
        nama: "",
        gambar: "",
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError(editingId ? "Gagal update mitra" : "Gagal menambahkan mitra");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus mitra ini?")) return;

    try {
      setLoading(true);

      const { error } = await supabase.from("mitrakerja").delete().eq("id", id);

      if (error) throw error;

      await fetchMitras();
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus mitra");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(mitra: MitraItem) {
    setEditingId(mitra.id);

    setFormData({
      nama: mitra.nama,
      gambar: mitra.gambar,
    });

    setShowModal(true);
  }

  function handleOpenModal() {
    setEditingId(null);
    setFormData({
      nama: "",
      gambar: "",
    });
    setShowModal(true);
    setError("");
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nama: "",
      gambar: "",
    });
    setError("");
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kelola Mitra</h1>
          <p className="text-gray-500 text-sm">
            Tambah, edit, dan hapus mitra kerja
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Mitra
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" size={18} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mitras.map((mitra) => (
            <div
              key={mitra.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="h-48 bg-gray-100">
                <img
                  src={mitra.gambar}
                  alt={mitra.nama}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-4">{mitra.nama}</h3>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(mitra)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(mitra.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && mitras.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">Belum ada data mitra</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">
                {editingId ? "Edit Mitra" : "Tambah Mitra"}
              </h2>

              <button onClick={handleCloseModal}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Mitra
                </label>

                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nama: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Masukkan nama mitra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Gambar Mitra
                </label>

                {formData.gambar && (
                  <div className="h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img
                      src={formData.gambar}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <label className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 px-4 py-4 cursor-pointer hover:border-blue-500">
                  <Upload size={18} />

                  <span className="text-sm">
                    {uploadingImage ? "Uploading..." : "Upload gambar"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-gray-300 py-2 rounded-lg"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : editingId ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

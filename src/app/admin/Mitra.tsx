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
  foto: string;
  created_at: string;
}

export function Mitra() {
  const [mitras, setMitras] = useState<MitraItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama: "", foto: "" });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchMitras();
  }, []);

  async function fetchMitras() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mitra")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMitras(data || []);
      setError("");
    } catch (err) {
      setError("Gagal mengambil data mitra");
      console.error(err);
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
      const filePath = `mitra/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, foto: data.publicUrl }));
      setError("");
    } catch (err) {
      setError("Gagal upload gambar");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.foto.trim()) {
      setError("Nama dan foto harus diisi");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        const { error } = await supabase
          .from("mitra")
          .update({ nama: formData.nama, foto: formData.foto })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("mitra").insert([
          {
            nama: formData.nama,
            foto: formData.foto,
          },
        ]);

        if (error) throw error;
      }

      await fetchMitras();
      setShowModal(false);
      setFormData({ nama: "", foto: "" });
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(editingId ? "Gagal update mitra" : "Gagal tambah mitra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus mitra ini?")) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("mitra").delete().eq("id", id);

      if (error) throw error;

      await fetchMitras();
      setError("");
    } catch (err) {
      setError("Gagal menghapus mitra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(mitra: MitraItem) {
    setFormData({ nama: mitra.nama, foto: mitra.foto });
    setEditingId(mitra.id);
    setShowModal(true);
  }

  function handleOpenModal() {
    setFormData({ nama: "", foto: "" });
    setEditingId(null);
    setShowModal(true);
    setError("");
  }

  function handleCloseModal() {
    setShowModal(false);
    setFormData({ nama: "", foto: "" });
    setEditingId(null);
    setError("");
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Mitra</h1>
          <p className="text-gray-600 text-sm mt-1">
            Tambah, edit, atau hapus mitra kerja
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Tambah Mitra
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {/* Mitra Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mitras.map((mitra) => (
            <div
              key={mitra.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                <img
                  src={mitra.foto}
                  alt={mitra.nama}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 truncate">
                  {mitra.nama}
                </h3>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(mitra)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mitra.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
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

      {/* Empty State */}
      {!loading && mitras.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Belum ada mitra yang ditambahkan
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Tambah mitra pertama Anda
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-bold">
                {editingId ? "Edit Mitra" : "Tambah Mitra Baru"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nama Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Mitra
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nama: e.target.value }))
                  }
                  placeholder="Masukkan nama mitra"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Mitra
                </label>

                {formData.foto && (
                  <div className="mb-3 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.foto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <Upload size={18} className="text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {uploadingImage ? "Uploading..." : "Pilih atau drag gambar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
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

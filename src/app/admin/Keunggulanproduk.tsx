import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Loader,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface KeunggulanItem {
  id: number;
  title: string;
  subtitle: string;
  gambar: string;
  created_at: string;
}

export function KeunggulanProduk() {
  const [data, setData] = useState<KeunggulanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    gambar: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  // ================= FETCH DATA =================
  async function fetchData() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("keunggulan")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setData(data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data keunggulan");
    } finally {
      setLoading(false);
    }
  }

  // ================= UPLOAD IMAGE =================
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const filePath = `keunggulanproduk/${fileName}`;

      const { error } = await supabase.storage
        .from("gondo-okantara") // ✅ BUCKET BENAR
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("gondo-okantara")
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        gambar: data.publicUrl,
      }));
    } catch (err) {
      console.error(err);
      setError("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  }

  // ================= SUBMIT =================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.subtitle || !form.gambar) {
      setError("Semua field wajib diisi");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const { error } = await supabase
          .from("keunggulan")
          .update(form)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("keunggulan").insert([form]);

        if (error) throw error;
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  // ================= DELETE =================
  async function handleDelete(id: number) {
    if (!confirm("Hapus data ini?")) return;

    try {
      await supabase.from("keunggulan").delete().eq("id", id);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus data");
    }
  }

  // ================= MODAL CONTROL =================
  function openAdd() {
    setForm({ title: "", subtitle: "", gambar: "" });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(item: KeunggulanItem) {
    setForm({
      title: item.title,
      subtitle: item.subtitle,
      gambar: item.gambar,
    });
    setEditingId(item.id);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({ title: "", subtitle: "", gambar: "" });
    setEditingId(null);
    setError("");
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Keunggulan Produk
          </h1>
          <p className="text-gray-500 text-sm">Kelola data keunggulan produk</p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
        >
          <Plus size={18} />
          Tambah
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader className="animate-spin" />
        </div>
      )}

      {/* GRID */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden border"
            >
              {/* IMAGE */}
              <div className="h-48 bg-gray-100">
                {item.gambar ? (
                  <img
                    src={item.gambar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <ImageIcon />
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>

                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.subtitle}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </p>

                {/* ACTION */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100"
                  >
                    <Edit2 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="text-center text-gray-500 py-20">
          Belum ada data keunggulan
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold">
                {editingId ? "Edit Data" : "Tambah Data"}
              </h2>

              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-2 rounded-lg"
              />

              <textarea
                placeholder="Subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full border p-2 rounded-lg h-24"
              />

              {/* UPLOAD */}
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed p-6 rounded-xl cursor-pointer hover:border-black transition">
                <Upload />

                <span className="text-sm text-gray-500">
                  {uploading ? "Uploading..." : "Upload gambar"}
                </span>

                <input type="file" className="hidden" onChange={handleUpload} />
              </label>

              {/* PREVIEW */}
              {form.gambar && (
                <img
                  src={form.gambar}
                  className="w-full h-40 object-cover rounded-xl"
                />
              )}

              {/* SUBMIT */}
              <button
                disabled={saving}
                className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ZoomIn,
  Pencil,
  Search,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";

interface GalleryImage {
  id: number;
  image_url: string;
  judul: string;
  deskripsi: string;
  category: string;
  created_at: string;
  updated_at: string;
  harga: number;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

export function KatalogPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");

  const [formData, setFormData] = useState<{
    image: File | null;
    preview_url: string;
    image_url: string;
    judul: string;
    deskripsi: string;
    category: string;
    harga: number | "";
  }>({
    image: null,
    preview_url: "",
    image_url: "",
    judul: "",
    deskripsi: "",
    category: "",
    harga: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchProduk = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("katalog")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Gagal ambil produk:", error);
        showToast("Gagal memuat katalog", "error");
        return;
      }

      const produkData = (data || []) as GalleryImage[];
      setImages(produkData);

      const uniqueCategories: string[] = [
        ...new Set(
          produkData
            .map((item) => item.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ];

      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching produk:", err);
      showToast("Terjadi kesalahan saat memuat data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFormData({
      ...formData,
      image: file,
      preview_url: previewUrl,
    });
  };

  const resetForm = () => {
    if (formData.preview_url.startsWith("blob:")) {
      URL.revokeObjectURL(formData.preview_url);
    }

    setFormData({
      image: null,
      preview_url: "",
      image_url: "",
      judul: "",
      deskripsi: "",
      category: "",
      harga: "",
    });

    setEditingId(null);
    setNewCategory("");
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `katalog/${fileName}`;

      console.log("Uploading file:", fileName, "to path:", filePath);

      const { error, data } = await supabase.storage
        .from("gondo-okantara")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Upload gagal: ${error.message}`);
      }

      console.log("Upload successful, data:", data);

      const { data: publicUrlData } = supabase.storage
        .from("gondo-okantara")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log("Generated public URL:", publicUrl);

      // Verify URL is accessible
      try {
        const response = await fetch(publicUrl, { method: "HEAD" });
        if (!response.ok) {
          console.warn("URL tidak accessible, status:", response.status);
        }
      } catch (fetchErr) {
        console.warn("Warning: Could not verify URL accessibility:", fetchErr);
      }

      return publicUrl;
    } catch (err) {
      console.error("Upload image error:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.judul.trim()) {
      showToast("Judul tidak boleh kosong", "error");
      return;
    }

    if (!formData.deskripsi.trim()) {
      showToast("Deskripsi tidak boleh kosong", "error");
      return;
    }

    if (!formData.category.trim()) {
      showToast("Kategori harus dipilih", "error");
      return;
    }

    if (formData.harga === "" || Number(formData.harga) <= 0) {
      showToast("Harga harus diisi dan lebih dari 0", "error");
      return;
    }

    let finalImageUrl = formData.image_url;

    if (formData.image) {
      try {
        setIsLoading(true);
        console.log("Starting image upload...");
        finalImageUrl = await uploadImage(formData.image);
        console.log("URL dari Supabase Storage:", finalImageUrl);
      } catch (err) {
        console.error("Upload gambar gagal:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Gagal upload gambar";
        showToast(errorMsg, "error");
        setIsLoading(false);
        return;
      }
    }

    if (!finalImageUrl) {
      showToast("Gambar wajib diupload", "error");
      setIsLoading(false);
      return;
    }

    try {
      if (editingId !== null) {
        const { error } = await supabase
          .from("katalog")
          .update({
            image_url: finalImageUrl,
            judul: formData.judul.trim(),
            deskripsi: formData.deskripsi.trim(),
            category: formData.category.trim(),
            harga: Number(formData.harga),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) {
          console.error("Gagal update:", error);
          showToast(`Gagal mengupdate katalog: ${error.message}`, "error");
          return;
        }

        showToast("Katalog berhasil diupdate", "success");
      } else {
        const { error } = await supabase.from("katalog").insert([
          {
            image_url: finalImageUrl,
            judul: formData.judul.trim(),
            deskripsi: formData.deskripsi.trim(),
            category: formData.category.trim(),
            harga: Number(formData.harga),
          },
        ]);

        if (error) {
          console.error("Gagal insert:", error);
          showToast(`Gagal menambah katalog: ${error.message}`, "error");
          return;
        }

        showToast("Katalog berhasil ditambahkan", "success");
      }

      await fetchProduk();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus katalog ini?")) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.from("katalog").delete().eq("id", id);

      if (error) {
        console.error("Gagal hapus:", error);
        showToast("Gagal menghapus katalog", "error");
        return;
      }

      showToast("Katalog berhasil dihapus", "success");
      await fetchProduk();
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Terjadi kesalahan saat menghapus", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (img: GalleryImage) => {
    setEditingId(img.id);

    setFormData({
      image: null,
      preview_url: img.image_url,
      image_url: img.image_url,
      judul: img.judul,
      deskripsi: img.deskripsi,
      category: img.category,
      harga: img.harga || "",
    });

    setIsModalOpen(true);
  };

  const filteredImages = images.filter((img) => {
    const matchCategory =
      filterCategory === "Semua" || img.category === filterCategory;

    const matchSearch =
      img.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) return;

    setCategories([...categories, trimmed]);

    setFormData({
      ...formData,
      category: trimmed,
    });

    setNewCategory("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-white animate-in fade-in slide-in-from-top-2 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Katalog</h1>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Plus size={18} />
          {isLoading ? "Loading..." : "Upload"}
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            className="w-full border rounded-xl pl-10 p-3"
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="border rounded-xl px-4 py-3 bg-white"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="Semua">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading && filteredImages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Tidak ada katalog</p>
          </div>
        ) : (
          filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition"
            >
              {/* IMAGE */}
              <div className="h-48 sm:h-44 lg:h-36 xl:h-40 bg-gray-100 overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3EImage Error%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-1">
                  {image.judul}
                </h3>

                <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[40px]">
                  {image.deskripsi}
                </p>

                <div className="mt-3">
                  <p className="text-lg font-bold text-red-600">
                    Rp {(image.harga || 0).toLocaleString("id-ID")}
                  </p>

                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {image.category}
                  </span>
                </div>

                {/* LIHAT DETAIL */}
                <button
                  onClick={() => setSelectedImage(image)}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                >
                  <ZoomIn size={17} />
                  Lihat Detail
                </button>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(image)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition text-sm font-medium"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-lg p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Katalog" : "Upload Katalog"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* IMAGE PREVIEW */}
            {formData.preview_url && (
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={formData.preview_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <p className="text-sm text-gray-600">
                  Klik untuk upload gambar
                </p>
              </label>
            </div>

            <input
              className="w-full border p-3 rounded-lg"
              placeholder="Judul"
              value={formData.judul}
              onChange={(e) =>
                setFormData({ ...formData, judul: e.target.value })
              }
              required
            />

            <textarea
              className="w-full border p-3 rounded-lg"
              placeholder="Deskripsi"
              rows={4}
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Harga</label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  Rp
                </span>

                <input
                  type="number"
                  className="w-full border p-3 pl-10 rounded-lg"
                  placeholder="Harga produk"
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harga:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Kategori</label>
              <select
                className="w-full border p-3 rounded-lg"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 border p-3 rounded-lg"
                placeholder="Kategori baru"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-3 rounded-lg font-medium"
              >
                Tambah
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.judul}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-2xl"
            >
              ×
            </button>
            <div className="mt-4 bg-white/10 backdrop-blur p-4 rounded-lg text-white">
              <h3 className="font-bold text-lg">{selectedImage.judul}</h3>
              <p className="text-sm mt-2">{selectedImage.deskripsi}</p>
              <span className="text-xs text-gray-300 mt-2 block">
                {selectedImage.category}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

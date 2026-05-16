import { useState } from "react";
import { Plus, Trash2, ZoomIn, Pencil, Search } from "lucide-react";

interface GalleryImage {
  id: number;
  url: string;
  Judul: string;
  Deskripsi: string;
  category: string;
  uploadDate: string;
}

export function KatalogPage() {
  const [images, setImages] = useState<GalleryImage[]>([
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      Judul: "Produk Elektronik",
      Deskripsi: "contoh produk",
      category: "Abon",
      uploadDate: "2026-05-10",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<{
    image: File | null;
    Judul: string;
    Deskripsi: string;
    category: string;
  }>({
    image: null,
    Judul: "",
    Deskripsi: "",
    category: "",
  });

  const [filterCategory, setFilterCategory] = useState("Semua");

  const categories = ["Semua", "Abon", "Sambal"];

  // =====================
  // HANDLE IMAGE
  // =====================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormData({
      ...formData,
      image: file,
    });
  };

  // =====================
  // RESET FORM
  // =====================
  const resetForm = () => {
    setFormData({
      image: null,
      Judul: "",
      Deskripsi: "",
      category: "",
    });

    setEditingId(null);
  };

  // =====================
  // CREATE & UPDATE
  // =====================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // UPDATE
    if (editingId !== null) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === editingId
            ? {
                ...img,
                Judul: formData.Judul,
                Deskripsi: formData.Deskripsi,
                category: formData.category,
                url: formData.image
                  ? URL.createObjectURL(formData.image)
                  : img.url,
              }
            : img,
        ),
      );

      setIsModalOpen(false);
      resetForm();
      return;
    }

    // CREATE
    if (!formData.image) return;

    const newImage: GalleryImage = {
      id: Math.max(...images.map((img) => img.id), 0) + 1,
      url: URL.createObjectURL(formData.image),
      Judul: formData.Judul,
      Deskripsi: formData.Deskripsi,
      category: formData.category,
      uploadDate: new Date().toISOString().split("T")[0],
    };

    setImages([newImage, ...images]);

    setIsModalOpen(false);
    resetForm();
  };

  // =====================
  // DELETE
  // =====================
  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus gambar ini?")) {
      setImages(images.filter((img) => img.id !== id));
    }
  };

  // =====================
  // EDIT
  // =====================
  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id);

    setFormData({
      image: null,
      Judul: image.Judul,
      Deskripsi: image.Deskripsi,
      category: image.category,
    });

    setIsModalOpen(true);
  };

  // =====================
  // FILTER + SEARCH
  // =====================
  const filteredImages = images.filter((img) => {
    const matchCategory =
      filterCategory === "Semua" ? true : img.category === filterCategory;

    const matchSearch =
      img.Judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.Deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Galeri Produk</h1>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700"
        >
          <Plus size={18} />
          Upload Gambar
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded-xl pl-10 pr-4 py-3"
        />
      </div>

      {/* FILTER */}
      <div className="flex gap-2 flex-wrap bg-gray-100 p-2 rounded-xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filterCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* IMAGE */}
            <div className="relative aspect-square group">
              <img
                src={image.url}
                alt={image.Judul}
                className="w-full h-full object-cover group-hover:scale-110 transition"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                {/* VIEW */}
                <button
                  onClick={() => setSelectedImage(image)}
                  className="bg-white p-2 rounded-full"
                >
                  <ZoomIn size={18} />
                </button>

                {/* EDIT */}
                <button
                  onClick={() => handleEdit(image)}
                  className="bg-white p-2 rounded-full text-blue-600"
                >
                  <Pencil size={18} />
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(image.id)}
                  className="bg-white p-2 rounded-full text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-4">
              <h3 className="font-semibold truncate">{image.Judul}</h3>

              <p className="text-sm text-gray-500 line-clamp-3">
                {image.Deskripsi}
              </p>

              <div className="mt-2 text-xs text-gray-400">{image.category}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold">
              {editingId !== null ? "Edit Produk" : "Upload Gambar"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border rounded-xl"
              />

              <input
                type="text"
                placeholder="Judul"
                value={formData.Judul}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Judul: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-xl"
                required
              />

              <textarea
                placeholder="Deskripsi"
                value={formData.Deskripsi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Deskripsi: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-xl"
                required
              />

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-xl"
                required
              >
                <option value="">Pilih kategori</option>

                {categories.slice(1).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {editingId !== null ? "Update" : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage.url} className="max-h-[80vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}

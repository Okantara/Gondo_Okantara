import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

export function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
      title: "Diskon Besar-Besaran!",
      subtitle: "Dapatkan diskon hingga 50% untuk semua produk elektronik",
      order: 1,
      isActive: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    isActive: true,
  });

  const handleAdd = () => {
    setEditingSlide(null);

    setFormData({
      title: "",
      subtitle: "",
      isActive: true,
    });

    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);

    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      isActive: slide.isActive,
    });

    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus slide ini?")) {
      setSlides(slides.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = editingSlide?.imageUrl || "";

    if (selectedFile) {
      imageUrl = URL.createObjectURL(selectedFile);
    }

    if (editingSlide) {
      setSlides(
        slides.map((s) =>
          s.id === editingSlide.id
            ? {
                ...editingSlide,
                ...formData,
                imageUrl,
              }
            : s,
        ),
      );
    } else {
      const newSlide: Slide = {
        ...formData,
        imageUrl,
        id: Math.max(...slides.map((s) => s.id), 0) + 1,
        order: slides.length + 1,
      };

      setSlides([...slides, newSlide]);
    }

    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= slides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];

    newSlides.forEach((slide, idx) => {
      slide.order = idx + 1;
    });

    setSlides(newSlides);
  };

  const toggleActive = (id: number) => {
    setSlides(
      slides.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const activeSlides = slides.filter((s) => s.isActive);

  const nextSlide = () => {
    setCurrentPreviewIndex((prev) =>
      prev === activeSlides.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentPreviewIndex((prev) =>
      prev === 0 ? activeSlides.length - 1 : prev - 1,
    );
  };

  return (
    <div className="p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Image Slides
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
          >
            <Eye size={20} />
            Preview
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Tambah Slide
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-200">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-center">Urutan</th>
              <th className="px-6 py-3 text-center">Preview</th>
              <th className="px-6 py-3 text-center">Konten</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {slides.map((slide, index) => (
              <tr key={slide.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span>{slide.order}</span>

                    <div className="flex flex-col">
                      <button
                        onClick={() => moveSlide(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronLeft size={16} className="rotate-90" />
                      </button>

                      <button
                        onClick={() => moveSlide(index, "down")}
                        disabled={index === slides.length - 1}
                      >
                        <ChevronRight size={16} className="rotate-90" />
                      </button>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                </td>

                <td className="px-6 py-4">
                  <h3 className="font-semibold">{slide.title}</h3>
                  <p className="text-sm text-gray-500">{slide.subtitle}</p>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(slide.id)}
                    className={`px-3 py-1 rounded-full sm:text-sm ${
                      slide.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {slide.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="text-blue-600 mr-3"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD */}
      <div className="md:hidden space-y-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="bg-white rounded-xl shadow p-4 space-y-4"
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-44 object-cover rounded-lg"
            />

            <div>
              <h3 className="font-bold text-lg">{slide.title}</h3>
              <p className="text-sm text-gray-500">{slide.subtitle}</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleActive(slide.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  slide.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {slide.isActive ? "Aktif" : "Nonaktif"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveSlide(index, "up")}
                  disabled={index === 0}
                  className="p-2 rounded-lg border"
                >
                  <ChevronLeft size={18} className="rotate-90" />
                </button>

                <button
                  onClick={() => moveSlide(index, "down")}
                  disabled={index === slides.length - 1}
                  className="p-2 rounded-lg border"
                >
                  <ChevronRight size={18} className="rotate-90" />
                </button>

                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 rounded-lg bg-red-100 text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                {editingSlide ? "Edit Slide" : "Tambah Slide"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Upload Gambar
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required={!editingSlide}
                  />
                </div>

                {selectedFile && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-52 object-cover rounded-lg"
                  />
                )}

                {!selectedFile && editingSlide && (
                  <img
                    src={editingSlide.imageUrl}
                    alt="Preview"
                    className="w-full h-52 object-cover rounded-lg"
                  />
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Judul
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Isi</label>

                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subtitle: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.checked,
                      })
                    }
                  />

                  <label>Aktifkan Slide</label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-3 border rounded-lg"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    {editingSlide ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {previewMode && activeSlides.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setPreviewMode(false)}
            className="absolute top-4 right-4 text-white bg-black/50 px-4 py-2 rounded-lg z-10"
          >
            Tutup
          </button>

          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 text-white bg-black/50 p-2 sm:p-3 rounded-full z-10"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 text-white bg-black/50 p-2 sm:p-3 rounded-full z-10"
          >
            <ChevronRight size={28} />
          </button>

          <div className="relative w-250 h-250">
            <img
              src={activeSlides[currentPreviewIndex].imageUrl}
              alt={activeSlides[currentPreviewIndex].title}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 sm:p-8">
              <h2 className="text-2xl sm:text-5xl font-bold mb-4 text-center">
                {activeSlides[currentPreviewIndex].title}
              </h2>

              <p className="text-base sm:text-2xl text-center max-w-3xl">
                {activeSlides[currentPreviewIndex].subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getImageUrl } from "../../lib/imageUtils";

interface Slide {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  order: number;
  is_active: boolean;
}

export function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    is_active: true,
  });

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Gagal mengambil slide:", error);
      return;
    }

    const mappedSlides: Slide[] = data.map((item: any) => ({
      id: item.id,
      image_url: item.image_url,
      title: item.title,
      subtitle: item.subtitle,
      order: item.order,
      is_active: item.is_active,
    }));

    setSlides(mappedSlides);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleAdd = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      subtitle: "",
      is_active: true,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      is_active: slide.is_active,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = editingSlide?.image_url || "";

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `slides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gondo-okantara")
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error("Gagal upload:", uploadError);
        alert("Gagal upload gambar");
        return;
      }

      imageUrl = filePath;
    }

    if (editingSlide) {
      const { error } = await supabase
        .from("slides")
        .update({
          title: formData.title,
          subtitle: formData.subtitle,
          image_url: imageUrl,
          is_active: formData.is_active,
        })
        .eq("id", editingSlide.id);

      if (error) {
        console.error("Gagal update:", error);
        alert("Gagal update slide");
        return;
      }
    } else {
      const { error } = await supabase.from("slides").insert({
        title: formData.title,
        subtitle: formData.subtitle,
        image_url: imageUrl,
        order: slides.length + 1,
        is_active: formData.is_active,
      });

      if (error) {
        console.error("Gagal insert:", error);
        alert("Gagal tambah slide");
        return;
      }
    }

    await fetchSlides();
    setIsModalOpen(false);
    setSelectedFile(null);
    setEditingSlide(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus slide ini?")) return;

    const slide = slides.find((s) => s.id === id);

    if (slide?.image_url) {
      await supabase.storage.from("gondo-okantara").remove([slide.image_url]);
    }

    const { error } = await supabase.from("slides").delete().eq("id", id);

    if (error) {
      console.error("Gagal hapus:", error);
      alert("Gagal hapus slide");
      return;
    }

    await fetchSlides();
  };

  const toggleActive = async (id: number) => {
    const slide = slides.find((s) => s.id === id);
    if (!slide) return;

    const { error } = await supabase
      .from("slides")
      .update({
        is_active: !slide.is_active,
      })
      .eq("id", id);

    if (error) {
      console.error("Gagal ubah status:", error);
      alert("Gagal ubah status");
      return;
    }

    await fetchSlides();
  };

  const moveSlide = async (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= slides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];

    const updatedSlides = newSlides.map((slide, idx) => ({
      ...slide,
      order: idx + 1,
    }));

    setSlides(updatedSlides);

    for (const slide of updatedSlides) {
      await supabase
        .from("slides")
        .update({
          order: slide.order,
        })
        .eq("id", slide.id);
    }

    await fetchSlides();
  };

  const activeSlides = slides.filter((s) => s.is_active);

  const nextSlide = () => {
    if (activeSlides.length === 0) return;

    setCurrentPreviewIndex((prev) =>
      prev === activeSlides.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    if (activeSlides.length === 0) return;

    setCurrentPreviewIndex((prev) =>
      prev === 0 ? activeSlides.length - 1 : prev - 1,
    );
  };

  return (
    <div className="p-4 sm:p-6">
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
                    src={getImageUrl(slide.image_url)}
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
                      slide.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {slide.is_active ? "Aktif" : "Nonaktif"}
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

      <div className="md:hidden space-y-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="bg-white rounded-xl shadow p-4 space-y-4"
          >
            <img
              src={getImageUrl(slide.image_url)}
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
                  slide.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {slide.is_active ? "Aktif" : "Nonaktif"}
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
                      if (file) setSelectedFile(file);
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
                    src={getImageUrl(editingSlide.image_url)}
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
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.checked,
                      })
                    }
                  />

                  <label>Aktifkan Slide</label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingSlide(null);
                      setSelectedFile(null);
                    }}
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
              src={getImageUrl(activeSlides[currentPreviewIndex].image_url)}
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
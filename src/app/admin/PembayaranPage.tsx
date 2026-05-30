import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getImageUrl } from "../../lib/imageUtils";

interface MetodePembayaran {
  id: number;
  nama: string;
  gambar: string | null;
  nomor: string | null;
  atas_nama: string | null;
  is_active: boolean;
  order: number;
}

export function MetodePembayaranPage() {
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran[]>(
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<MetodePembayaran | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    nomor: "",
    atas_nama: "",
    order: 0,
    is_active: true,
  });

  const fetchMetodePembayaran = async () => {
    const { data, error } = await supabase
      .from("metode_pembayaran")
      .select("*")
      .order("order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengambil metode pembayaran:", error);
      return;
    }

    setMetodePembayaran(data || []);
  };

  useEffect(() => {
    fetchMetodePembayaran();
  }, []);

  const handleAdd = () => {
    const nextOrder =
      metodePembayaran.length > 0
        ? Math.max(...metodePembayaran.map((item) => item.order || 0)) + 1
        : 1;

    setEditingData(null);
    setFormData({
      nama: "",
      nomor: "",
      atas_nama: "",
      order: nextOrder,
      is_active: true,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MetodePembayaran) => {
    setEditingData(item);
    setFormData({
      nama: item.nama || "",
      nomor: item.nomor || "",
      atas_nama: item.atas_nama || "",
      order: item.order || 0,
      is_active: item.is_active,
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = editingData?.gambar || "";

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `metode-pembayaran/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gondo-okantara")
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error("Gagal upload gambar:", uploadError);
        alert("Gagal upload gambar");
        return;
      }

      imageUrl = filePath;
    }

    const payload = {
      nama: formData.nama,
      gambar: imageUrl,
      nomor: formData.nomor,
      atas_nama: formData.atas_nama,
      order: formData.order,
      is_active: formData.is_active,
    };

    if (editingData) {
      const { error } = await supabase
        .from("metode_pembayaran")
        .update(payload)
        .eq("id", editingData.id);

      if (error) {
        console.error("Gagal update metode pembayaran:", error);
        alert("Gagal update metode pembayaran");
        return;
      }
    } else {
      const { error } = await supabase
        .from("metode_pembayaran")
        .insert(payload);

      if (error) {
        console.error("Gagal tambah metode pembayaran:", error);
        alert("Gagal tambah metode pembayaran");
        return;
      }
    }

    await fetchMetodePembayaran();
    setIsModalOpen(false);
    setSelectedFile(null);
    setEditingData(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus metode pembayaran ini?")) {
      return;
    }

    const item = metodePembayaran.find((data) => data.id === id);

    if (item?.gambar) {
      await supabase.storage.from("gondo-okantara").remove([item.gambar]);
    }

    const { error } = await supabase
      .from("metode_pembayaran")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Gagal hapus metode pembayaran:", error);
      alert("Gagal hapus metode pembayaran");
      return;
    }

    await fetchMetodePembayaran();
  };

  const toggleActive = async (id: number) => {
    const item = metodePembayaran.find((data) => data.id === id);
    if (!item) return;

    const { error } = await supabase
      .from("metode_pembayaran")
      .update({
        is_active: !item.is_active,
      })
      .eq("id", id);

    if (error) {
      console.error("Gagal ubah status:", error);
      alert("Gagal ubah status");
      return;
    }

    await fetchMetodePembayaran();
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= metodePembayaran.length) return;

    const currentItem = metodePembayaran[index];
    const targetItem = metodePembayaran[targetIndex];

    const currentOrder = currentItem.order;
    const targetOrder = targetItem.order;

    const { error: errorCurrent } = await supabase
      .from("metode_pembayaran")
      .update({ order: targetOrder })
      .eq("id", currentItem.id);

    const { error: errorTarget } = await supabase
      .from("metode_pembayaran")
      .update({ order: currentOrder })
      .eq("id", targetItem.id);

    if (errorCurrent || errorTarget) {
      console.error("Gagal mengubah urutan:", errorCurrent || errorTarget);
      alert("Gagal mengubah urutan");
      return;
    }

    await fetchMetodePembayaran();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Metode Pembayaran
        </h1>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Tambah Metode
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-200">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-center">Urutan</th>
              <th className="px-6 py-3 text-center">Gambar</th>
              <th className="px-6 py-3 text-left">Nama</th>
              <th className="px-6 py-3 text-left">Nomor</th>
              <th className="px-6 py-3 text-left">Atas Nama</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {metodePembayaran.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span>{item.order}</span>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveOrder(index, "up")}
                        disabled={index === 0}
                        className="disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>

                      <button
                        onClick={() => moveOrder(index, "down")}
                        disabled={index === metodePembayaran.length - 1}
                        className="disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  {item.gambar ? (
                    <img
                      src={getImageUrl(item.gambar)}
                      alt={item.nama}
                      className="w-20 h-20 object-contain rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mx-auto">
                      No Image
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 font-semibold">{item.nama}</td>
                <td className="px-6 py-4">{item.nomor || "-"}</td>
                <td className="px-6 py-4">{item.atas_nama || "-"}</td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleActive(item.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 mr-3"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {metodePembayaran.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Belum ada metode pembayaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {metodePembayaran.map((item, index) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500">
                Urutan: {item.order}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => moveOrder(index, "up")}
                  disabled={index === 0}
                  className="p-2 border rounded-lg disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>

                <button
                  onClick={() => moveOrder(index, "down")}
                  disabled={index === metodePembayaran.length - 1}
                  className="p-2 border rounded-lg disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {item.gambar ? (
              <img
                src={getImageUrl(item.gambar)}
                alt={item.nama}
                className="w-full h-44 object-contain rounded-lg bg-gray-50 mb-4"
              />
            ) : (
              <div className="w-full h-44 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4">
                No Image
              </div>
            )}

            <h3 className="font-bold text-lg">{item.nama}</h3>

            <p className="text-sm text-gray-500 mt-1">
              Nomor: {item.nomor || "-"}
            </p>

            <p className="text-sm text-gray-500">
              Atas Nama: {item.atas_nama || "-"}
            </p>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => toggleActive(item.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  item.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.is_active ? "Aktif" : "Nonaktif"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-red-100 text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {metodePembayaran.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            Belum ada metode pembayaran.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                {editingData
                  ? "Edit Metode Pembayaran"
                  : "Tambah Metode Pembayaran"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Upload Gambar / QRIS
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>

                {selectedFile && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-52 object-contain bg-gray-50 rounded-lg"
                  />
                )}

                {!selectedFile && editingData?.gambar && (
                  <img
                    src={getImageUrl(editingData.gambar)}
                    alt="Preview"
                    className="w-full h-52 object-contain bg-gray-50 rounded-lg"
                  />
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Urutan
                  </label>

                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Nama Metode Pembayaran
                  </label>

                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama: e.target.value,
                      })
                    }
                    placeholder="Contoh: QRIS, Tunai, Transfer BCA"
                    className="w-full border border-gray-300 rounded-lg p-3"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Nomor Rekening / Nomor Tujuan
                  </label>

                  <input
                    type="text"
                    value={formData.nomor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomor: e.target.value,
                      })
                    }
                    placeholder="Contoh: 1234567890"
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Atas Nama
                  </label>

                  <input
                    type="text"
                    value={formData.atas_nama}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        atas_nama: e.target.value,
                      })
                    }
                    placeholder="Contoh: Pak Gondo"
                    className="w-full border border-gray-300 rounded-lg p-3"
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

                  <label>Aktifkan Metode Pembayaran</label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingData(null);
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
                    {editingData ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

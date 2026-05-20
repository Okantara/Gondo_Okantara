import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Product {
  id: number;
  src: string;
  alt: string;
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<{
    image: File | null;
    alt: string;
  }>({
    image: null,
    alt: "",
  });

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      alert(error.message);
      return;
    }

    setProducts(data || []);
  }

  // ✅ FIXED UPLOAD (bucket benar: gondo-okantara)
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("gondo-okantara")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("gondo-okantara")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ image: null, alt: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      image: null,
      alt: product.alt,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk?")) return;

    const { error } = await supabase.from("gallery").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setProducts(products.filter((p) => p.id !== id));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = editingProduct?.src || "";

      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      if (!imageUrl && !editingProduct) {
        alert("Gambar wajib diupload");
        return;
      }

      if (editingProduct) {
        const { error } = await supabase
          .from("gallery")
          .update({
            src: imageUrl,
            alt: formData.alt,
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery").insert({
          src: imageUrl,
          alt: formData.alt,
        });

        if (error) throw error;
      }

      setIsModalOpen(false);
      getProducts();
    } catch (error) {
      console.error("Gagal simpan:", error);
      alert(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Katalog Produk</h1>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          <Plus size={18} />
          Tambah
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <img
              src={product.src}
              alt={product.alt}
              className="w-full h-44 object-cover"
            />

            <div className="p-3 space-y-3">
              <p className="text-sm text-gray-700 min-h-10">{product.alt}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 flex items-center gap-1 text-sm"
                >
                  <Edit size={16} /> Edit
                </button>

                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 flex items-center gap-1 text-sm"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-5 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold">
              {editingProduct ? "Edit Produk" : "Tambah Produk"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-3 rounded-xl"
                required={!editingProduct}
              />

              <textarea
                placeholder="Keterangan gambar"
                value={formData.alt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    alt: e.target.value,
                  }))
                }
                className="w-full border p-3 rounded-xl"
                rows={4}
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>

                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

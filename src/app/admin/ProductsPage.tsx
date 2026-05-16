import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Product {
  id: number;
  image: string;
  description: string;
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      description: "Sepatu running berkualitas tinggi",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<{
    image: File | null;
    description: string;
  }>({
    image: null,
    description: "",
  });

  // ADD
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ image: null, description: "" });
    setIsModalOpen(true);
  };

  // EDIT
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      image: null, // file baru kalau mau ganti
      description: product.description,
    });
    setIsModalOpen(true);
  };

  // DELETE
  const handleDelete = (id: number) => {
    if (confirm("Hapus produk ini?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // FILE CHANGE
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({ ...formData, image: file });
  };

  // SUBMIT
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";

    // kalau upload baru
    if (formData.image) {
      imageUrl = URL.createObjectURL(formData.image);
    }

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                description: formData.description,
                image: imageUrl || p.image,
              }
            : p,
        ),
      );
    } else {
      const newProduct: Product = {
        id: Math.max(...products.map((p) => p.id), 0) + 1,
        image: imageUrl,
        description: formData.description,
      };

      setProducts([newProduct, ...products]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
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

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <img src={product.image} className="w-full h-44 object-cover" />

            <div className="p-3 space-y-3">
              <p className="text-sm text-gray-700 min-h-10">
                {product.description}
              </p>

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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-5 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold">
              {editingProduct ? "Edit Produk" : "Tambah Produk"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* FILE UPLOAD */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-3 rounded-xl"
              />

              {/* DESCRIPTION */}
              <textarea
                placeholder="Deskripsi"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
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

import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../../lib/supabase";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface ProductDB {
  id: number;
  image_url: string;
  judul: string;
  deskripsi: string;
  category: string;
}

interface Product extends ProductDB {
  quantity: number;
}

export function Order() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("katalog")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("Gagal mengambil katalog:", error);
      return;
    }

    const formattedData: Product[] = ((data || []) as ProductDB[]).map(
      (item) => ({
        ...item,
        quantity: 0,
      }),
    );

    setProducts(formattedData);
  };

  const updateQuantity = (id: number, action: "plus" | "minus") => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          quantity:
            action === "plus"
              ? item.quantity + 1
              : Math.max(item.quantity - 1, 0),
        };
      }),
    );
  };

  const selectedProducts = products.filter((item) => item.quantity > 0);

  const totalItem = selectedProducts.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const handleOrder = () => {
    if (selectedProducts.length === 0) {
      alert("Silakan pilih produk terlebih dahulu");
      return;
    }

    const pesan = selectedProducts
      .map((item) => `${item.judul} x ${item.quantity}`)
      .join("\n");

    alert(`Pesanan Anda:\n\n${pesan}`);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FFE8D6] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2 rounded-full mb-5">
            <ShoppingCart size={18} />
            <span className="text-sm font-semibold">Order Produk</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pilih Produk Favorit Anda
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tentukan produk dan jumlah pesanan dengan mudah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col border ${
                product.quantity > 0
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-gray-100"
              }`}
            >
              <div className="relative h-64 bg-gradient-to-br from-white to-orange-50 overflow-hidden">
                <ImageWithFallback
                  src={product.image_url}
                  alt={product.judul}
                  className="w-full h-full object-contain p-6 hover:scale-110 transition-transform duration-500"
                />

                <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow">
                  {product.category}
                </span>

                {product.quantity > 0 && (
                  <span className="absolute top-4 right-4 bg-green-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold shadow">
                    {product.quantity}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.judul}
                </h3>

                <p className="text-gray-600 line-clamp-3 mb-6">
                  {product.deskripsi}
                </p>

                <div className="mt-auto bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Jumlah
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(product.id, "minus")}
                      disabled={product.quantity === 0}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        product.quantity === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      <Minus size={18} />
                    </button>

                    <span className="text-lg font-bold w-8 text-center">
                      {product.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(product.id, "plus")}
                      className="w-9 h-9 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-gray-100 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Pesanan</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalItem} Item
              </h3>
            </div>

            <button
              onClick={handleOrder}
              disabled={totalItem === 0}
              className={`w-full md:w-auto px-8 py-4 rounded-2xl text-white font-semibold transition ${
                totalItem === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"
              }`}
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

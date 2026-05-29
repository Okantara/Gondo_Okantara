import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../../lib/supabase";
import {
  Minus,
  Plus,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Wallet,
  QrCode,
} from "lucide-react";

interface ProductDB {
  id: number;
  image_url: string;
  judul: string;
  deskripsi: string;
  category: string;
  harga: number;
}

interface Product extends ProductDB {
  quantity: number;
}

export function Order() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    noHp: "",
    alamat: "",
    catatan: "",
    metodePembayaran: "tunai",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("katalog")
        .select("*")
        .order("id", { ascending: false });

      if (fetchError) throw fetchError;

      const formattedData: Product[] = ((data || []) as ProductDB[]).map(
        (item) => ({
          ...item,
          quantity: 0,
        }),
      );

      setProducts(formattedData);
    } catch (err) {
      console.error("Gagal mengambil katalog:", err);
      setError("Gagal memuat produk. Silakan refresh halaman.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedProducts = products.filter((item) => item.quantity > 0);

  const totalItem = selectedProducts.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalHarga = selectedProducts.reduce(
    (sum, item) => sum + item.quantity * (item.harga || 0),
    0,
  );

  const handleOrder = () => {
    if (selectedProducts.length === 0) {
      alert("Silakan pilih produk terlebih dahulu");
      return;
    }

    if (!formData.nama || !formData.noHp || !formData.alamat) {
      alert("Nama, No HP, dan Alamat wajib diisi");
      return;
    }

    const pesanProduk = selectedProducts
      .map(
        (item) =>
          `${item.judul} x ${item.quantity} = Rp ${(
            item.quantity * (item.harga || 0)
          ).toLocaleString("id-ID")}`,
      )
      .join("\n");

    alert(
      `Pesanan Anda:\n\n` +
        `Nama: ${formData.nama}\n` +
        `No HP: ${formData.noHp}\n` +
        `Alamat: ${formData.alamat}\n` +
        `Catatan: ${formData.catatan || "-"}\n` +
        `Pembayaran: ${formData.metodePembayaran.toUpperCase()}\n\n` +
        `${pesanProduk}\n\n` +
        `Total: Rp ${totalHarga.toLocaleString("id-ID")}`,
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FFE8D6] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
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

        {/* FORM PEMESAN */}
        <div className="max-w-4xl mx-auto mb-14">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <User className="text-red-600" size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Data Pemesan
                </h2>

                <p className="text-gray-500 text-sm">
                  Lengkapi data sebelum melakukan pemesanan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Nama lengkap"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                />
              </div>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleInputChange}
                  placeholder="Nomor WhatsApp"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                />
              </div>

              <div className="relative md:col-span-2">
                <MapPin
                  size={18}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Alamat lengkap pengiriman"
                  rows={3}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <input
                  type="text"
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                />
              </div>
            </div>

            {/* METODE PEMBAYARAN */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="text-red-600" size={20} />

                <h3 className="text-lg font-bold text-gray-900">
                  Metode Pembayaran
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      metodePembayaran: "tunai",
                    }))
                  }
                  className={`p-5 rounded-3xl border-2 transition-all text-left ${
                    formData.metodePembayaran === "tunai"
                      ? "border-red-500 bg-red-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">Tunai</h4>

                      <p className="text-sm text-gray-500 mt-1">
                        Bayar langsung saat produk diterima
                      </p>
                    </div>

                    <Wallet
                      size={30}
                      className={
                        formData.metodePembayaran === "tunai"
                          ? "text-red-600"
                          : "text-gray-400"
                      }
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      metodePembayaran: "qris",
                    }))
                  }
                  className={`p-5 rounded-3xl border-2 transition-all text-left ${
                    formData.metodePembayaran === "qris"
                      ? "border-red-500 bg-red-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">QRIS</h4>

                      <p className="text-sm text-gray-500 mt-1">
                        Pembayaran digital menggunakan QRIS
                      </p>
                    </div>

                    <QrCode
                      size={30}
                      className={
                        formData.metodePembayaran === "qris"
                          ? "text-red-600"
                          : "text-gray-400"
                      }
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat produk...</p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block mb-4">
              {error}
            </div>
            <button
              onClick={fetchProducts}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* PRODUCTS */}
        {!loading && !error && (
          <>
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

                    <p className="text-gray-600 line-clamp-3 mb-3">
                      {product.deskripsi}
                    </p>

                    <p className="text-2xl font-bold text-red-600 mb-6">
                      Rp {(product.harga || 0).toLocaleString("id-ID")}
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

            {products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-600">Belum ada produk tersedia</p>
              </div>
            )}
          </>
        )}

        {/* BOTTOM BAR */}
        {!loading && !error && products.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-gray-100 p-4 md:p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Pesanan</p>

                <h3 className="text-2xl font-bold text-gray-900">
                  {totalItem} Item
                </h3>

                <p className="text-lg font-bold text-red-600 mt-1">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </p>
              </div>

              <button
                onClick={handleOrder}
                disabled={totalItem === 0}
                className={`px-8 py-4 rounded-2xl text-white font-semibold transition ${
                  totalItem === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"
                }`}
              >
                Pesan Sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

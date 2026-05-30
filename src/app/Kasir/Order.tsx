import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Wallet } from "lucide-react";
import { getImageUrl } from "../../lib/imageUtils";

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

interface MetodePembayaran {
  id: number;
  nama: string;
  gambar: string | null;
  nomor: string | null;
  atas_nama: string | null;
  is_active: boolean;
  order: number;
}

export function Order() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama: "",
    noHp: "",
    alamat: "",
    catatan: "",
    metodePembayaranId: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchMetodePembayaran();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("katalog")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      const formatted: Product[] = (data || []).map((item: ProductDB) => ({
        ...item,
        quantity: 0,
      }));

      setProducts(formatted);
    } catch (err) {
      console.error("Gagal mengambil produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetodePembayaran = async () => {
    const { data, error } = await supabase
      .from("metode_pembayaran")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengambil metode pembayaran:", error);
      return;
    }

    setMetodePembayaran(data || []);

    if (data && data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        metodePembayaranId: String(data[0].id),
      }));
    }
  };

  const updateQuantity = (id: number, type: "plus" | "minus") => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                type === "plus"
                  ? item.quantity + 1
                  : Math.max(item.quantity - 1, 0),
            }
          : item,
      ),
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedProducts = products.filter((p) => p.quantity > 0);

  const selectedMetodePembayaran = metodePembayaran.find(
    (item) => String(item.id) === formData.metodePembayaranId,
  );

  const totalHarga = selectedProducts.reduce(
    (sum, item) => sum + item.quantity * item.harga,
    0,
  );

  const handlePesan = async () => {
    if (!formData.nama || !formData.noHp || !formData.alamat) {
      alert("Lengkapi data pemesan");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Pilih produk terlebih dahulu");
      return;
    }

    if (!formData.metodePembayaranId) {
      alert("Pilih metode pembayaran");
      return;
    }

    const { data: pembelian, error: pembelianError } = await supabase
      .from("pembelian")
      .insert({
        nama: formData.nama,
        no_hp: formData.noHp,
        alamat: formData.alamat,
        catatan: formData.catatan,
        metode_pembayaran_id: Number(formData.metodePembayaranId),
        total: totalHarga,
      })
      .select()
      .single();

    if (pembelianError) {
      console.error("Gagal simpan pembelian:", pembelianError);
      alert("Gagal menyimpan pembelian");
      return;
    }

    const items = selectedProducts.map((item) => ({
      pembelian_id: pembelian.id,
      katalog_id: item.id,
      nama_produk: item.judul,
      harga: item.harga,
      qty: item.quantity,
      subtotal: item.harga * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("pembelian_items")
      .insert(items);

    if (itemsError) {
      console.error("Gagal simpan item pembelian:", itemsError);
      alert("Pembelian tersimpan, tapi item gagal disimpan");
      return;
    }

    alert("Pesanan berhasil disimpan");

    setFormData({
      nama: "",
      noHp: "",
      alamat: "",
      catatan: "",
      metodePembayaranId: metodePembayaran[0]
        ? String(metodePembayaran[0].id)
        : "",
    });

    setProducts((prev) =>
      prev.map((item) => ({
        ...item,
        quantity: 0,
      })),
    );
  };

  return (
    <div className="p-6 md:p-8">
      <div className="bg-gray-50 border rounded-3xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-5">Data Pemesan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="Nama"
            className="border rounded-2xl px-4 py-3"
          />

          <input
            name="noHp"
            value={formData.noHp}
            onChange={handleChange}
            placeholder="No HP"
            className="border rounded-2xl px-4 py-3"
          />

          <textarea
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            placeholder="Alamat"
            className="md:col-span-2 border rounded-2xl px-4 py-3"
          />

          <textarea
            name="catatan"
            value={formData.catatan}
            onChange={handleChange}
            placeholder="Catatan"
            className="md:col-span-2 border rounded-2xl px-4 py-3"
          />
        </div>

        <div className="mt-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Wallet className="text-red-600" size={18} />
            Metode Pembayaran
          </h3>

          {metodePembayaran.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada metode pembayaran aktif.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metodePembayaran.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      metodePembayaranId: String(item.id),
                    }))
                  }
                  className={`p-4 rounded-2xl border text-left transition ${
                    formData.metodePembayaranId === String(item.id)
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.gambar ? (
                      <img
                        src={getImageUrl(item.gambar)}
                        alt={item.nama}
                        className="w-14 h-14 object-contain rounded-xl bg-white border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Wallet size={22} className="text-gray-400" />
                      </div>
                    )}

                    <div>
                      <p className="font-bold">{item.nama}</p>

                      {item.nomor && (
                        <p className="text-xs text-gray-500">
                          No: {item.nomor}
                        </p>
                      )}

                      {item.atas_nama && (
                        <p className="text-xs text-gray-500">
                          A/N: {item.atas_nama}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex flex-row sm:flex-col border rounded-2xl overflow-hidden ${
                product.quantity > 0 ? "border-red-400" : "border-gray-200"
              }`}
            >
              <div className="w-24 h-24 sm:w-full sm:h-48 bg-gray-100 m-5 md:m-0">
                <img
                  src={product.image_url}
                  alt={product.judul}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-red-500">{product.category}</p>

                  <h3 className="font-bold text-sm sm:text-base line-clamp-2">
                    {product.judul}
                  </h3>

                  <p className="text-red-600 font-bold text-sm">
                    Rp {product.harga.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 bg-gray-100 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, "minus")}
                    className="w-8 h-8 bg-red-100 rounded-lg"
                  >
                    −
                  </button>

                  <span className="font-bold">{product.quantity}</span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, "plus")}
                    className="w-8 h-8 bg-green-100 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-between items-center border-t pt-5">
        <div>
          <p className="text-gray-500">Total</p>

          <h2 className="text-2xl font-bold text-red-600">
            Rp {totalHarga.toLocaleString("id-ID")}
          </h2>

          <p className="text-sm text-gray-500">
            {selectedMetodePembayaran?.nama || "Belum pilih pembayaran"}
          </p>
        </div>

        <button
          onClick={handlePesan}
          className="bg-red-600 text-white px-6 py-3 rounded-2xl"
        >
          Pesan
        </button>
      </div>
    </div>
  );
}

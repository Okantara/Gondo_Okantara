import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Wallet, UserRound, Printer, Send } from "lucide-react";
import { getImageUrl } from "../../lib/imageUtils";
import { cetakPDF } from "../../lib/printUtils";

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

interface MasterKasir {
  id: number;
  nama_kasir: string;
  status: boolean;
}

interface TempatPenjualan {
  id: number;
  nama_tempat: string;
  status: boolean;
}

interface PembelianItem {
  nama_produk: string;
  harga: number;
  qty: number;
  subtotal: number;
}

interface SavedOrder {
  id: number;
  nama: string;
  no_hp: string | null;
  alamat: string | null;
  catatan: string | null;
  total: number;
  created_at: string;

  pembelian_items: PembelianItem[];

  metode_pembayaran?: MetodePembayaran | null;

  master_kasir?: {
    nama_kasir: string;
  } | null;

  tempat_penjualan?: {
    nama_tempat: string;
  } | null;
}

interface OrderProps {
  onSuccess?: () => void;
}

export function Order({ onSuccess }: OrderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran[]>(
    [],
  );
  const [masterKasir, setMasterKasir] = useState<MasterKasir[]>([]);
  const [tempatPenjualan, setTempatPenjualan] = useState<TempatPenjualan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [lastOrder, setLastOrder] = useState<SavedOrder | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    noHp: "",
    alamat: "",
    catatan: "",
    metodePembayaranId: "",
    namaKasirId: "",
    tempatPenjualanId: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchMetodePembayaran();
    fetchMasterKasir();
    fetchTempatPenjualan();
  }, []);

  const rupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

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
      alert("Gagal mengambil data produk");
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

  const fetchMasterKasir = async () => {
    const { data, error } = await supabase
      .from("master_kasir")
      .select("*")
      .eq("status", true)
      .order("nama_kasir", { ascending: true });

    if (error) {
      console.error("Gagal mengambil master kasir:", error);
      return;
    }

    setMasterKasir(data || []);

    if (data && data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        namaKasirId: String(data[0].id),
      }));
    }
  };

  const fetchTempatPenjualan = async () => {
    const { data, error } = await supabase
      .from("tempat_penjualan")
      .select("*")
      .eq("status", true)
      .order("nama_tempat", { ascending: true });

    if (error) {
      console.error("Gagal mengambil tempat penjualan:", error);
      return;
    }

    setTempatPenjualan(data || []);

    if (data && data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tempatPenjualanId: String(data[0].id),
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedProducts = products.filter((p) => p.quantity > 0);

  const selectedMetodePembayaran = metodePembayaran.find(
    (item) => String(item.id) === formData.metodePembayaranId,
  );

  const selectedKasir = masterKasir.find(
    (item) => String(item.id) === formData.namaKasirId,
  );

  const selectedTempat = tempatPenjualan.find(
    (item) => String(item.id) === formData.tempatPenjualanId,
  );

  const totalHarga = selectedProducts.reduce(
    (sum, item) => sum + item.quantity * item.harga,
    0,
  );

  const formatNomorWA = (noHp: string | null) => {
    if (!noHp) return "";

    let nomor = noHp.replace(/\D/g, "");

    if (nomor.startsWith("0")) {
      nomor = `62${nomor.substring(1)}`;
    }

    if (!nomor.startsWith("62")) {
      nomor = `62${nomor}`;
    }

    return nomor;
  };

  const kirimNotaWA = (order: SavedOrder) => {
    const nomorWA = formatNomorWA(order.no_hp);

    if (!nomorWA) {
      alert("Nomor HP pembeli tidak tersedia.");
      return;
    }

    const tanggal = new Date(order.created_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const detailProduk = order.pembelian_items
      .map(
        (item, index) =>
          `${index + 1}. ${item.nama_produk}\n   ${item.qty} x ${rupiah(
            item.harga,
          )} = ${rupiah(item.subtotal)}`,
      )
      .join("\n");

    const pesan = `Halo ${order.nama},

Berikut nota pesanan Anda:

No Pesanan: #${order.id}
Tanggal: ${tanggal}
Kasir: ${order.master_kasir?.nama_kasir || "-"}
Wilayah: ${order.tempat_penjualan?.nama_tempat || "-"}
Pembayaran: ${order.metode_pembayaran?.nama || "-"}

Detail Pesanan:
${detailProduk}

Total: ${rupiah(order.total)}

Terima kasih.`;

    const url = `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  };

  const handlePesan = async () => {
    if (!formData.nama || !formData.noHp || !formData.alamat) {
      alert("Lengkapi data pemesan");
      return;
    }

    if (!formData.namaKasirId) {
      alert("Pilih nama kasir");
      return;
    }

    if (!formData.tempatPenjualanId) {
      alert("Pilih tempat penjualan");
      return;
    }

    if (!formData.metodePembayaranId) {
      alert("Pilih metode pembayaran");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Pilih produk terlebih dahulu");
      return;
    }

    try {
      setSaving(true);

      const { data: pembelian, error: pembelianError } = await supabase
        .from("pembelian")
        .insert({
          nama: formData.nama,
          no_hp: formData.noHp,
          alamat: formData.alamat,
          catatan: formData.catatan,
          metode_pembayaran_id: Number(formData.metodePembayaranId),
          nama_kasir_id: Number(formData.namaKasirId),
          tempat_penjualan_id: Number(formData.tempatPenjualanId),
          total: totalHarga,
        })
        .select()
        .single();

      if (pembelianError) {
        console.error(
          "Gagal simpan pembelian:",
          JSON.stringify(pembelianError, null, 2),
        );
        alert(`${pembelianError.code}\n${pembelianError.message}`);
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
        console.error(
          "Gagal simpan item pembelian:",
          JSON.stringify(itemsError, null, 2),
        );
        alert("Pembelian tersimpan, tapi item gagal disimpan");
        return;
      }

      const savedItems: PembelianItem[] = items.map((item) => ({
        nama_produk: item.nama_produk,
        harga: item.harga,
        qty: item.qty,
        subtotal: item.subtotal,
      }));

      const savedOrder: SavedOrder = {
        id: pembelian.id,
        nama: pembelian.nama,
        no_hp: pembelian.no_hp,
        alamat: pembelian.alamat,
        catatan: pembelian.catatan,
        total: pembelian.total,
        created_at: pembelian.created_at,

        pembelian_items: savedItems,

        metode_pembayaran: selectedMetodePembayaran || null,

        master_kasir: selectedKasir
          ? {
              nama_kasir: selectedKasir.nama_kasir,
            }
          : null,

        tempat_penjualan: selectedTempat
          ? {
              nama_tempat: selectedTempat.nama_tempat,
            }
          : null,
      };

      setLastOrder(savedOrder);

      alert("Pesanan berhasil disimpan");

      setFormData({
        nama: "",
        noHp: "",
        alamat: "",
        catatan: "",
        metodePembayaranId: metodePembayaran[0]
          ? String(metodePembayaran[0].id)
          : "",
        namaKasirId: masterKasir[0] ? String(masterKasir[0].id) : "",
        tempatPenjualanId: tempatPenjualan[0]
          ? String(tempatPenjualan[0].id)
          : "",
      });

      setProducts((prev) =>
        prev.map((item) => ({
          ...item,
          quantity: 0,
        })),
      );

      onSuccess?.();
    } catch (error) {
      console.error("Error simpan pesanan:", error);
      alert("Terjadi kesalahan saat menyimpan pesanan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-3 py-4 pb-28 md:p-8">
      <div className="mb-5 rounded-3xl border bg-gray-50 p-4 md:p-6">
        <h2 className="mb-5 text-xl font-bold">NOTA</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <input
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="Konsumen"
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-red-500"
          />

          <input
            name="noHp"
            value={formData.noHp}
            onChange={handleChange}
            placeholder="No HP"
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-red-500"
          />

          <textarea
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            placeholder="Alamat"
            rows={3}
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-red-500 md:col-span-2"
          />

          <textarea
            name="catatan"
            value={formData.catatan}
            onChange={handleChange}
            placeholder="Catatan"
            rows={2}
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-red-500 md:col-span-2"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-2 font-medium">
              <UserRound className="text-red-600" size={20} />
              <span>Karyawan</span>
            </div>

            <select
              name="namaKasirId"
              value={formData.namaKasirId}
              onChange={handleChange}
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">Pilih Nama Kasir</option>
              {masterKasir.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_kasir}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-2 font-medium">
              <UserRound className="text-red-600" size={20} />
              <span>Wilayah</span>
            </div>

            <select
              name="tempatPenjualanId"
              value={formData.tempatPenjualanId}
              onChange={handleChange}
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">Pilih Tempat Penjualan</option>
              {tempatPenjualan.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_tempat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Wallet className="text-red-600" size={18} />
            Metode Pembayaran
          </h3>

          {metodePembayaran.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada metode pembayaran aktif.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  className={`rounded-2xl border p-4 text-left transition ${
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
                        className="h-14 w-14 rounded-xl border bg-white object-contain"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
                        <Wallet size={22} className="text-gray-400" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-bold">{item.nama}</p>

                      {item.nomor && (
                        <p className="break-all text-xs text-gray-500">
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

      {lastOrder && (
        <div className="mb-5 rounded-3xl border border-green-200 bg-green-50 p-4">
          <p className="font-bold text-green-800">
            Pesanan terakhir berhasil disimpan: #{lastOrder.id}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => cetakPDF(lastOrder)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Printer size={18} />
              Cetak Nota
            </button>

            <button
              type="button"
              onClick={() => kirimNotaWA(lastOrder)}
              disabled={!lastOrder.no_hp}
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
              Kirim WA
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex overflow-hidden rounded-2xl border bg-white transition sm:flex-col ${
                    product.quantity > 0 ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <div className="h-28 w-28 shrink-0 bg-gray-100 sm:h-48 sm:w-full">
                    <img
                      src={product.image_url}
                      alt={product.judul}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <p className="text-xs text-red-500">{product.category}</p>

                      <h3 className="line-clamp-2 text-sm font-bold sm:text-base">
                        {product.judul}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-red-600">
                        {rupiah(product.harga)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-100 p-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, "minus")}
                        className="h-9 w-9 rounded-lg bg-red-100 text-lg font-bold text-red-600"
                      >
                        −
                      </button>

                      <span className="font-bold">{product.quantity}</span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, "plus")}
                        className="h-9 w-9 rounded-lg bg-green-100 text-lg font-bold text-green-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-4 rounded-2xl border bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-lg font-bold">Ringkasan Pesanan</h3>

              {selectedProducts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada produk dipilih
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <p className="text-sm font-medium">{item.judul}</p>

                      <div className="flex justify-between gap-2 text-xs text-gray-500">
                        <span>
                          {item.quantity} x {rupiah(item.harga)}
                        </span>

                        <span>{rupiah(item.quantity * item.harga)}</span>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-red-600">
                      <span>Total</span>
                      <span>{rupiah(totalHarga)}</span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {selectedMetodePembayaran?.nama ||
                        "Belum pilih pembayaran"}
                    </div>

                    <button
                      type="button"
                      onClick={handlePesan}
                      disabled={saving}
                      className="mt-4 w-full rounded-xl bg-red-600 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Menyimpan..." : "Pesan Sekarang"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-3 shadow-2xl lg:hidden">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    {selectedProducts.length} produk dipilih
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {rupiah(totalHarga)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePesan}
                  disabled={saving}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Simpan..." : "Pesan"}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Pembayaran:{" "}
                {selectedMetodePembayaran?.nama || "Belum pilih pembayaran"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

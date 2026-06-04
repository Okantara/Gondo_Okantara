import { useEffect, useState } from "react";
import { KasirNavbar } from "./KasirNavbar";
import { Order } from "./Order";
import { supabase } from "../../lib/supabase";
import { cetakPDF } from "../../lib/printUtils";

interface OrderItem {
  id: number;
  nama: string;
  no_hp: string | null;
  alamat: string | null;
  catatan: string | null;
  total: number;
  created_at: string;
  metode_pembayaran_id: number | null;

  pembelian_items: {
    id: number;
    pembelian_id: number;
    katalog_id: number | null;
    nama_produk: string;
    harga: number;
    qty: number;
    subtotal: number;
  }[];

  metode_pembayaran?: {
    id: number;
    nama: string;
    gambar: string | null;
    nomor: string | null;
    atas_nama: string | null;
  } | null;
}

export function KasirDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);

  useEffect(() => {
    fetchPembelian();
  }, []);

  const formatRupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const hitungStatistikPenjualan = (ordersData: OrderItem[]) => {
    const now = new Date();

    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);

    const startWeek = new Date(now);
    startWeek.setDate(now.getDate() - now.getDay());
    startWeek.setHours(0, 0, 0, 0);

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startMonth.setHours(0, 0, 0, 0);

    const totalTodayValue = ordersData
      .filter((item) => new Date(item.created_at) >= startToday)
      .reduce((sum, item) => sum + Number(item.total || 0), 0);

    const totalWeekValue = ordersData
      .filter((item) => new Date(item.created_at) >= startWeek)
      .reduce((sum, item) => sum + Number(item.total || 0), 0);

    const totalMonthValue = ordersData
      .filter((item) => new Date(item.created_at) >= startMonth)
      .reduce((sum, item) => sum + Number(item.total || 0), 0);

    setTotalToday(totalTodayValue);
    setTotalWeek(totalWeekValue);
    setTotalMonth(totalMonthValue);
  };

  const fetchPembelian = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("pembelian")
        .select(
          `
          *,
          metode_pembayaran:metode_pembayaran_id (
            id,
            nama,
            gambar,
            nomor,
            atas_nama
          ),
          pembelian_items (
            id,
            pembelian_id,
            katalog_id,
            nama_produk,
            harga,
            qty,
            subtotal
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ordersData = (data || []) as OrderItem[];

      setOrders(ordersData);
      hitungStatistikPenjualan(ordersData);
    } catch (error) {
      console.error("Gagal mengambil data pembelian:", error);
      setOrders([]);
      setTotalToday(0);
      setTotalWeek(0);
      setTotalMonth(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <KasirNavbar title="Kasir Dashboard" />

      <div className="pt-24 p-6">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Arsip Nota</h1>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="min-w-[160px] rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-xs font-medium text-green-600">
                  Penjualan Hari Ini
                </p>
                <p className="text-xl font-bold text-green-700">
                  {formatRupiah(totalToday)}
                </p>
              </div>

              <div className="min-w-[160px] rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-xs font-medium text-blue-600">Minggu Ini</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatRupiah(totalWeek)}
                </p>
              </div>

              <div className="min-w-[160px] rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                <p className="text-xs font-medium text-purple-600">Bulan Ini</p>
                <p className="text-xl font-bold text-purple-700">
                  {formatRupiah(totalMonth)}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">Belum ada pesanan</p>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              <div className="min-w-[850px]">
                <div className="grid grid-cols-[2fr_1.2fr_1.5fr_1.2fr_auto] items-center gap-4 rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700">
                  <div>Nama</div>
                  <div>Tanggal</div>
                  <div>No HP</div>
                  <div>Total</div>
                  <div className="text-center">Aksi</div>
                </div>

                <div className="mt-2 space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="grid grid-cols-[2fr_1.2fr_1.5fr_1.2fr_auto] items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm transition hover:shadow-md"
                    >
                      <div className="font-medium text-gray-800">
                        {order.nama}
                      </div>

                      <div className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>

                      <div className="text-gray-500">{order.no_hp || "-"}</div>

                      <div className="font-bold text-red-600">
                        {formatRupiah(order.total)}
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={() => cetakPDF(order)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          Cetak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>

            <Order
              onSuccess={() => {
                setShowForm(false);
                fetchPembelian();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

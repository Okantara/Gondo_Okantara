import { useEffect, useState } from "react";
import { KasirNavbar } from "./KasirNavbar";
import { Order } from "./Order";
import { supabase } from "../../lib/supabase";
import { getImageUrl } from "../../lib/imageUtils";

interface OrderItem {
  id: number;
  nama: string;
  no_hp: string | null;
  alamat: string | null;
  catatan: string | null;
  total: number;
  created_at: string;
  metode_pembayaran_id: number;

  metode_pembayaran?: {
    id: number;
    nama: string;
    gambar: string | null;
    nomor: string | null;
    atas_nama: string | null;
  };
}

export function KasirDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPembelian();
  }, []);

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
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Gagal mengambil data pembelian:", error);
    } finally {
      setLoading(false);
    }
  };

  const tambahPesanan = () => {
    setShowForm(true);
  };

  const hapusPesanan = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus pesanan ini?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("pembelian").delete().eq("id", id);

    if (error) {
      console.error("Gagal menghapus pesanan:", error);
      alert("Gagal menghapus pesanan");
      return;
    }

    fetchPembelian();
  };

  const cetakPDF = (order: OrderItem) => {
    const metode = order.metode_pembayaran;

    const paymentImageUrl = metode?.gambar ? getImageUrl(metode.gambar) : "";

    const tanggal = new Date(order.created_at).toLocaleString("id-ID");

    const total = Number(order.total).toLocaleString("id-ID");

    const tanggalFile = new Date(order.created_at)
      .toLocaleDateString("id-ID")
      .replace(/\//g, "-");

    const namaPelanggan = (order.nama || "Pelanggan")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const namaFile = `Pesanan-${order.id}-${namaPelanggan}-${tanggalFile}`;

    const printWindow = window.open("", namaFile);

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${namaFile}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 30px;
              color: #111827;
              background: #ffffff;
            }

            .receipt {
              max-width: 420px;
              margin: 0 auto;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 24px;
            }

            .header {
              text-align: center;
              border-bottom: 1px dashed #d1d5db;
              padding-bottom: 16px;
              margin-bottom: 18px;
            }

            .header h1 {
              margin: 0;
              color: #dc2626;
              font-size: 24px;
            }

            .header p {
              margin: 6px 0 0;
              font-size: 13px;
              color: #6b7280;
            }

            .section {
              margin-bottom: 18px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              margin-bottom: 10px;
              font-size: 14px;
            }

            .label {
              color: #6b7280;
              min-width: 110px;
            }

            .value {
              font-weight: 600;
              text-align: right;
              word-break: break-word;
            }

            .payment-box {
              text-align: center;
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              padding: 14px;
              margin: 20px 0;
            }

            .payment-title {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 10px;
            }

            .payment-box img {
              width: 350px;
              max-width: 100%;
              height: auto;
              object-fit: contain;
              margin: 12px auto;
              display: block;
            }

            .payment-name {
              font-weight: bold;
              font-size: 15px;
              margin-bottom: 6px;
            }

            .payment-info {
              font-size: 13px;
              color: #374151;
              margin: 4px 0;
            }

            .total-box {
              border-top: 1px dashed #d1d5db;
              padding-top: 16px;
              margin-top: 18px;
              text-align: center;
            }

            .total-label {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 6px;
            }

            .total {
              color: #dc2626;
              font-size: 26px;
              font-weight: bold;
            }

            .footer {
              margin-top: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }

            @page {
              margin: 10mm;
            }

            @media print {
              body {
                padding: 0;
              }

              .receipt {
                border: none;
                border-radius: 0;
                max-width: 100%;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt">
            <div class="header">
              <h1>Struk Pesanan</h1>
              <p>${tanggal}</p>
            </div>

            <div class="section">
              <div class="row">
                <span class="label">ID Pesanan</span>
                <span class="value">#${order.id}</span>
              </div>

              <div class="row">
                <span class="label">Nama</span>
                <span class="value">${order.nama}</span>
              </div>

              <div class="row">
                <span class="label">No HP</span>
                <span class="value">${order.no_hp || "-"}</span>
              </div>

              <div class="row">
                <span class="label">Alamat</span>
                <span class="value">${order.alamat || "-"}</span>
              </div>

              <div class="row">
                <span class="label">Catatan</span>
                <span class="value">${order.catatan || "-"}</span>
              </div>
            </div>

            ${
              metode
                ? `
                  <div class="payment-box">
                    <div class="payment-title">Metode Pembayaran</div>

                    ${
                      paymentImageUrl
                        ? `<img src="${paymentImageUrl}" alt="${metode.nama}" />`
                        : ""
                    }

                    <div class="payment-name">${metode.nama}</div>

                    ${
                      metode.nomor
                        ? `<p class="payment-info">No: ${metode.nomor}</p>`
                        : ""
                    }

                    ${
                      metode.atas_nama
                        ? `<p class="payment-info">A/N: ${metode.atas_nama}</p>`
                        : ""
                    }
                  </div>
                `
                : ""
            }

            <div class="total-box">
              <div class="total-label">Total Pembayaran</div>
              <div class="total">Rp ${total}</div>
            </div>

            <div class="footer">
              Terima kasih atas pesanan Anda
            </div>
          </div>

          <script>
            window.onload = function () {
              document.title = "${namaFile}";
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <KasirNavbar title="Kasir Dashboard" />

      <div className="pt-24 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  List Pesanan Pembeli
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Kelola pesanan pelanggan dengan mudah
                </p>
              </div>

              <button
                onClick={tambahPesanan}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-medium transition"
              >
                Tambah Pesanan
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <p className="text-center text-gray-500 py-20">Loading...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition"
                    >
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {order.nama}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          No HP: {order.no_hp || "-"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Tanggal:{" "}
                          {new Date(order.created_at).toLocaleString("id-ID")}
                        </p>

                        <p className="text-lg font-bold text-red-600 mt-2">
                          Rp {Number(order.total).toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => cetakPDF(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
                        >
                          Cetak PDF
                        </button>

                        <button
                          onClick={() => hapusPesanan(order.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl relative shadow-2xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold transition"
            >
              ✕
            </button>

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

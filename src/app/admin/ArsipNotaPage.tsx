import { useEffect, useState } from "react";
import { Download, Printer, Search, ArrowUpDown, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface Pembelian {
  id: string;
  kode_pesanan: string;
  total: number;
  metode_pembayaran: string;
  status_pembayaran: string;
  created_at: string;
  detail_pesanan?: Array<{ product_name: string; quantity: number }>;
}

export function ArsipNotaPage() {
  const [pembelianData, setPembelianData] = useState<Pembelian[]>([]);
  const [filteredData, setFilteredData] = useState<Pembelian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  useEffect(() => {
    fetchPembelianData();
  }, []);

  const fetchPembelianData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pembelian")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      setPembelianData(data || []);
      setFilteredData(data || []);
      // Set default month to current month
      const now = new Date();
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
      setSelectedMonth(currentMonth);
    } catch (error) {
      console.error("Gagal mengambil data pembelian:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [searchTerm, selectedMonth, sortOrder, pembelianData]);

  const filterData = () => {
    let filtered = pembelianData;

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter((item) => {
        const date = new Date(item.created_at);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return month === selectedMonth;
      });
    }

    // Filter by search term (kode pesanan or total)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.kode_pesanan?.toLowerCase().includes(lowerSearch) ||
          item.total?.toString().includes(searchTerm),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredData(filtered);
  };

  const formatRupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMonthLabel = () => {
    const month = months.find((m) => m.value === selectedMonth);
    return month ? month.label : "";
  };

  const handlePrint = (item: Pembelian) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Nota Penjualan - ${item.kode_pesanan}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .details { margin-bottom: 15px; }
              .details-row { display: flex; margin: 5px 0; }
              .label { width: 150px; font-weight: bold; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
              .total { text-align: right; margin-top: 20px; font-weight: bold; font-size: 16px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>NOTA PENJUALAN</h2>
            </div>
            <div class="details">
              <div class="details-row">
                <span class="label">Kode Pesanan:</span>
                <span>${item.kode_pesanan}</span>
              </div>
              <div class="details-row">
                <span class="label">Tanggal:</span>
                <span>${formatDate(item.created_at)}</span>
              </div>
              <div class="details-row">
                <span class="label">Metode Pembayaran:</span>
                <span>${item.metode_pembayaran}</span>
              </div>
              <div class="details-row">
                <span class="label">Status Pembayaran:</span>
                <span>${item.status_pembayaran}</span>
              </div>
            </div>
            <div class="total">
              Total: ${formatRupiah(item.total)}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      "Kode Pesanan",
      "Tanggal",
      "Total",
      "Metode Pembayaran",
      "Status Pembayaran",
    ];
    const rows = filteredData.map((item) => [
      item.kode_pesanan,
      formatDate(item.created_at),
      item.total,
      item.metode_pembayaran,
      item.status_pembayaran,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nota-penjualan-${getMonthLabel()}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Arsip Nota Penjualan
        </h1>
        <p className="mt-2 text-gray-600">
          Kelola dan lihat semua nota penjualan
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Search size={20} className="text-gray-500" />
          <Input
            placeholder="Cari kode pesanan atau total..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowUpDown size={18} />
            {sortOrder === "asc" ? "Lama → Baru" : "Baru → Lama"}
          </Button>
          <Button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Pesanan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Tidak ada data untuk bulan yang dipilih
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.kode_pesanan}
                    </TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatRupiah(item.total)}
                    </TableCell>
                    <TableCell>{item.metode_pembayaran}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          item.status_pembayaran === "Lunas"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status_pembayaran}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handlePrint(item)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        <Printer size={16} />
                        Cetak
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      {filteredData.length > 0 && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">
              Total Penjualan {getMonthLabel()}:
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {formatRupiah(
                filteredData.reduce((sum, item) => sum + (item.total || 0), 0),
              )}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {filteredData.length} transaksi ditemukan
          </p>
        </div>
      )}
    </div>
  );
}

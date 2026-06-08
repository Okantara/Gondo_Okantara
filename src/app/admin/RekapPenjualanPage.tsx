import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Calendar, DollarSign, ShoppingCart } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface Pembelian {
  id: string;
  total: number;
  metode_pembayaran: string;
  status_pembayaran: string;
  created_at: string;
}

interface DailySales {
  tanggal: string;
  total: number;
  jumlahTransaksi: number;
}

interface PaymentMethodSales {
  metode: string;
  jumlah: number;
}

export function RekapPenjualanPage() {
  const [pembelianData, setPembelianData] = useState<Pembelian[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [loading, setLoading] = useState(true);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSales[]>(
    [],
  );
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [avgTransaction, setAvgTransaction] = useState(0);

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

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
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
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      setPembelianData(data || []);
    } catch (error) {
      console.error("Gagal mengambil data pembelian:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeData();
  }, [selectedYear, selectedMonth, pembelianData]);

  const analyzeData = () => {
    // Filter data by selected year and month
    const filtered = pembelianData.filter((item) => {
      const date = new Date(item.created_at);
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return year === selectedYear && month === selectedMonth;
    });

    // Calculate daily sales
    const dailyMap = new Map<string, { total: number; count: number }>();
    filtered.forEach((item) => {
      const date = new Date(item.created_at);
      const dateStr = date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { total: 0, count: 0 });
      }

      const current = dailyMap.get(dateStr)!;
      current.total += item.total || 0;
      current.count += 1;
    });

    const daily: DailySales[] = Array.from(dailyMap.entries()).map(
      ([tanggal, data]) => ({
        tanggal,
        total: data.total,
        jumlahTransaksi: data.count,
      }),
    );
    setDailySales(daily);

    // Calculate payment methods
    const paymentMap = new Map<string, number>();
    filtered.forEach((item) => {
      const method = item.metode_pembayaran || "Tidak Diketahui";
      paymentMap.set(method, (paymentMap.get(method) || 0) + (item.total || 0));
    });

    const payment: PaymentMethodSales[] = Array.from(paymentMap.entries()).map(
      ([metode, jumlah]) => ({
        metode,
        jumlah,
      }),
    );
    setPaymentMethods(payment);

    // Calculate totals
    const total = filtered.reduce((sum, item) => sum + (item.total || 0), 0);
    const count = filtered.length;
    setTotalSales(total);
    setTotalTransactions(count);
    setAvgTransaction(count > 0 ? total / count : 0);
  };

  const formatRupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const getMonthLabel = () => {
    const month = months.find((m) => m.value === selectedMonth);
    return month ? month.label : "";
  };

  const handleDownloadPDF = () => {
    // Create a simple text-based report that can be printed
    const reportContent = `
REKAP PENJUALAN ${getMonthLabel()} ${selectedYear}

========================================
RINGKASAN PENJUALAN
========================================
Total Penjualan    : ${formatRupiah(totalSales)}
Jumlah Transaksi   : ${totalTransactions}
Rata-rata Transaksi: ${formatRupiah(avgTransaction)}

========================================
PENJUALAN PER HARI
========================================
${dailySales
  .map(
    (day) =>
      `${day.tanggal}: ${formatRupiah(day.total)} (${day.jumlahTransaksi} transaksi)`,
  )
  .join("\n")}

========================================
PENJUALAN PER METODE PEMBAYARAN
========================================
${paymentMethods
  .map((pm) => `${pm.metode}: ${formatRupiah(pm.jumlah)}`)
  .join("\n")}

========================================
Generated on: ${new Date().toLocaleString("id-ID")}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-penjualan-${getMonthLabel()}-${selectedYear}.txt`;
    a.click();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rekap Penjualan</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tahun
          </label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bulan
          </label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
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

        <div className="flex items-end">
          <Button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download size={18} />
            Download Laporan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Penjualan</p>
              <p className="text-xl font-bold text-gray-900">
                {loading ? "..." : formatRupiah(totalSales)}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500 p-3">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jumlah Transaksi</p>
              <p className="text-xl font-bold text-gray-900">
                {loading ? "..." : totalTransactions}
              </p>
            </div>
            <div className="rounded-lg bg-green-500 p-3">
              <ShoppingCart className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Periode</p>
              <p className="text-xl font-bold text-gray-900">
                {getMonthLabel()} {selectedYear}
              </p>
            </div>
            <div className="rounded-lg bg-purple-500 p-3">
              <Calendar className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Daily Sales Chart */}
          {dailySales.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Penjualan Harian
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tanggal" angle={-45} textAnchor="end" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => formatRupiah(value)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="total" fill="#3B82F6" name="Total Penjualan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Payment Methods Chart */}
          {paymentMethods.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Penjualan per Metode Pembayaran
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    dataKey="jumlah"
                    nameKey="metode"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatRupiah(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {dailySales.length === 0 && !loading && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6 text-center">
          <p className="text-yellow-800">
            Tidak ada data penjualan untuk {getMonthLabel()} {selectedYear}
          </p>
        </div>
      )}
    </div>
  );
}

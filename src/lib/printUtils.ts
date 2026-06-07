import { getImageUrl } from "./imageUtils";
import logoDefault from "../assets/Logo_Pak_Gondo.png";
import { supabase } from "../lib/supabase";

interface PembelianItem {
  nama_produk: string;
  harga: number;
  qty: number;
  subtotal: number;
}

interface OrderItem {
  id: number;
  nama: string;
  no_hp: string | null;
  alamat: string | null;
  catatan: string | null;
  total: number;
  created_at: string;
  pembelian_items: PembelianItem[];

  metode_pembayaran?: {
    nama: string;
    gambar: string | null;
    nomor: string | null;
    atas_nama: string | null;
  } | null;

  master_kasir?: {
    nama_kasir: string;
  } | null;

  tempat_penjualan?: {
    nama_tempat: string;
  } | null;
}

export const cetakPDF = async (order: OrderItem) => {
  const metode = order.metode_pembayaran;

  const namaKasir = order.master_kasir?.nama_kasir || "Kasir";
  const namaTempat = order.tempat_penjualan?.nama_tempat || "Tulungagung";

  const paymentImageUrl = metode?.gambar ? getImageUrl(metode.gambar) : "";

  const tanggal = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(order.created_at));

  const total = Number(order.total).toLocaleString("id-ID");
  const namaFile = `Pesanan-${order.id}-${order.nama}-${tanggal}`;

  const { data } = await supabase
    .from("profile_data")
    .select("logo")
    .limit(1)
    .single();

  const logoUrl = data?.logo || logoDefault;
  const logoImageUrl = logoUrl ? getImageUrl(logoUrl) : logoDefault;

  const printWindow = window.open("", namaFile);
  if (!printWindow) return;

  const detailRows = order.pembelian_items
    .map((item) => {
      return `
        <tr>
          <td>${item.nama_produk}</td>
          <td style="text-align:center">${item.qty}</td>
          <td style="text-align:right">
            Rp ${Number(item.harga).toLocaleString("id-ID")}
          </td>
          <td style="text-align:right">
            Rp ${Number(item.subtotal).toLocaleString("id-ID")}
          </td>
        </tr>
      `;
    })
    .join("");

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
      padding: 20px;
      color: #111;
    }

    .logo {
      text-align: center;
      margin-bottom: 25px;
    }

    .logo img {
      max-width: 220px;
      height: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 8px;
      font-size: 13px;
    }

    .head {
      background: #dc2626;
      color: #fff;
    }

    .right {
      text-align: right;
    }

    .center {
      text-align: center;
    }

    .info-table {
      margin-bottom: 20px;
    }

    .info-table td {
      border: none;
      padding: 4px 0;
      vertical-align: top;
    }

    .info-label {
      width: 140px;
      font-weight: 600;
    }

    .info-separator {
      width: 15px;
      text-align: center;
    }

    .info-value {
      width: auto;
    }

    .product-table {
      margin-bottom: 30px;
    }

    .product-table th,
    .product-table td {
      border: 1px solid #ddd;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 30px;
    }

    .payment {
      width: 45%;
    }

    .signature {
      width: 45%;
      text-align: center;
      font-size: 13px;
    }

    .signature-name {
      margin-top: 60px;
      font-weight: bold;
    }

    @media print {
      body {
        padding: 10px;
      }
    }
  </style>
</head>

<body>
  <div class="logo">
    <img src="${logoImageUrl}" />
  </div>

  <table class="info-table">
    <tr>
      <td class="info-label">Nota</td>
      <td class="info-separator">:</td>
      <td class="info-value">
        PSN-${String(order.id).padStart(4, "0")}
      </td>
    </tr>

    <tr>
      <td class="info-label">Tanggal</td>
      <td class="info-separator">:</td>
      <td class="info-value">${tanggal}</td>
    </tr>

    <tr>
      <td class="info-label">Nama</td>
      <td class="info-separator">:</td>
      <td class="info-value">${order.nama}</td>
    </tr>

    <tr>
      <td class="info-label">No HP</td>
      <td class="info-separator">:</td>
      <td class="info-value">${order.no_hp || "-"}</td>
    </tr>

    <tr>
      <td class="info-label">Alamat</td>
      <td class="info-separator">:</td>
      <td class="info-value">${order.alamat || "-"}</td>
    </tr>

    ${
      order.catatan
        ? `
        <tr>
          <td class="info-label">Catatan</td>
          <td class="info-separator">:</td>
          <td class="info-value">${order.catatan}</td>
        </tr>
      `
        : ""
    }
  </table>

  <table class="product-table">
    <thead>
      <tr class="head">
        <th>Produk</th>
        <th width="80">Qty</th>
        <th width="150">Harga</th>
        <th width="150">Subtotal</th>
      </tr>
    </thead>

    <tbody>
      ${detailRows}

      <tr>
        <td colspan="3" class="right">
          <b>TOTAL</b>
        </td>
        <td class="right">
          <b>Rp ${total}</b>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    ${
      metode
        ? `
      <div class="payment">
        <table>
          <tr>
            <th colspan="2" class="head">
              ${metode.nama}
            </th>
          </tr>

          ${
            paymentImageUrl
              ? `
            <tr>
              <td colspan="2" class="center">
                <img src="${paymentImageUrl}" width="160" />
              </td>
            </tr>
          `
              : ""
          }

          ${
            metode.nomor
              ? `
            <tr>
              <td>Nomor</td>
              <td>${metode.nomor}</td>
            </tr>
          `
              : ""
          }

          ${
            metode.atas_nama
              ? `
            <tr>
              <td>Atas Nama</td>
              <td>${metode.atas_nama}</td>
            </tr>
          `
              : ""
          }
        </table>
      </div>
    `
        : `<div></div>`
    }

    <div class="signature">
      <div>${namaTempat}, ${tanggal}</div>
      <div style="margin-top:10px;">Kasir</div>

      <div class="signature-name">
        ${namaKasir}
      </div>
    </div>
  </div>

  <script>
    window.onload = () => {
    window.print();

    // setTimeout(() => {
    //   window.open(
    //     "https://wa.me/628123456789?text=Terima%20Kasih",
    //     "_blank"
    //   );
    // }, 1000);
  };
  </script>
</body>
</html>
`);

  printWindow.document.close();
};

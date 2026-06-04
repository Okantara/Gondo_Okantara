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
  };

  nama_kasir?: string;
}

export const cetakPDF = async (order: OrderItem) => {
  const metode = order.metode_pembayaran;

  const paymentImageUrl = metode?.gambar ? getImageUrl(metode.gambar) : "";

  const tanggal = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(order.created_at));

  const total = Number(order.total).toLocaleString("id-ID");
  const namaFile = `Pesanan-${order.id}-${order.nama}-${tanggal}`;

  // 🔥 AMBIL LOGO DARI DATABASE
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
    *{
      box-sizing:border-box;
    }

    body{
      font-family: Arial, sans-serif;
      padding:20px;
      color:#111;
    }

    .logo{
      text-align:center;
      margin-bottom:25px;
    }

    .logo img{
      max-width:220px;
      height:auto;
    }

    table{
      width:100%;
      border-collapse:collapse;
    }

    th,
    td{
      padding:8px;
      font-size:13px;
      border:1px solid #ddd;
    }

    .head{
      background:#dc2626;
      color:#fff;
    }

    .right{
      text-align:right;
    }

    .center{
      text-align:center;
    }

    .info-table{
      margin-bottom:20px;
    }

    .product-table{
      margin-bottom:30px;
    }

    .footer{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      margin-top:30px;
    }

    .payment{
      width:45%;
    }

    .signature{
      width:45%;
      text-align:center;
      font-size:13px;
    }

    .signature-name{
      margin-top:60px;
      font-weight:bold;
    }

    @media print{
      body{
        padding:10px;
      }
    }
  </style>
</head>

<body>

  <div class="logo">
    <img src="${logoImageUrl}" />
  </div>

  <!-- INFORMASI PEMBELI -->
  <table class="info-table">

    <tr>
      <td width="30%">Nota</td>
      <td>PSN-${String(order.id).padStart(4, "0")}</td>
    </tr>

    <tr>
      <td>Nama</td>
      <td>${order.nama}</td>
    </tr>

    <tr>
      <td>No HP</td>
      <td>${order.no_hp || "-"}</td>
    </tr>

    <tr>
      <td>Alamat</td>
      <td>${order.alamat || "-"}</td>
    </tr>

    ${
      order.catatan
        ? `
      <tr>
        <td>Catatan</td>
        <td>${order.catatan}</td>
      </tr>
    `
        : ""
    }
  </table>

  <!-- DETAIL PRODUK -->
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

  <!-- FOOTER -->
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
                <img
                  src="${paymentImageUrl}"
                  width="160"
                />
              </td>
            </tr>
          `
              : ""
          }

          ${
            metode.nomor
              ? `
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
      <div>Tulungagung, ${tanggal}</div>
      <div style="margin-top:10px;">Kasir</div>

      <div class="signature-name">
        ${order.nama_kasir || "Kasir"}
      </div>
    </div>

  </div>

  <script>
    window.onload = () => {
      window.print();
    };
  </script>

</body>
</html>
`);

  printWindow.document.close();
};

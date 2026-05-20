import { useEffect, useState } from "react";
import { Eye, X, Phone, Mail, MapPin, User, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Partner {
  id: number;
  nama_lengkap: string;
  whatsapp: string;
  email: string;
  alamat: string;
  created_at: string;
}

export function MitraPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getPartners();
  }, []);

  async function getPartners() {
    const { data, error } = await supabase
      .from("kontak")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data mitra:", error);
      return;
    }

    setPartners(data || []);
  }

  const filteredPartners = partners.filter((p) => {
    const q = searchQuery.toLowerCase();

    return (
      p.nama_lengkap.toLowerCase().includes(q) ||
      p.whatsapp.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.alamat.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Data Mitra
        </h1>
        <p className="text-gray-600 text-sm">
          Kelola data mitra yang terdaftar
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />

        <input
          type="text"
          placeholder="Cari nama, no HP, atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-sm p-4 space-y-3 hover:shadow-md transition"
          >
            <div className="flex items-center gap-2">
              <User className="text-blue-600" size={18} />
              <h2 className="font-semibold text-gray-900">{p.nama_lengkap}</h2>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                {p.whatsapp}
              </div>

              <div className="flex items-center gap-2">
                <Mail size={14} />
                {p.email}
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-1" />
                <span>{p.alamat}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-400">
                Join: {new Date(p.created_at).toLocaleDateString("id-ID")}
              </span>

              <button
                onClick={() => setSelectedPartner(p)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <p className="text-center text-gray-500 py-10">Belum ada data mitra.</p>
      )}

      {selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Detail Mitra</h2>
              <button onClick={() => setSelectedPartner(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-medium">Nama:</span>{" "}
                {selectedPartner.nama_lengkap}
              </p>

              <p>
                <span className="font-medium">WhatsApp:</span>{" "}
                {selectedPartner.whatsapp}
              </p>

              <p>
                <span className="font-medium">Email:</span>{" "}
                {selectedPartner.email}
              </p>

              <p>
                <span className="font-medium">Alamat:</span>{" "}
                {selectedPartner.alamat}
              </p>

              <p>
                <span className="font-medium">Tanggal Join:</span>{" "}
                {new Date(selectedPartner.created_at).toLocaleDateString(
                  "id-ID",
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

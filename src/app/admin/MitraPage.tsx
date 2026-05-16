import { useState } from "react";
import { Eye, X, Phone, Mail, MapPin, User, Search } from "lucide-react";

interface Partner {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;
}

export function MitraPage() {
  const [partners] = useState<Partner[]>([
    {
      id: "MIT-001",
      fullName: "Budi Santoso",
      phone: "081234567890",
      email: "budi@email.com",
      address: "Jl. Sudirman No. 123, Jakarta Selatan",
      joinDate: "2026-05-12",
    },
    {
      id: "MIT-002",
      fullName: "Siti Aminah",
      phone: "081298765432",
      email: "siti@email.com",
      address: "Surabaya, Jawa Timur",
      joinDate: "2026-05-10",
    },
    {
      id: "MIT-003",
      fullName: "Andi Pratama",
      phone: "081255544433",
      email: "andi@email.com",
      address: "Bandung, Jawa Barat",
      joinDate: "2026-05-08",
    },
  ]);

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // FILTER SEARCH
  const filteredPartners = partners.filter((p) => {
    const q = searchQuery.toLowerCase();

    return (
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Data Mitra
        </h1>
        <p className="text-gray-600 text-sm">
          Kelola data mitra yang terdaftar
        </p>
      </div>

      {/* SEARCH */}
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

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-sm p-4 space-y-3 hover:shadow-md transition"
          >
            <div className="flex items-center gap-2">
              <User className="text-blue-600" size={18} />
              <h2 className="font-semibold text-gray-900">{p.fullName}</h2>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                {p.phone}
              </div>

              <div className="flex items-center gap-2">
                <Mail size={14} />
                {p.email}
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-1" />
                <span>{p.address}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-400">Join: {p.joinDate}</span>

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

      {/* MODAL */}
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
                {selectedPartner.fullName}
              </p>

              <p>
                <span className="font-medium">WhatsApp:</span>{" "}
                {selectedPartner.phone}
              </p>

              <p>
                <span className="font-medium">Email:</span>{" "}
                {selectedPartner.email}
              </p>

              <p>
                <span className="font-medium">Alamat:</span>{" "}
                {selectedPartner.address}
              </p>

              <p>
                <span className="font-medium">Tanggal Join:</span>{" "}
                {selectedPartner.joinDate}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

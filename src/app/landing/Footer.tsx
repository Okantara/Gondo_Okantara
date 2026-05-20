import { useEffect, useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

interface ProfileData {
  business_name: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  description: string;
  facebook: string;
  instagram: string;
}

/* FORMAT WHATSAPP NUMBER */
const formatWhatsApp = (number: string = "") => {
  let cleaned = number.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  if (cleaned.startsWith("62")) {
    return cleaned;
  }

  return "62" + cleaned;
};

/* FORMAT URL SOSMED */
const normalizeUrl = (url: string = "") => {
  if (!url) return "#";

  // kalau sudah ada http / https → biarkan
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // kalau tidak ada protocol → tambahkan https://
  return `https://${url}`;
};

export function Footer() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("profile_data")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setProfile(data);
    };

    fetchData();
  }, []);

  return (
    <footer className="bg-linear-to-br from-[#3D2317] to-[#1F1108] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-5">
          {/* BRAND */}
          <div>
            <h3 className="text-3xl text-[#E31E24] mb-4 text-center">
              {profile?.business_name || "Business Name"}
            </h3>

            <p className="text-gray-300 text-justify">
              {profile?.description || "Deskripsi bisnis belum tersedia."}
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-xl mb-4 text-center">Hubungi Kami</h4>

            <div className="space-y-3">
              {/* WHATSAPP */}
              <div className="flex gap-3">
                <Phone size={20} className="text-[#E31E24] mt-1" />
                <div>
                  <p className="text-gray-300">WhatsApp</p>

                  <a
                    href={`https://wa.me/${formatWhatsApp(profile?.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E31E24]"
                  >
                    {profile?.whatsapp || "-"}
                  </a>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="flex gap-3">
                <MapPin size={20} className="text-[#E31E24] mt-1" />
                <div>
                  <p className="text-gray-300">Lokasi</p>

                  <p>
                    {profile?.address} {profile?.city} {profile?.postal_code}{" "}
                    {""} {profile?.province}
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex gap-3">
                <Mail size={20} className="text-[#E31E24] mt-1" />
                <div>
                  <p className="text-gray-300">Email</p>

                  <a
                    href={`mailto:${profile?.email || ""}`}
                    className="hover:text-[#E31E24]"
                  >
                    {profile?.email || "-"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="text-xl mb-4 text-center">Ikuti Kami</h4>

            <div className="flex gap-4 justify-center">
              {/* FACEBOOK */}
              <a
                href={normalizeUrl(profile?.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#E31E24] rounded-full flex items-center justify-center hover:bg-[#C11A1F] transition"
              >
                <FaFacebook size={24} />
              </a>

              {/* INSTAGRAM */}
              <a
                href={normalizeUrl(profile?.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#E31E24] rounded-full flex items-center justify-center hover:bg-[#C11A1F] transition"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="border-t border-gray-700 pt-2 text-center">
          <p className="text-gray-400">
            &copy; 2026 {profile?.business_name || "Business"}
          </p>
        </div>
      </div>
    </footer>
  );
}

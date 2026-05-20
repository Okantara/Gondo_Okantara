import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ProfileData {
  business_name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  description: string;
}

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
    <footer className="bg-linear-to-br from-[#1F1108] to-[#F5ED0F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-5">
          {/* BRAND */}
          <div className="">
            <h3 className="text-3xl text-white mb-4 text-center">
              {profile?.business_name || "Business Name"}
            </h3>

            <p className="text-gray-300 text-justify">
              {profile?.description || "Deskripsi bisnis belum tersedia."}
            </p>
          </div>

          {/* CONTACT */}
          <div className="flex items-center justify-center">
            <div className="space-y-3">
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
            </div>
          </div>

          {/* SOCIAL */}
        </div>

        {/* FOOTER BOTTOM */}
        <div className="border-t border-gray-700 pt-2 text-center">
          <p className="text-white">
            &copy; 2026 {profile?.business_name || "Business"}
          </p>
        </div>
      </div>
    </footer>
  );
}

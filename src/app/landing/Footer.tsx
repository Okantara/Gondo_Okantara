import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-linear-to-br from-[#3D2317] to-[#1F1108] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-5">
          <div>
            <h3 className="text-3xl text-[#E31E24] mb-4 text-center">
              Pak Gondo
            </h3>
            <p className="text-gray-300 mb-4 text-justify">
              Produsen abon dan sambal khas Tulungagung sejak 2010. Menyajikan
              cita rasa tradisional dengan kualitas premium.
            </p>
          </div>

          <div>
            <h4 className="text-xl mb-4 text-center">Hubungi Kami</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#E31E24] mt-1 shrink-0" />
                <div>
                  <p className="text-gray-300">WhatsApp</p>
                  <a
                    href="https://wa.me/6285630300012"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#E31E24] transition-colors"
                  >
                    0856-3030-0012
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#E31E24] mt-1 shrink-0" />
                <div>
                  <p className="text-gray-300">Lokasi</p>
                  <p className="text-white">Tulungagung, Jawa Timur</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-[#E31E24] mt-1 shrink-0" />
                <div>
                  <p className="text-gray-300">Email</p>
                  <a
                    href="mailto:pakgondo@example.com"
                    className="text-white hover:text-[#E31E24] transition-colors"
                  >
                    pakgondo@example.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl mb-4 text-center">Ikuti Kami</h4>
            <div className="flex gap-4 justify-center">
              <a
                href="#"
                className="w-12 h-12 bg-[#E31E24] rounded-full flex items-center justify-center hover:bg-[#C11A1F] transition-colors"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-[#E31E24] rounded-full flex items-center justify-center hover:bg-[#C11A1F] transition-colors"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-2 text-center">
          <p className="text-gray-400">
            &copy; 2026 Pak Gondo - Abon & Sambal Tulungagung. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

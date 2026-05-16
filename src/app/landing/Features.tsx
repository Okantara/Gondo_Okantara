import { Leaf, ShieldCheck, Award, MapPin } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Kaya Protein",
    description:
      "Sumber protein hewani berkualitas tinggi untuk nutrisi keluarga",
  },
  {
    icon: ShieldCheck,
    title: "Produk Halal",
    description:
      "Tersertifikasi halal MUI dan diproduksi dengan standar kebersihan",
  },
  {
    icon: Award,
    title: "Tanpa Pengawet Berbahaya",
    description: "100% alami tanpa bahan kimia berbahaya untuk kesehatan",
  },
  {
    icon: MapPin,
    title: "Khas Tulungagung",
    description: "Produk asli Jawa Timur dengan cita rasa tradisional autentik",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-linear-to-br from-[#FFF8F0] to-white border border-[#FFE8D6] hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E31E24] text-white rounded-full mb-4">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

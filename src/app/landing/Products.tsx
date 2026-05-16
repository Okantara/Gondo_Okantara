import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ShoppingBag } from "lucide-react";

const products = [
  {
    name: "Abon Ayam",
    description: "Abon ayam pilihan dengan bumbu rempah khas Jawa Timur",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo abon ayam.png",
    category: "Abon",
  },
  {
    name: "Abon Sapi",
    description: "Abon sapi berkualitas tinggi dengan tekstur lembut dan gurih",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo abon sapi.png",
    category: "Abon",
  },
  {
    name: "Abon Ikan Tuna",
    description: "Abon ikan tuna kaya omega-3 untuk nutrisi optimal",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo abon Tuna.png",
    category: "Abon",
  },
  {
    name: "Abon Ikan Salmon",
    description: "Abon ikan salmon premium dengan kandungan omega-3 tinggi",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo abon salmon.png",
    category: "Abon",
  },
  {
    name: "Abon Ikan Lele",
    description: "Abon ikan lele segar dengan cita rasa gurih khas",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo abon Lele.png",
    category: "Abon",
  },
  {
    name: "Abon Ikan Patin",
    description: "Abon ikan patin lembut dan bergizi tinggi",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo abon Patin.png",
    category: "Abon",
  },
  {
    name: "Sambal Bawang",
    description: "Sambal dengan campuran bawang goreng, pedas nikmat",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo Sambal Bawang.png",
    category: "Sambal",
  },
  {
    name: "Sambal Ikan Teri",
    description: "Sambal teri dengan ikan teri pilihan, renyah dan pedas",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo Sambal Ikan Teri.png",
    category: "Sambal",
  },
  {
    name: "Sambal Hijau",
    description: "Sambal hijau dengan kepedasan original yang menggugah selera",
    image: "/Foto_Produk_Pak_Gondo/Foto_Produk_Pak_Gondo_Sambal_Hijau.png",
    category: "Sambal",
  },
  {
    name: "Sambal Cumi",
    description: "Sambal cumi dengan potongan cumi segar, pedas gurih",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo Sambal Cumi.png",
    category: "Sambal",
  },
  {
    name: "Sambal Ikan Tuna",
    description: "Sambal ikan tuna pedas dengan protein tinggi",
    image: "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo Sambal Ikan Tuna.png",
    category: "Sambal",
  },
  {
    name: "Sambal Ikan Salmon",
    description: "Sambal ikan salmon premium dengan rasa pedas yang nikmat",
    image:
      "/Foto_Produk_Pak_Gondo/Foto Produk Pak Gondo Sambal Ikan Salmon.png",
    category: "Sambal",
  },
];

export function Products() {
  return (
    <section
      id="katalog"
      className="py-20 bg-linear-to-br from-[#FFF8F0] to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">
            Katalog Produk
          </h2>
          <p className="text-xl text-gray-600">
            Pilihan lengkap abon dan sambal berkualitas premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
            >
              <div className="relative h-64 overflow-hidden bg-white">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#E31E24] text-white px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-2 text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <a
                  href="https://wa.me/6285630300012"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#E31E24] text-white px-6 py-3 rounded-lg hover:bg-[#C11A1F] transition-colors"
                >
                  <ShoppingBag size={20} />
                  Pesan Sekarang
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

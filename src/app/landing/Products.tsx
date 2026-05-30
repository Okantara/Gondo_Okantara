import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../../lib/supabase";

interface Product {
  id: number;
  image_url: string;
  judul: string;
  deskripsi: string;
  category: string;
  harga: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("katalog")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("Gagal mengambil katalog:", error);
      return;
    }

    setProducts((data || []) as Product[]);
  };

  return (
    <section
      id="katalog"
      className="py-20 bg-linear-to-br from-[#FFF8F0] to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-4 font-berkshire">
            Produk
          </h2>
          <p className="text-xl text-gray-600">Aneka Abon & Sambal Pak Gondo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col h-full"
            >
              {/* IMAGE */}
              <div className="relative h-64 overflow-hidden bg-white">
                <ImageWithFallback
                  src={product.image_url}
                  alt={product.judul}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4">
                  <span className="bg-red-500/50 text-white px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl mb-2 text-gray-900 line-clamp-2">
                  {product.judul}
                </h3>

                <p className="text-gray-600 line-clamp-3 min-h-[1px] text-justify mb-1">
                  {product.deskripsi}
                </p>

                <p className="text-2xl font-bold text-red-600">
                  Rp {(product.harga || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

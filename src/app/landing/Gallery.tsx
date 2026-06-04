import { useEffect, useState } from "react";
import Masonry from "react-responsive-masonry";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../../lib/supabase";

type GalleryImage = {
  id: number;
  src: string;
  alt: string;
};

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    getGallery();
  }, []);

  async function getGallery() {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengambil data gallery:", error);
      return;
    }

    setGalleryImages(data);
  }

  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16"></div>

        <Masonry columnsCount={3} gutter="1rem">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="relative group overflow-hidden rounded-2xl cursor-pointer"
            >
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="w-full block object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white p-4">{image.alt}</p>
              </div>
            </div>
          ))}
        </Masonry>
      </div>
    </section>
  );
}

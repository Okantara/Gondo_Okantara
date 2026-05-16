import Masonry from "react-responsive-masonry";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1707999251954-2a4abc6e1f35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxpbmRvbmVzaWFuJTIwdHJhZGl0aW9uYWwlMjBmb29kJTIwZGlzaHxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Hidangan tradisional Indonesia",
  },
  {
    src: "https://images.unsplash.com/photo-1771914248560-40afaff50f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW1iYWwlMjBjaGlsaSUyMHNhdWNlJTIwaW5kb25lc2lhbnxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Sambal pecel special",
  },
  {
    src: "https://images.unsplash.com/photo-1766567461692-32c352d198d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxpbmRvbmVzaWFuJTIwdHJhZGl0aW9uYWwlMjBmb29kJTIwZGlzaHxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Hidangan pedas tradisional",
  },
  {
    src: "https://images.unsplash.com/photo-1535032756890-c4d0a4dbfd06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGFzaWFuJTIwc3BpY2VzJTIwY29uZGltZW50c3xlbnwxfHx8fDE3NzczNTA3MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Bumbu rempah tradisional",
  },
  {
    src: "https://images.unsplash.com/photo-1774370793603-3c00fd215bb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxpbmRvbmVzaWFuJTIwdHJhZGl0aW9uYWwlMjBmb29kJTIwZGlzaHxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Bakso dan mie tradisional",
  },
  {
    src: "https://images.unsplash.com/photo-1764332688812-f6ac09a687bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHx0cmFkaXRpb25hbCUyMGFzaWFuJTIwc3BpY2VzJTIwY29uZGltZW50c3xlbnwxfHx8fDE3NzczNTA3MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Sambal dan bumbu",
  },
  {
    src: "https://images.unsplash.com/photo-1771914248554-2b9120d60698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxzYW1iYWwlMjBjaGlsaSUyMHNhdWNlJTIwaW5kb25lc2lhbnxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Pecel dengan sambal",
  },
  {
    src: "https://images.unsplash.com/photo-1613653739328-e86ebd77c9c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxzYW1iYWwlMjBjaGlsaSUyMHNhdWNlJTIwaW5kb25lc2lhbnxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Hidangan dengan sambal",
  },

  {
    src: "https://images.unsplash.com/photo-1771914248554-2b9120d60698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxzYW1iYWwlMjBjaGlsaSUyMHNhdWNlJTIwaW5kb25lc2lhbnxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Pecel dengan sambal",
  },
];

export function Gallery() {
  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-4 uppercase">
            Berbahan Abon
          </h2>
          <p className="text-xm text-gray-600 uppercase">
            Bersertifikasi Halal Dan Higenis Tanpa Bahan Pengawet
          </p>
        </div>

        <Masonry columnsCount={3} gutter="1rem">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-2xl cursor-pointer"
            >
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="w-full block object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-bt from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white p-4">{image.alt}</p>
              </div>
            </div>
          ))}
        </Masonry>
      </div>
    </section>
  );
}

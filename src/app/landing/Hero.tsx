import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1707999251954-2a4abc6e1f35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxpbmRvbmVzaWFuJTIwdHJhZGl0aW9uYWwlMjBmb29kJTIwZGlzaHxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Abon Premium Khas Tulungagung",
    subtitle: "Produk Khas Jawa Timur Sejak 2010",
  },
  {
    image:
      "https://images.unsplash.com/photo-1771914248560-40afaff50f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW1iYWwlMjBjaGlsaSUyMHNhdWNlJTIwaW5kb25lc2lhbnxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Sambal Nikmat Tradisional",
    subtitle: "Resep Turun Temurun, Rasa Autentik",
  },
  {
    image:
      "https://images.unsplash.com/photo-1766567461692-32c352d198d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxpbmRvbmVzaWFuJTIwdHJhZGl0aW9uYWwlMjBmb29kJTIwZGlzaHxlbnwxfHx8fDE3NzczNTA3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Kualitas Terjamin Halal",
    subtitle: "Tanpa Pengawet Berbahaya, 100% Alami",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section
      id="beranda"
      className="relative h-150 md:h-175 bg-linear-to-br from-[#FFF8F0] to-[#FFE8D6] overflow-hidden"
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-transparent z-10" />
            <ImageWithFallback
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl">
          <div className="mb-6">
            <span className="inline-block bg-[#E31E24] text-white px-4 py-2 rounded-full text-sm">
              Produk Lokal Berkualitas
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl text-white mb-4">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {slides[currentSlide].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                const element = document.getElementById("katalog");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white text-[#E31E24] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Lihat Produk
            </button>
            <a
              href="https://wa.me/6285630300012"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E31E24] text-white px-8 py-4 rounded-lg hover:bg-[#C11A1F] transition-colors text-center"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

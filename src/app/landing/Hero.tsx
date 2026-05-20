import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getImageUrl } from "../../lib/imageUtils";

interface Slide {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  order: number;
  is_active: boolean;
}

export function Hero() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ambil data slides dari database
  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from("slides")
        .select("*")
        .eq("is_active", true)
        .order("order", { ascending: true });

      if (error) {
        console.error("Error fetch slides:", error);
        return;
      }

      console.log("Slides data:", data);

      setSlides(data || []);
    };

    fetchSlides();
  }, []);

  // auto slide
  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]);

  // next slide
  const nextSlide = () => {
    if (slides.length === 0) return;

    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // prev slide
  const prevSlide = () => {
    if (slides.length === 0) return;

    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // loading
  if (slides.length === 0) {
    return (
      <section className="h-150 flex items-center justify-center bg-[#FFF8F0]">
        Loading...
      </section>
    );
  }

  const activeSlide = slides[currentSlide];

  return (
    <section id="beranda" className="relative h-150 md:h-175 overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => {
          const imageUrl = getImageUrl(slide.image_url);

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* overlay */}
              <div className="absolute inset-0 bg-black/50 z-10" />

              {/* image */}
              <img
                src={imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl">
          <div className="mb-6">
            <span className="inline-block bg-[#E31E24] text-white px-4 py-2 rounded-full text-sm">
              Produk Lokal Berkualitas
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl text-white mb-4">
            {activeSlide.title}
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {activeSlide.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                const element = document.getElementById("katalog");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-fit min-w-[180px] flex-shrink-0 bg-white text-[#E31E24] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Lihat Produk
            </button>

            <a
              href="https://wa.me/6285630300012"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit min-w-[180px] flex-shrink-0 bg-[#E31E24] text-white px-8 py-4 rounded-lg hover:bg-[#C11A1F] transition-colors text-center"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
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

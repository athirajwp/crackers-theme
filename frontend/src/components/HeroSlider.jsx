import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export default function HeroSlider() {
  const { settings } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const fallbackSliders = [
    'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
  ];

  // Resolve slider images
  const sliders = [
    settings.slider_image_1,
    settings.slider_image_2,
    settings.slider_image_3,
  ].filter(Boolean);

  const activeSliders = sliders.length > 0 ? sliders : fallbackSliders;

  useEffect(() => {
    if (activeSliders.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % activeSliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSliders.length]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % activeSliders.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + activeSliders.length) % activeSliders.length);
  };

  const formatImageSrc = (src) => {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    return '/' + src;
  };

  return (
    <section className="relative bg-slate-50 overflow-hidden z-10 select-none">
      <div className="container mx-auto px-4 pt-6">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white group">
          <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] md:aspect-[3/1] min-h-[180px] sm:min-h-[260px] md:min-h-[360px] lg:min-h-[440px] overflow-hidden">
            {activeSliders.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${
                  activeSlide === index
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-full'
                }`}
                style={{ display: activeSlide === index ? 'block' : 'none' }}
              >
                <img
                  src={formatImageSrc(slide)}
                  alt={`Promotional Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {activeSliders.length > 1 && (
              <>
                {/* Left & Right Arrow Navigation */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-11 md:h-11 bg-white/25 hover:bg-white/45 active:bg-white/60 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 z-20"
                >
                  <i className="fa-solid fa-chevron-left text-xs md:text-sm"></i>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-11 md:h-11 bg-white/25 hover:bg-white/45 active:bg-white/60 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 z-20"
                >
                  <i className="fa-solid fa-chevron-right text-xs md:text-sm"></i>
                </button>

                {/* Carousel Dot Indicators */}
                <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-20">
                  {activeSliders.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                        activeSlide === index
                          ? 'bg-gold-500 w-5 md:w-6 shadow-md shadow-gold-500/40'
                          : 'bg-white/60 hover:bg-white w-1.5 md:w-2'
                      }`}
                      title={`Slide ${index + 1}`}
                    ></button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

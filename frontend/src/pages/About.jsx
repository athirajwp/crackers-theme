import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function About() {
  const { settings } = useStore();
  const [activeImage, setActiveImage] = useState(null);
  const cardBgStyle = { backgroundColor: settings?.card_bg_color || '#EFEBE8' };

  const galleryImages = [];
  for (let i = 1; i <= 10; i++) {
    const imgKey = `gallery_image_${i}`;
    if (settings[imgKey]) {
      galleryImages.push(settings[imgKey]);
    }
  }

  const defaultGallery = [
    "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
  ];

  const displayImages = galleryImages.length > 0 ? galleryImages : defaultGallery;

  return (
    <div className="relative text-slate-800 select-none bg-transparent pb-16">
      {/* 1. Premium Electro Header Page Banner */}
      <section className="relative bg-crimson-600 py-16 border-b border-crimson-700 shadow-inner">
        <div className="container mx-auto px-4 text-center space-y-3 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            About Us
          </h2>
          <div className="flex justify-center items-center gap-2 text-xs font-extrabold text-slate-350 uppercase tracking-widest">
            <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <i className="fa-solid fa-chevron-right text-[8px] text-slate-450"></i>
            <span className="text-gold-500">About {settings.store_name || 'Our Company'}</span>
          </div>
        </div>
      </section>

      {/* 2. Content Container Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="border border-[#E2DDD9] rounded-3xl p-6 md:p-10 shadow-sm space-y-12" style={cardBgStyle}>
          
          {/* Main Story block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Text Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-crimson-600 uppercase tracking-widest block">
                  {settings.about_us_badge || 'Sivakasi Pioneers'}
                </span>
                <h3 className="text-xl md:text-2.5xl font-black text-slate-900 tracking-tight leading-tight">
                  {settings.about_us_title || 'Bringing Joy Since 1999'}
                </h3>
              </div>
              {(settings.about_us
                ? settings.about_us.split('\n').filter((p) => p.trim() !== '')
                : [
                    'We deliver high quality crackers.',
                    'Safety is our top priority.'
                  ]
              ).map((p, idx) => (
                <p key={idx} className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">
                  {p}
                </p>
              ))}
            </div>
            
            {/* Right: Unsplash legacy banner image */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-gold-500 to-crimson-600 rounded-2xl opacity-10 blur-lg group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-white border border-slate-200 p-2.5 rounded-2xl shadow-md overflow-hidden">
                <img
                  src={settings.aboutus_image_1 ? (settings.aboutus_image_1.startsWith('data:') || settings.aboutus_image_1.startsWith('http') ? settings.aboutus_image_1 : `/${settings.aboutus_image_1}`) : 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'}
                  alt="Sivakasi Fireworks Warehouse"
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* 3. Photo Gallery Section */}
          <div className="border-t border-slate-100 pt-10 space-y-8">
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-900 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                <i className="fa-solid fa-camera-retro text-gold-600 text-sm"></i> Photo Gallery
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Our Facilities & Celebrations
              </h3>
              <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto font-semibold leading-relaxed">
                Take a virtual tour of our factory, licensed storage facilities, and the joyful celebration moments we help power.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 md:gap-8">
              {displayImages.map((src, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(src)}
                  className="group relative bg-white border-2 border-slate-100 hover:border-gold-400 rounded-2xl md:rounded-3xl p-1.5 md:p-2.5 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden"
                >
                  {/* Theme-synced Animated Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 to-crimson-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500 pointer-events-none"></div>

                  {/* Responsive Image Container (210px on desktop, 40 on mobile 2-col) */}
                  <div className="relative w-full h-40 sm:h-48 md:h-[210px] overflow-hidden rounded-xl md:rounded-2xl bg-slate-100">
                    <img 
                      src={src.startsWith('http') || src.startsWith('data:') ? src : `/${src}`} 
                      alt={`Gallery view ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Gradient Overlay with Expand Icon */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-sparkles text-gold-400"></i> View Full Photo
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-gold-500 text-slate-900 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                        <i className="fa-solid fa-magnifying-glass-plus text-sm"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Licenses & Compliance (Moved to Bottom) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-slate-900 flex-shrink-0 shadow-sm">
                <i className="fa-solid fa-scale-balanced text-lg text-crimson-600"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Statutory Compliant Dealers</h4>
                <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                  We strictly follow all safety, storage, and transport guidelines regulated by government licensing authorities.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 font-bold text-xs text-slate-655 w-full md:w-auto">
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-inner flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">License:</span>
                <strong className="text-slate-800 font-black">{settings.license_name || 'Jallikattu Crackers'}</strong>
              </div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-inner flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">No:</span>
                <strong className="text-slate-850 font-black font-mono">{settings.license_no || '123/ABCD/2024'}</strong>
              </div>
            </div>
          </div>

          {/* Grid of Key USP Cards (Moved to Bottom) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white border border-slate-200 rounded-2.5xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center mb-4 text-crimson-600">
                <i className="fa-solid fa-award text-sm"></i>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">100% Quality Assurance</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Every firecracker goes through quality check parameters before packing. We guarantee vibrant colors, loud pops, and high spark durations.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2.5xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center mb-4 text-crimson-600">
                <i className="fa-solid fa-user-shield text-sm"></i>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Safety Disclaimers</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                We promote safety-first fireworks. All packages include instruction manual logs on handling, lighting, and safe disposal.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2.5xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center mb-4 text-crimson-600">
                <i className="fa-solid fa-truck-fast text-sm"></i>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Direct Shipping</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Our logistics network covers major areas across Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, and Telangana via trusted transport carriers.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Lightbox / Zoom Popup Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setActiveImage(null)}
        >
          <div 
            className="relative bg-white border border-slate-200 rounded-3xl p-3 max-w-4xl max-h-[90vh] shadow-2xl select-none cursor-default animate-scale-up flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-crimson-600 hover:bg-crimson-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 z-10"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
            <img 
              src={activeImage.startsWith('http') || activeImage.startsWith('data:') ? activeImage : `/${activeImage}`} 
              alt="Gallery Zoomed" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

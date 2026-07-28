import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <footer className="bg-slate-900 text-slate-350 border-t-4 border-gold-500 mt-auto select-none pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Contact details */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-widest border-b border-gold-500/80 pb-2.5 flex items-center gap-2">
                <i className="fa-solid fa-address-card text-gold-500"></i> Contact Details
              </h4>
              <ul className="space-y-3 text-xs md:text-sm text-slate-300 font-bold">
                <li className="flex items-start gap-2.5 leading-normal">
                  <i className="fa-solid fa-location-dot text-gold-400 mt-0.5 flex-shrink-0"></i>
                  <span>{settings.store_address}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fa-solid fa-phone text-gold-400 mt-1 flex-shrink-0"></i>
                  <div className="flex flex-col gap-1">
                    {settings.store_phone && (
                      <a href={`tel:${settings.store_phone}`} className="hover:text-gold-400 transition-colors font-extrabold text-white">
                        {settings.store_phone}
                      </a>
                    )}
                    {settings.store_phone_2 && (
                      <a href={`tel:${settings.store_phone_2}`} className="hover:text-gold-400 transition-colors font-extrabold text-white">
                        {settings.store_phone_2}
                      </a>
                    )}
                    {settings.store_phone_3 && (
                      <a href={`tel:${settings.store_phone_3}`} className="hover:text-gold-400 transition-colors font-extrabold text-white">
                        {settings.store_phone_3}
                      </a>
                    )}
                    {settings.store_phone_4 && (
                      <a href={`tel:${settings.store_phone_4}`} className="hover:text-gold-400 transition-colors font-extrabold text-white">
                        {settings.store_phone_4}
                      </a>
                    )}
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <i className="fa-solid fa-envelope text-gold-400 flex-shrink-0"></i>
                  <a href={`mailto:${settings.store_email}`} className="hover:text-gold-400 transition-colors text-slate-300">{settings.store_email}</a>
                </li>
              </ul>
              
              {/* Google Map iframe */}
              <div className="map-container w-full h-44 md:h-48 rounded-xl overflow-hidden border border-slate-700/80 shadow-md [&_iframe]:w-full [&_iframe]:h-full [&>div]:w-full [&>div]:h-full mt-3">
                {settings.store_map_iframe ? (
                  <div dangerouslySetInnerHTML={{ __html: settings.store_map_iframe }} className="w-full h-full" />
                ) : (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31484.78768782782!2d77.78440079999999!3d9.4475475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cee41fe51a8d%3A0xe964a2754897f1f!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1717830000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Store Location Map"
                  ></iframe>
                )}
              </div>
            </div>

            {/* Safety guidelines */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-widest border-b border-gold-500/80 pb-2.5 flex items-center gap-2">
                <i className="fa-solid fa-shield-cat text-gold-500"></i> Safety Disclaimer
              </h4>
              <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl text-[11px] md:text-xs text-slate-300 leading-relaxed space-y-2.5 font-medium shadow-inner">
                <p className="text-gold-400 font-black text-xs md:text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation animate-pulse text-amber-400"></i> Burst Wisely & Safely:
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-gold-400 font-bold">1.</span> Keep a water bucket & fire extinguisher handy when bursting crackers.
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-gold-400 font-bold">2.</span> Children must always perform fireworks under strict adult supervision.
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-gold-400 font-bold">3.</span> Do not wear loose synthetic clothes near crackers; prefer thick cotton.
                </p>
              </div>
            </div>

            {/* Supreme Court compliance notice */}
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-widest border-b border-gold-500/80 pb-2.5 flex items-center gap-2">
                <i className="fa-solid fa-gavel text-gold-500"></i> Supreme Court Compliance
              </h4>
              <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl text-[11px] md:text-xs text-slate-300 leading-relaxed space-y-2.5 font-medium shadow-inner">
                <p className="leading-relaxed">
                  As per 2018 Supreme Court Order, Online Sale of Firecrackers is NOT permitted. We follow 100% legal & statutory compliances.
                </p>
                <div className="pt-2 border-t border-slate-700/80 space-y-1.5 text-[11px] md:text-xs">
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">License Name:</span>
                    <strong className="text-white font-bold">{settings.license_name || 'Jallikattu Crackers'}</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">License No:</span>
                    <strong className="text-gold-400 font-bold font-mono">{settings.license_no || '123/ABCD/2024'}</strong>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Credits */}
          <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
            <p>&copy; 2026 {settings.store_name} Sivakasi. All Rights Reserved.</p>
            <div className="flex gap-4 font-bold">
              <span className="hover:text-gold-500 cursor-pointer transition-colors">Privacy Policy</span>
              <span>&bull;</span>
              <Link to="/terms" className="hover:text-gold-500 transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top button */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-45 select-none pointer-events-auto">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-11 h-11 bg-gold-500 text-slate-905 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border border-gold-400/20 group"
            title="Scroll to Top"
          >
            <i className="fa-solid fa-arrow-up text-sm group-hover:-translate-y-0.5 transition-transform text-slate-900"></i>
          </button>
        </div>
      )}
    </>
  );
}

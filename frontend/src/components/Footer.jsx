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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Quick navigation */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2.5">
                Quick Navigation
              </h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400">
                <li>
                  <Link to="/" className="hover:text-gold-500 transition-colors flex items-center">
                    <i className="fa-solid fa-chevron-right mr-2 text-[8px] text-gold-500"></i>Home Page
                  </Link>
                </li>
                <li>
                  <a href="/#quick-order" className="hover:text-gold-500 transition-colors flex items-center">
                    <i className="fa-solid fa-chevron-right mr-2 text-[8px] text-gold-500"></i>Quick Order Sheet
                  </a>
                </li>
                <li>
                  <Link to="/price-list" className="hover:text-gold-500 transition-colors flex items-center">
                    <i className="fa-solid fa-chevron-right mr-2 text-[8px] text-gold-500"></i>Price List Summary
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-gold-500 transition-colors flex items-center">
                    <i className="fa-solid fa-chevron-right mr-2 text-[8px] text-gold-500"></i>Track Order Status
                  </Link>
                </li>
                <li>
                  <a href={`/admin/login${location.search}`} target="_blank" rel="noreferrer" className="hover:text-gold-500 transition-colors flex items-center">
                    <i className="fa-solid fa-chevron-right mr-2 text-[8px] text-gold-500"></i>Admin Portal Login
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact details */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2.5">
                Contact Details
              </h4>
              <ul className="space-y-3.5 text-xs text-slate-400 font-bold">
                <li className="flex items-start gap-2.5 leading-normal">
                  <i className="fa-solid fa-location-dot text-gold-500 mt-0.5"></i>
                  <span>{settings.store_address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <i className="fa-solid fa-phone text-gold-500"></i>
                  <a href={`tel:${settings.store_phone}`} className="hover:text-gold-500 transition-colors">{settings.store_phone}</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <i className="fa-solid fa-envelope text-gold-500"></i>
                  <a href={`mailto:${settings.store_email}`} className="hover:text-gold-500 transition-colors">{settings.store_email}</a>
                </li>
              </ul>
              
              {/* Google Map iframe */}
              <div className="map-container w-full h-48 rounded-2xl overflow-hidden border border-slate-800 shadow [&_iframe]:w-full [&_iframe]:h-full [&>div]:w-full [&>div]:h-full">
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
              <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2.5">
                Safety Disclaimer
              </h4>
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-[10px] text-slate-400 leading-relaxed space-y-2 font-bold">
                <p className="text-gold-500 font-black flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation animate-pulse"></i>Burst Wisely & Safely:
                </p>
                <p>1. Keep a water bucket & fire extinguisher handy when bursting crackers.</p>
                <p>2. Children must always perform fireworks under strict adult supervision.</p>
                <p>3. Do not wear loose synthetic clothes near crackers; prefer thick cotton.</p>
              </div>
            </div>

            {/* Supreme Court compliance notice */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2.5">
                Supreme Court Compliance
              </h4>
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-[10px] text-slate-400 leading-relaxed space-y-2 font-bold">
                <p>
                  As per 2018 Supreme Court Order, Online Sale of Firecrackers is NOT permitted. We follow 100% legal & statutory compliances.
                </p>
                <p>
                  License Name: <strong className="text-white font-black">{settings.license_name || 'Jallikattu Crackers'}</strong>
                </p>
                <p>
                  License No: <strong className="text-white font-black font-mono">{settings.license_no || '123/ABCD/2024'}</strong>
                </p>
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

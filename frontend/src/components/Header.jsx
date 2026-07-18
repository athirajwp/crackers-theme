import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const {
    settings,
    totalQty,
    totalNet,
    setCheckoutOpen,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const alerts = [
    settings.marquee_alert_1,
    settings.marquee_alert_2,
    settings.marquee_alert_3,
    settings.marquee_alert_4,
    settings.marquee_alert_5,
    settings.marquee_alert_6,
  ].filter(Boolean);

  if (alerts.length === 0) {
    alerts.push(
      "Special Offer: 60% Discount on all items!",
      "Free Delivery on orders above Rs. 5000!"
    );
  }

  const isActive = (path) => location.pathname === path;

  const formatCurrency = (val) => {
    return parseFloat(val || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const getGoogleMapsUrl = () => {
    if (settings.store_map_iframe) {
      // 1. If user input contains an iframe, extract the src URL
      const match = settings.store_map_iframe.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
      
      // 2. If it's a raw URL link starting with http
      if (settings.store_map_iframe.trim().startsWith('http')) {
        return settings.store_map_iframe.trim();
      }
    }
    
    // Fallback: standard Google Maps search using the store address
    const addressQuery = encodeURIComponent(settings.store_address || 'Virudhunagar to Sivakasi Main Road, Sivakasi');
    return `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: 'fa-house', isLink: true },
    { to: '/#quick-order', label: 'Quick Order Sheet', icon: 'fa-list-check', isLink: false },
    { to: '/price-list', label: 'Price List', icon: 'fa-tags', isLink: true },
    { to: '/track', label: 'Track Order', icon: 'fa-truck-fast', isLink: true },
    { to: '/about', label: 'About Us', icon: 'fa-circle-info', isLink: true },
    { to: '/contact', label: 'Contact', icon: 'fa-envelope', isLink: true },
  ];

  return (
    <>
      {/* ROW 1: Top Marquee & Admin Bar */}
      <div className="bg-crimson-600 text-slate-100 text-[10px] sm:text-xs py-2 font-bold shadow-sm select-none border-b border-crimson-700">
        <div className="container mx-auto px-4 flex justify-between items-center gap-4">
          <div className="flex-grow overflow-hidden relative">
            <marquee behavior="scroll" direction="left" scrollamount="4" className="w-full">
              <div className="flex items-center gap-12 py-0.5">
                {alerts.map((alert, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 whitespace-nowrap">
                    <i className="fa-solid fa-star text-gold-500 animate-pulse text-[9px]"></i>
                    <span dangerouslySetInnerHTML={{ __html: alert }}></span>
                    {idx < alerts.length - 1 && <span className="text-slate-300 font-bold mx-2">|</span>}
                  </span>
                ))}
              </div>
            </marquee>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <a href={`/admin/login${location.search}`} target="_blank" rel="noreferrer" className="hover:text-gold-500 transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <i className="fa-solid fa-user-shield text-gold-500"></i>
              <span>Admin Portal Login</span>
            </a>
          </div>
        </div>
      </div>

      {/* ROW 2: Light Festive Brand Bar — theme color background in light mode */}
      <div className="relative bg-crimson-50 border-b border-crimson-100 py-5 select-none overflow-hidden">

        {/* Left soft festive glow */}
        <div className="absolute left-0 top-0 h-full w-48 pointer-events-none" style={{background: 'radial-gradient(ellipse at 10% 50%, rgba(220,38,38,0.08) 0%, rgba(234,179,8,0.05) 40%, transparent 70%)'}}></div>
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none opacity-20" style={{background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(220,38,38,0.2) 50%, transparent 70%)', filter: 'blur(12px)'}}></div>

        {/* Right soft festive glow */}
        <div className="absolute right-0 top-0 h-full w-48 pointer-events-none" style={{background: 'radial-gradient(ellipse at 90% 50%, rgba(220,38,38,0.08) 0%, rgba(234,179,8,0.05) 40%, transparent 70%)'}}></div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none opacity-20" style={{background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(220,38,38,0.2) 50%, transparent 70%)', filter: 'blur(12px)'}}></div>

        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between md:justify-center gap-6 md:gap-16 lg:gap-24">

          {/* LEFT: Circular Logo */}
          <Link to="/" className="group flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gold-500 shadow-md shadow-gold-500/20 overflow-hidden bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:border-gold-400">
              {settings.store_logo ? (
                <img
                  src={settings.store_logo.startsWith('data:') || settings.store_logo.startsWith('http') ? settings.store_logo : `/${settings.store_logo}`}
                  alt={settings.store_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fa-solid fa-fire text-3xl text-gold-500"></i>
              )}
            </div>
          </Link>

          {/* CENTER: Address */}
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none flex flex-col items-center justify-center text-center gap-1 group/address hover:scale-105 transition-transform duration-200"
          >
            <h3 className="text-crimson-700 font-extrabold text-sm uppercase tracking-widest group-hover/address:text-crimson-600 transition-colors">Address</h3>
            <p className="text-slate-800 text-xs md:text-sm font-bold leading-relaxed max-w-sm">
              {settings.store_address || 'Virudhunagar to Sivakasi Main Road, Sivakasi'}
            </p>
            <span className="text-[10px] md:text-xs font-black text-gold-600 group-hover/address:text-gold-500 flex items-center gap-1 mt-0.5 underline decoration-dotted transition-colors">
              <i className="fa-solid fa-location-dot animate-bounce text-[10px]"></i> Shop Location
            </span>
          </a>

          {/* RIGHT: Mobile Number */}
          <div className="hidden md:flex flex-col items-center text-center gap-1 flex-shrink-0">
            <h3 className="text-crimson-700 font-extrabold text-sm uppercase tracking-widest">Mobile Number</h3>
            <a href={`tel:${settings.store_phone}`} className="text-slate-900 text-xs md:text-sm font-black hover:text-crimson-700 transition-colors">
              {settings.store_phone}
            </a>
            {settings.store_email && (
              <a href={`mailto:${settings.store_email}`} className="text-slate-655 text-[11px] font-bold hover:text-crimson-700 transition-colors">
                {settings.store_email}
              </a>
            )}
          </div>

          {/* Mobile: Hamburger & Cart */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setCheckoutOpen(true)}
              className="relative w-9 h-9 border border-crimson-200 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-crimson-100 transition-colors"
              title="Cart"
            >
              <i className="fa-solid fa-bag-shopping text-sm"></i>
              {totalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-crimson-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {totalQty}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 border border-crimson-200 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-crimson-100 transition-colors"
            >
              <i className={mobileMenuOpen ? 'fa-solid fa-xmark text-sm' : 'fa-solid fa-bars text-sm'}></i>
            </button>
          </div>

        </div>
      </div>

      {/* ROW 3: Main Navigation Bar — styled like reference screenshot, synced to crimson/gold theme */}
      <div className="hidden md:block bg-crimson-600 select-none shadow-md">
        <div className="flex items-center justify-center">

          {navLinks.map((link, idx) => {
            const active = link.isLink && isActive(link.to);
            const linkClass = `flex items-center gap-2 px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-widest whitespace-nowrap transition-all duration-150 border-r border-crimson-500
              ${active
                ? 'bg-gold-500 text-crimson-800 shadow-inner'
                : 'text-white hover:bg-crimson-700 hover:text-gold-300'}`;

            return link.isLink ? (
              <Link key={link.to} to={link.to} className={linkClass}>
                <i className={`fa-solid ${link.icon} text-[10px]`}></i>
                <span>{link.label}</span>
              </Link>
            ) : (
              <a key={link.to} href={link.to} className={linkClass}>
                <i className={`fa-solid ${link.icon} text-[10px]`}></i>
                <span>{link.label}</span>
              </a>
            );
          })}

        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-md select-none">
          {navLinks.map((link) => (
            link.isLink ? (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 text-xs font-bold border-b border-slate-100 transition-colors
                  ${isActive(link.to) ? 'bg-gold-50 text-crimson-600 border-l-4 border-l-gold-500' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <i className={`fa-solid ${link.icon} text-crimson-500 text-sm w-4`}></i>
                <span className="uppercase tracking-wide">{link.label}</span>
              </Link>
            ) : (
              <a
                key={link.to}
                href={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-xs font-bold border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <i className={`fa-solid ${link.icon} text-crimson-500 text-sm w-4`}></i>
                <span className="uppercase tracking-wide">{link.label}</span>
              </a>
            )
          ))}
        </div>
      )}
    </>
  );
}

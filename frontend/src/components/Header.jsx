import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const {
    settings,
    categories,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    totalQty,
    totalNet,
    setCheckoutOpen,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
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

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug);
    setDeptMenuOpen(false);
    
    // Scroll to quick-order section
    const el = document.getElementById('quick-order');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatCurrency = (val) => {
    return parseFloat(val || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  return (
    <>
      {/* ROW 1: Top Utility Bar (Dark Slate / bg-crimson-600) */}
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

      {/* ROW 2: Main Brand & Contact Bar (White) */}
      <div className="bg-white border-b border-slate-200 py-4 select-none">
        <div className="container mx-auto px-4 flex justify-between items-center gap-4">
          {/* Logo / Branding */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            {settings.store_logo ? (
              <img
                src={settings.store_logo.startsWith('data:') || settings.store_logo.startsWith('http') ? settings.store_logo : `/${settings.store_logo}`}
                alt={settings.store_name}
                className="h-10 md:h-12 w-auto object-contain rounded-xl shadow-sm"
              />
            ) : (
              <div className="bg-gold-500 p-2 rounded-xl shadow-md group-hover:rotate-6 transition-transform duration-300">
                <i className="fa-solid fa-fire text-lg md:text-2xl text-crimson-600"></i>
              </div>
            )}
            <div className="flex flex-col justify-center">
              <h1 className="text-sm md:text-base lg:text-xl font-black tracking-tight text-slate-900 leading-none">
                {settings.store_name?.toUpperCase() || 'CRACKER SHOPE'}
              </h1>
              <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest uppercase font-semibold leading-none mt-1">
                Sivakasi Wholesale Dealers
              </p>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-bold text-slate-700">
            <Link to="/" className={`hover:text-gold-600 transition-colors flex items-center gap-1.5 ${isActive('/') ? 'text-gold-600 border-b-2 border-gold-500 pb-0.5' : ''}`}>
              Home
            </Link>
            <a href="/#quick-order" className="hover:text-gold-600 transition-colors flex items-center gap-1.5">
              Quick Order Sheet
            </a>
            <Link to="/price-list" className={`hover:text-gold-600 transition-colors flex items-center gap-1.5 ${isActive('/price-list') ? 'text-gold-600 border-b-2 border-gold-500 pb-0.5' : ''}`}>
              Price List
            </Link>
            <Link to="/track" className={`hover:text-gold-600 transition-colors flex items-center gap-1.5 ${isActive('/track') ? 'text-gold-600 border-b-2 border-gold-500 pb-0.5' : ''}`}>
              Track Order
            </Link>
            <Link to="/about" className={`hover:text-gold-600 transition-colors flex items-center gap-1.5 ${isActive('/about') ? 'text-gold-600 border-b-2 border-gold-500 pb-0.5' : ''}`}>
              About Us
            </Link>
            <Link to="/contact" className={`hover:text-gold-600 transition-colors flex items-center gap-1.5 ${isActive('/contact') ? 'text-gold-600 border-b-2 border-gold-500 pb-0.5' : ''}`}>
              Contact
            </Link>
          </nav>

          {/* Contact details */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-50 flex items-center justify-center border border-gold-100 flex-shrink-0">
              <i className="fa-solid fa-headset text-gold-600 text-sm"></i>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase leading-none">Support Hotline</span>
              <a href={`tel:${settings.store_phone}`} className="text-xs md:text-sm font-black text-slate-800 hover:text-gold-600 transition-colors leading-normal mt-0.5">{settings.store_phone}</a>
            </div>
          </div>

          {/* Mobile Menu Toggler + Cart Icon */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setCheckoutOpen(true)}
              className="relative w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
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
              className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-655 hover:bg-slate-50 transition-colors"
            >
              <i className={mobileMenuOpen ? 'fa-solid fa-xmark text-sm' : 'fa-solid fa-bars text-sm'}></i>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: Yellow Action Bar (Only visible on Home page) */}
      {location.pathname === '/' && (
        <div className="bg-gold-500 py-3 shadow sticky top-0 z-40 select-none">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Left: Department Menu */}
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setDeptMenuOpen(!deptMenuOpen)}
                className="w-full md:w-56 bg-crimson-600 hover:bg-crimson-700 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center justify-between gap-1.5 transition-all shadow-sm shadow-crimson-750/10"
              >
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-bars-staggered text-sm"></i>
                  <span>Shop by Category</span>
                </div>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${deptMenuOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {/* Category Dropdown List */}
              {deptMenuOpen && (
                <div className="absolute left-0 mt-2 w-full md:w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${activeCategory === 'all' ? 'bg-gold-50 text-gold-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <i className="fa-solid fa-boxes-stacked mr-2 opacity-60"></i> All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${activeCategory === cat.slug ? 'bg-gold-50 text-gold-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <i className="fa-solid fa-fire-flame-curved mr-2 text-crimson-500 opacity-60"></i> {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Center: Search Bar */}
            <div className="relative w-full md:max-w-xl flex items-center">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-455">
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
              </span>
              <input
                type="text"
                placeholder="Search wholesale firecrackers by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-0 focus:ring-2 focus:ring-crimson-600 rounded-xl py-2.5 pl-10 pr-24 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all shadow-inner font-semibold"
              />
              <button className="absolute right-1 bg-crimson-600 hover:bg-crimson-700 text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-lg shadow transition-colors">
                Search
              </button>
            </div>

            {/* Right: Cart Tally Widget */}
            <button
              onClick={() => setCheckoutOpen(true)}
              className="hidden md:flex items-center gap-3.5 bg-crimson-600 hover:bg-crimson-700 text-white py-1.5 px-4 rounded-xl shadow-inner transition-colors flex-shrink-0"
            >
              <div className="relative">
                <i className="fa-solid fa-bag-shopping text-sm text-gold-500"></i>
                {totalQty > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-slate-900 text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-crimson-600 shadow-sm animate-bounce">
                    {totalQty}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-right font-extrabold text-xs">
                <span className="text-[8px] text-slate-350 uppercase leading-none font-semibold">Total Net</span>
                <span className="text-white mt-0.5 leading-none">₹{formatCurrency(totalNet)}</span>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2.5 shadow-md">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            Home
          </Link>
          <a href="/#quick-order" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            Quick Order Sheet
          </a>
          <Link to="/price-list" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            Price List
          </Link>
          <Link to="/track" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            Track Order
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            About Us
          </Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
            Contact
          </Link>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import HeroSlider from '../components/HeroSlider';
import ProductTable from '../components/ProductTable';
import CartFooter from '../components/CartFooter';
import CheckoutDrawer from '../components/CheckoutDrawer';

export default function Storefront() {
  const {
    settings,
    loading,
    checkoutOpen,
    setCheckoutOpen,
    categories,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    totalQty,
    totalNet,
  } = useStore();

  const [deptMenuOpen, setDeptMenuOpen] = useState(false);

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug);
    setDeptMenuOpen(false);
    const el = document.getElementById('quick-order');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const formatCurrency = (val) => {
    return parseFloat(val || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
        <p className="text-sm font-semibold text-slate-500">Loading Sivakasi Fireworks store...</p>
      </div>
    );
  }

  return (
    <div className="relative text-slate-800">

      {/* 1. Hero Image Slider Section */}
      <HeroSlider />

      {/* 2. Welcome & Value Proposition Grid */}
      <section className="container mx-auto px-4 py-8 select-none z-10 relative">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">

          {/* Welcome Text Block */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-gold-50 border border-gold-200 text-gold-800 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
              <i className="fa-solid fa-star text-gold-600"></i> Sivakasi Direct Wholesale Shop
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Welcome to <span className="text-crimson-500">{settings.store_name?.toUpperCase() || 'CRACKER SHOPE'}</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              We are Sivakasi's premier online fireworks ordering platform. Choose from our extensive collection of sparkles, chakkars, flower pots, sound crackers, and fancy sky displays at unbeatable factory rates with <strong className="text-crimson-600 font-extrabold">Flat {settings.discount_percent}% Discount!</strong>
            </p>
          </div>

          {/* Value Proposition Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center flex-shrink-0 text-slate-900 shadow-sm">
                <i className="fa-solid fa-truck-fast text-lg text-crimson-600"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Fast Lorry Delivery</h4>
                <p className="text-[10.5px] text-slate-500 leading-normal font-semibold">Safe transport directly from Sivakasi to your doorstep.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center flex-shrink-0 text-slate-900 shadow-sm">
                <i className="fa-solid fa-tags text-lg text-crimson-600"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Flat {settings.discount_percent}% Off</h4>
                <p className="text-[10.5px] text-slate-500 leading-normal font-semibold">Direct factory pricing with maximum booking discounts.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center flex-shrink-0 text-slate-900 shadow-sm">
                <i className="fa-solid fa-credit-card text-lg text-crimson-600"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Secure Billing</h4>
                <p className="text-[10.5px] text-slate-500 leading-normal font-semibold">100% verified booking and convenient offline banking options.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center flex-shrink-0 text-slate-900 shadow-sm">
                <i className="fa-solid fa-shield-halved text-lg text-crimson-600"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">PESO Certified</h4>
                <p className="text-[10.5px] text-slate-500 leading-normal font-semibold">100% compliant with PESO and Supreme Court guidelines.</p>
              </div>
            </div>
          </div>

          {/* Booking Info Alert Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-gold-600 text-sm"></i>
              <span>Minimum order value is <strong className="text-crimson-600 font-extrabold">₹{formatCurrency(settings.min_order_value)}</strong>. Add crackers to your cart to checkout.</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <a href="#quick-order" className="w-full sm:w-auto text-center bg-crimson-600 hover:bg-crimson-700 text-white px-5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-colors shadow">
                Start Order
              </a>
              <Link to="/price-list" className="w-full sm:w-auto text-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-colors">
                Price List
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Sticky Search & Filter Bar — directly above products */}
      <div className="sticky top-0 z-30 bg-gold-500 shadow-lg select-none border-b-2 border-gold-600">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 py-3">

          {/* Left: Shop by Category Dropdown */}
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setDeptMenuOpen(!deptMenuOpen)}
              className="w-full md:w-56 bg-crimson-600 hover:bg-crimson-700 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center justify-between gap-1.5 transition-all shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-bars-staggered text-sm"></i>
                <span>Shop by Category</span>
              </div>
              <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${deptMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {deptMenuOpen && (
              <div className="absolute left-0 mt-2 w-full md:w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1.5">
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

          {/* Center: Search Input */}
          <div className="relative w-full md:max-w-xl flex items-center">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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

          {/* Right: Cart Tally */}
          <button
            onClick={() => setCheckoutOpen(true)}
            className="hidden md:flex items-center gap-3.5 bg-crimson-600 hover:bg-crimson-700 text-white py-1.5 px-4 rounded-xl shadow-inner transition-colors flex-shrink-0"
          >
            <div className="relative">
              <i className="fa-solid fa-bag-shopping text-sm text-gold-500"></i>
              {totalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-crimson-600 shadow-sm animate-bounce">
                  {totalQty}
                </span>
              )}
            </div>
            <div className="flex flex-col text-right font-extrabold text-xs">
              <span className="text-[8px] text-gold-200 uppercase leading-none font-semibold">Total Net</span>
              <span className="text-white mt-0.5 leading-none">₹{formatCurrency(totalNet)}</span>
            </div>
          </button>

        </div>
      </div>

      {/* 4. Product Table */}
      <ProductTable />

      {/* 5. Sticky Floating Footer Cart Tally */}
      <CartFooter onCheckoutClick={() => setCheckoutOpen(true)} />

      {/* 6. Slide-out Checkout Drawer */}
      <CheckoutDrawer isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

    </div>
  );
}

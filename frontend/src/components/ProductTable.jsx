import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function ProductTable() {
  const {
    categories,
    settings,
    cart,
    increaseQty,
    decreaseQty,
    updateQty,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    viewMode,
  } = useStore();

  const [popProduct, setPopProduct] = useState(null);

  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  const toggleCategoryCollapse = (slug) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(slug)) {
      newCollapsed.delete(slug);
    } else {
      newCollapsed.add(slug);
    }
    setCollapsedCategories(newCollapsed);
  };

  const shouldShowCategory = (slug) => {
    if (activeCategory !== 'all' && activeCategory !== slug) {
      return false;
    }
    return true;
  };

  const shouldShowProduct = (categorySlug, product) => {
    if (activeCategory !== 'all' && activeCategory !== categorySlug) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  // Compute number of filtered products currently shown
  let totalFilteredProductsCount = 0;
  categories.forEach((cat) => {
    if (shouldShowCategory(cat.slug)) {
      cat.products.forEach((prod) => {
        if (shouldShowProduct(cat.slug, prod)) {
          totalFilteredProductsCount++;
        }
      });
    }
  });

  const cardBgStyle = { backgroundColor: settings?.card_bg_color || '#EFEBE8' };

  return (
    <section id="quick-order" className="container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8 items-start">
      {/* Left: Category sidebar filters (Hidden on Mobile, Sticky on Desktop) */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0 lg:sticky lg:top-24 space-y-4 select-none">
        <div className="border border-[#E2DDD9] p-4 rounded-2xl shadow-sm" style={cardBgStyle}>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-[#E2DDD9] pb-2.5 mb-3 flex justify-between items-center">
            <span>Categories</span>
            <i className="fa-solid fa-filter text-slate-400 text-xs"></i>
          </h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-crimson-600 text-white font-extrabold shadow'
                  : 'text-slate-650 hover:bg-[#E5DFDA]/60'
              }`}
            >
              <i className="fa-solid fa-boxes-stacked text-[11px] opacity-80"></i> All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.slug
                    ? 'bg-crimson-600 text-white font-extrabold shadow'
                    : 'text-slate-655 hover:bg-[#E5DFDA]/60'
                }`}
              >
                <i className="fa-solid fa-fire-flame-curved text-[11px] opacity-80"></i> {cat.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right: Product list spreadsheet */}
      <div className="flex-grow w-full space-y-6">
        {/* Conditional Layout Rendering */}
        {viewMode === 'flex' ? (
          <div className="border border-[#E2DDD9] rounded-2xl overflow-hidden shadow-sm" style={cardBgStyle}>
            
            {/* Desktop View Table */}
            <div className="hidden sm:block overflow-x-auto sm:overflow-visible">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#E5DFDA]/80 border-b border-[#E2DDD9] text-slate-600 font-bold uppercase tracking-wider text-[10px] select-none">
                    <th className="py-4 px-3 sm:px-4">Cracker Details</th>
                    <th className="hidden sm:table-cell py-4 px-4 w-28 text-center">Unit / Box</th>
                    <th className="py-4 px-3 sm:px-4 w-24 sm:w-36 text-right">Price (₹)</th>
                    <th className="py-4 px-3 sm:px-4 w-28 sm:w-40 text-center">Order Qty</th>
                    <th className="hidden md:table-cell py-4 px-4 w-28 text-right pr-6">Total (₹)</th>
                    <th className="py-4 px-3 sm:px-4 w-28 text-right pr-4">Sub Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {categories.map((cat) => {
                    if (!shouldShowCategory(cat.slug)) return null;

                    const isCollapsed = collapsedCategories.has(cat.slug);
                    
                    return (
                      <React.Fragment key={cat.id}>
                        {/* Category Header Row */}
                        <tr
                          onClick={() => toggleCategoryCollapse(cat.slug)}
                          className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200/80 select-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <td colSpan={6} className="py-3 px-3 sm:px-4 flex items-center justify-between text-crimson-655 tracking-wider">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-fire text-[10px] text-crimson-500"></i>
                              <span>{cat.name}</span>
                            </div>
                            <i
                              className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${
                                isCollapsed ? '-rotate-90' : 'rotate-0'
                              }`}
                            ></i>
                          </td>
                        </tr>

                        {/* Products list within Category */}
                        {!isCollapsed && cat.products.map((prod) => {
                          if (!shouldShowProduct(cat.slug, prod)) return null;

                          const cartItem = cart[prod.id];
                          const qty = cartItem ? cartItem.qty : 0;
                          const rowTotal = qty * parseFloat(prod.selling_price);

                          return (
                            <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                              {/* Product Info */}
                              <td className="py-3.5 px-3 sm:px-4">
                                <div className="flex flex-col gap-1.5">
                                  {/* Title on top */}
                                  <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-normal whitespace-nowrap truncate">{prod.name}</h4>
                                  
                                  {/* Image + Info below title */}
                                  <div className="flex items-center gap-3">
                                    {/* Left Image */}
                                    <div 
                                      className={`flex w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 items-center justify-center text-slate-400 overflow-hidden flex-shrink-0 ${prod.image ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                                      onClick={prod.image ? () => setPopProduct({ prod, catName: cat.name }) : undefined}
                                    >
                                      {prod.image ? (
                                        <img src={`/${prod.image}`} alt={prod.name} className="object-cover w-full h-full" />
                                      ) : (
                                        <i className="fa-solid fa-sparkles text-sm text-crimson-450/40"></i>
                                      )}
                                    </div>
                                    
                                    {/* Right Specs */}
                                    <div className="flex flex-col items-start gap-1">
                                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cat.name}</span>
                                      <span className="sm:hidden text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-sm">
                                        {prod.pack_size}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Pack size */}
                              <td className="hidden sm:table-cell py-3.5 px-4 text-center text-slate-650 font-bold font-mono">
                                {prod.pack_size}
                              </td>

                              {/* Prices */}
                              <td className="py-3.5 px-3 sm:px-4 text-right">
                                {settings?.show_mrp !== 'no' && (
                                  <div className="text-slate-400 text-[10px] line-through">₹{formatCurrency(prod.mrp)}</div>
                                )}
                                <div className="text-crimson-655 font-extrabold">₹{formatCurrency(prod.selling_price)}</div>
                              </td>

                              {/* Qty selectors */}
                              <td className="py-3.5 px-3 sm:px-4 text-center">
                                <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 sm:p-1 select-none">
                                  <button
                                    onClick={() => decreaseQty(prod.id)}
                                    className="w-6 h-6 sm:w-7 sm:h-7 text-slate-655 hover:text-slate-900 hover:bg-white rounded flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                                  >
                                    <i className="fa-solid fa-minus text-[8px] sm:text-[9px]"></i>
                                  </button>
                                  <input
                                    type="number"
                                    value={qty || ''}
                                    onChange={(e) => updateQty(prod, e.target.value)}
                                    placeholder="0"
                                    className="w-8 sm:w-12 text-center bg-transparent border-0 text-xs font-black text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    onClick={() => increaseQty(prod)}
                                    className="w-6 h-6 sm:w-7 sm:h-7 text-slate-655 hover:text-slate-900 hover:bg-white rounded flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                                  >
                                    <i className="fa-solid fa-plus text-[8px] sm:text-[9px]"></i>
                                  </button>
                                </div>
                              </td>

                              {/* Row Total (Desktop only) */}
                              <td className="hidden md:table-cell py-3.5 px-4 text-right font-extrabold text-slate-800 pr-6">
                                ₹{formatCurrency(rowTotal)}
                              </td>

                              {/* Sub Total (always visible) */}
                              <td className="py-3.5 px-3 sm:px-4 text-right pr-4">
                                <span className="font-extrabold text-crimson-600">
                                  {qty > 0 ? `₹${formatCurrency(rowTotal)}` : '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View List */}
            <div className="block sm:hidden divide-y divide-slate-150">
              {categories.map((cat) => {
                if (!shouldShowCategory(cat.slug)) return null;

                const isCollapsed = collapsedCategories.has(cat.slug);
                const filteredProducts = cat.products.filter((prod) => shouldShowProduct(cat.slug, prod));
                if (filteredProducts.length === 0) return null;

                return (
                  <React.Fragment key={cat.id}>
                    {/* Category Header (Mobile) */}
                    <div
                      onClick={() => toggleCategoryCollapse(cat.slug)}
                      className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200/80 select-none cursor-pointer hover:bg-slate-100 transition-colors py-3 px-3.5 flex items-center justify-between text-crimson-655 tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-fire text-[10px] text-crimson-500"></i>
                        <span>{cat.name}</span>
                      </div>
                      <i
                        className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      ></i>
                    </div>

                    {/* Products list within Category (Mobile) */}
                    {!isCollapsed && filteredProducts.map((prod) => {
                      const cartItem = cart[prod.id];
                      const qty = cartItem ? cartItem.qty : 0;
                      const rowTotal = qty * parseFloat(prod.selling_price);

                      return (
                        <div key={prod.id} className="p-3 sm:p-4 flex flex-col gap-2 hover:bg-slate-50/50 transition-colors border-b border-slate-150 last:border-b-0">
                          {/* Title on top */}
                          <h4 className="font-extrabold text-slate-800 text-[11px] sm:text-xs leading-normal whitespace-nowrap truncate">{prod.name}</h4>
                          
                          {/* Specs, price, qty, subtotal underneath */}
                          <div className="flex items-center justify-between gap-1">
                            
                            {/* Image + Specs */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className={`flex w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 items-center justify-center text-slate-400 overflow-hidden flex-shrink-0 ${prod.image ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                                onClick={prod.image ? () => setPopProduct({ prod, catName: cat.name }) : undefined}
                              >
                                {prod.image ? (
                                  <img src={`/${prod.image}`} alt={prod.name} className="object-cover w-full h-full" />
                                ) : (
                                  <i className="fa-solid fa-sparkles text-xs text-crimson-450/40"></i>
                                )}
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[65px] leading-tight mb-0.5">{cat.name}</span>
                                <span className="text-[8.5px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-lg shadow-sm whitespace-nowrap leading-none">
                                  {prod.pack_size}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-left flex-shrink-0 px-1">
                              {settings?.show_mrp !== 'no' && (
                                <div className="text-slate-400 text-[9px] line-through font-bold leading-tight">₹{formatCurrency(prod.mrp)}</div>
                              )}
                              <div className="text-slate-800 font-extrabold text-[11px] leading-tight">₹{formatCurrency(prod.selling_price)}</div>
                            </div>

                            {/* Qty selectors */}
                            <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 select-none flex-shrink-0">
                              <button
                                onClick={() => decreaseQty(prod.id)}
                                className="w-5 h-5 text-slate-655 hover:text-slate-900 hover:bg-white rounded flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                              >
                                <i className="fa-solid fa-minus text-[7px]"></i>
                              </button>
                              <input
                                type="number"
                                value={qty || ''}
                                onChange={(e) => updateQty(prod, e.target.value)}
                                placeholder="0"
                                className="w-7 text-center bg-transparent border-0 text-[10px] font-black text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() => increaseQty(prod)}
                                className="w-5 h-5 text-slate-655 hover:text-slate-900 hover:bg-white rounded flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                              >
                                <i className="fa-solid fa-plus text-[7px]"></i>
                              </button>
                            </div>

                            {/* Row total */}
                            <div className="text-right flex-shrink-0 min-w-[3.5rem]">
                              <span className="font-extrabold text-[11px] text-crimson-600">
                                {qty > 0 ? `₹${formatCurrency(rowTotal)}` : '—'}
                              </span>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>

          </div>
        ) : (
          /* Grid View Layout */
          <div className="space-y-8">
            {categories.map((cat) => {
              if (!shouldShowCategory(cat.slug)) return null;

              const isCollapsed = collapsedCategories.has(cat.slug);

              // Find products that match active filter / search query
              const filteredProducts = cat.products.filter((prod) => shouldShowProduct(cat.slug, prod));
              if (filteredProducts.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-4">
                  {/* Category Section Header */}
                  <div
                    onClick={() => toggleCategoryCollapse(cat.slug)}
                    className="border border-[#E2DDD9] rounded-2xl p-4 flex items-center justify-between text-crimson-655 font-bold tracking-wider cursor-pointer hover:opacity-90 transition-colors select-none shadow-sm"
                    style={cardBgStyle}
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-fire text-xs text-crimson-500 animate-pulse"></i>
                      <span>{cat.name}</span>
                    </div>
                    <i
                      className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    ></i>
                  </div>

                  {/* Grid of Product Cards */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                      {filteredProducts.map((prod) => {
                        const cartItem = cart[prod.id];
                        const qty = cartItem ? cartItem.qty : 0;
                        const rowTotal = qty * parseFloat(prod.selling_price);

                        return (
                          <div
                            key={prod.id}
                            style={qty > 0 ? undefined : cardBgStyle}
                            className={`border rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-all duration-200 relative overflow-hidden group ${
                              qty > 0 ? 'border-crimson-300 ring-1 ring-crimson-200/50 bg-crimson-50/20' : 'border-[#E2DDD9]'
                            }`}
                          >
                            {/* Upper Card Area: Image + Details */}
                            <div className="space-y-1.5 sm:space-y-2">
                              {/* Image Container with Hover Effect */}
                              <div 
                                className={`w-full h-36 sm:h-40 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden relative ${prod.image ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
                                onClick={prod.image ? () => setPopProduct({ prod, catName: cat.name }) : undefined}
                              >
                                {prod.image ? (
                                  <img
                                    src={`/${prod.image}`}
                                    alt={prod.name}
                                    className="object-contain w-full h-full p-1.5 group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <i className="fa-solid fa-sparkles text-2xl text-crimson-450/30"></i>
                                )}

                                {/* Category Label Overlay */}
                                <span className="absolute top-1.5 left-1.5 text-[7px] sm:text-[8px] font-black text-slate-700 bg-white/90 backdrop-blur border border-slate-250 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  {cat.name}
                                </span>

                                {/* Pack size Label Overlay */}
                                <span className="absolute top-1.5 right-1.5 text-[7px] sm:text-[8.5px] font-bold text-slate-500 bg-slate-100/90 border border-slate-200 px-1.5 py-0.5 rounded-lg font-mono">
                                  {prod.pack_size}
                                </span>
                              </div>

                              {/* Title & Info */}
                              <div className="pt-0.5">
                                <h4 className="font-extrabold text-slate-800 text-xs sm:text-xs leading-snug line-clamp-2">
                                  {prod.name}
                                </h4>
                              </div>
                            </div>

                            {/* Lower Card Area: Pricing & Actions */}
                            <div className="mt-2 pt-2 border-t border-slate-200/70 space-y-1.5">
                              {/* Prices Row */}
                              <div className="flex items-baseline justify-between gap-1">
                                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">Price:</span>
                                <div className="text-right">
                                  {settings?.show_mrp !== 'no' && (
                                    <span className="text-slate-400 text-[9px] sm:text-[10px] line-through mr-1 font-bold">₹{formatCurrency(prod.mrp)}</span>
                                  )}
                                  <span className="text-crimson-650 font-black text-xs sm:text-sm">₹{formatCurrency(prod.selling_price)}</span>
                                </div>
                              </div>

                              {/* Qty Selector */}
                              <div className="flex items-center justify-between gap-1 pt-0.5">
                                <div className="inline-flex items-center bg-slate-100/80 border border-slate-200 rounded-lg p-0.5 select-none w-full justify-between">
                                  <button
                                    type="button"
                                    onClick={() => decreaseQty(prod.id)}
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-slate-655 hover:text-slate-900 hover:bg-white rounded flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                                  >
                                    <i className="fa-solid fa-minus text-[7px] sm:text-[8px]"></i>
                                  </button>
                                  <input
                                    type="number"
                                    value={qty || ''}
                                    onChange={(e) => updateQty(prod, e.target.value)}
                                    placeholder="0"
                                    className="w-6 sm:w-8 text-center bg-transparent border-0 text-[10px] sm:text-xs font-black text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => increaseQty(prod)}
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-slate-655 hover:text-slate-900 hover:bg-white rounded flex items-center justify-center font-bold text-xs transition-colors shadow-sm"
                                  >
                                    <i className="fa-solid fa-plus text-[7px] sm:text-[8px]"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detailed Quick View Modal */}
      {popProduct && (() => {
        const prod = popProduct.prod;
        const catName = popProduct.catName;
        const qty = cart[prod.id]?.qty || 0;
        const rowTotal = qty * parseFloat(prod.selling_price);
        const discountPercent = Math.round(((parseFloat(prod.mrp) - parseFloat(prod.selling_price)) / parseFloat(prod.mrp)) * 100);

        return (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 cursor-pointer"
            onClick={() => setPopProduct(null)}
          >
            <div 
              className="relative bg-white border border-slate-200 rounded-3xl p-5 md:p-6 max-w-3xl w-full shadow-2xl select-none cursor-default animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPopProduct(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-crimson-600 hover:bg-crimson-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 z-10"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>

              {/* Grid Split Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left Column: Image */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-150 p-2.5 rounded-2xl flex items-center justify-center h-64 md:h-80 overflow-hidden shadow-inner">
                  <img 
                    src={`/${prod.image}`} 
                    alt={prod.name} 
                    className="max-w-full max-h-full object-contain rounded-xl"
                  />
                </div>

                {/* Right Column: Detailed Info & Cart Selectors */}
                <div className="md:col-span-7 space-y-4 text-left">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black text-crimson-600 bg-crimson-50 border border-crimson-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {catName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-mono">
                      {prod.pack_size}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {prod.name}
                  </h3>

                  {/* Prices & Savings */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                    {settings?.show_mrp !== 'no' && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Original MRP:</span>
                        <span className="text-slate-400 font-bold line-through text-xs sm:text-sm">₹{formatCurrency(prod.mrp)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-550 font-extrabold uppercase tracking-wider">Wholesale Price:</span>
                      <span className="text-crimson-600 font-black text-lg sm:text-xl">₹{formatCurrency(prod.selling_price)}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[10px]">
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">
                          Flat {discountPercent}% Off
                        </span>
                        <span className="text-slate-500 font-semibold">
                          Save ₹{formatCurrency(parseFloat(prod.mrp) - parseFloat(prod.selling_price))} per item!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity & Subtotal Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                    <div className="space-y-1.5 w-full sm:w-auto">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Order Quantity</span>
                      <div className="inline-flex items-center bg-slate-100 border border-slate-250 rounded-xl p-1 select-none">
                        <button
                          type="button"
                          onClick={() => decreaseQty(prod.id)}
                          className="w-8 h-8 text-slate-655 hover:text-slate-900 hover:bg-white rounded-lg flex items-center justify-center font-bold text-sm transition-all shadow-sm"
                        >
                          <i className="fa-solid fa-minus text-[10px]"></i>
                        </button>
                        <input
                          type="number"
                          value={qty || ''}
                          onChange={(e) => updateQty(prod, e.target.value)}
                          placeholder="0"
                          className="w-12 text-center bg-transparent border-0 text-sm font-black text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => increaseQty(prod)}
                          className="w-8 h-8 text-slate-655 hover:text-slate-900 hover:bg-white rounded-lg flex items-center justify-center font-bold text-sm transition-all shadow-sm"
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto">
                      {qty > 0 ? (
                        <>
                          <div className="text-[9px] text-slate-450 font-black uppercase tracking-wider">Subtotal</div>
                          <span className="font-black text-base text-crimson-600 block">
                            ₹{formatCurrency(rowTotal)}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Not added to booking yet</span>
                      )}
                    </div>
                  </div>

                  {/* PESO / Quality guidelines banner info */}
                  <div className="text-[9px] text-slate-400 leading-normal flex items-start gap-1.5 pt-2 border-t border-slate-100">
                    <i className="fa-solid fa-shield-halved text-slate-350 mt-0.5"></i>
                    <span>
                      Sivakasi manufactured premium crackers. Store in cool, dry place. Keep out of reach of children. Ignite under adult supervision.
                    </span>
                  </div>

                </div>

              </div>

            </div>
          </div>
        );
      })()}
    </section>
  );
}

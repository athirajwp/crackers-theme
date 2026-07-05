import React from 'react';
import { useStore } from '../context/StoreContext';

export default function CartFooter({ onCheckoutClick }) {
  const {
    settings,
    totalQty,
    totalMrp,
    totalNet,
    totalUniqueProducts,
    totalDiscount,
    clearCart,
  } = useStore();

  const enableMinOrder = settings.enable_min_order === 'yes';
  const minOrderValue = settings.min_order_value || 3800;

  const minOrderProgressPercent = () => {
    if (totalNet >= minOrderValue) return 100;
    return (totalNet / minOrderValue) * 100;
  };

  const minOrderProgressText = () => {
    if (totalNet >= minOrderValue) return 'Met!';
    const needed = minOrderValue - totalNet;
    return `Need ₹${needed.toFixed(2)} more`;
  };

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const handleClearCart = () => {
    window.Swal.fire({
      title: 'Clear Cart?',
      text: 'Are you sure you want to remove all items from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e51d1d',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, clear it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        window.Swal.fire({
          title: 'Cleared!',
          text: 'Your cart has been cleared successfully.',
          icon: 'success',
          confirmButtonColor: '#e51d1d',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  if (totalQty === 0) return null;

  const isCheckoutDisabled = enableMinOrder && totalNet < minOrderValue;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/80 shadow-2xl py-2.5 backdrop-blur-md px-4 select-none">
      <div className="container mx-auto max-w-5xl flex flex-col lg:flex-row gap-3 items-center justify-between">
        
        {/* Cart details totals summary */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-500 w-full lg:w-auto font-medium">
          {/* Total Items */}
          <div className="flex items-center gap-1.5 text-slate-800">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Total Items:</span>
            <strong className="text-sm font-black text-crimson-600">{totalQty}</strong>
            <span className="text-slate-300">/</span>
            <strong className="text-slate-700 font-bold">{totalUniqueProducts}</strong>{' '}
            <span className="text-[9px] text-slate-400 uppercase font-extrabold">Products</span>
          </div>

          <span className="hidden sm:inline text-slate-350">|</span>

          {/* MRP */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Original MRP:</span>
            <span className="line-through font-semibold text-slate-450">₹{formatCurrency(totalMrp)}</span>
          </div>

          <span className="hidden sm:inline text-slate-350">|</span>

          {/* Savings */}
          <div className="text-crimson-750 bg-crimson-50 border border-crimson-100 px-2.5 py-0.5 rounded-lg shadow-sm flex items-center gap-1.5 font-medium">
            <span className="text-[9px] text-crimson-500 uppercase tracking-wider font-extrabold">Savings:</span>
            <strong className="font-extrabold text-xs">₹{formatCurrency(totalDiscount)}</strong>
          </div>

          {enableMinOrder && (
            <>
              <span className="hidden sm:inline text-slate-350">|</span>
              <div className="flex items-center gap-1.5 text-slate-800">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Min Order:</span>
                <strong className="font-bold text-slate-700">₹{formatCurrency(minOrderValue)}</strong>
              </div>
            </>
          )}

          <span className="hidden sm:inline text-slate-350">|</span>

          {/* Net Payable Amount */}
          <div className="flex items-center gap-1.5 text-slate-800">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Net Payable:</span>
            <strong className="text-base font-black text-crimson-600">₹{formatCurrency(totalNet)}</strong>
          </div>
        </div>

        {/* Checkout controls & meter progress */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto items-center justify-center lg:justify-end">
          
          {/* Minimum Order Value Progress bar */}
          {enableMinOrder && totalNet < minOrderValue && (
            <div className="w-full sm:w-44 text-center space-y-1">
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase px-0.5">
                <span>Min Order check</span>
                <span className="text-crimson-655">{minOrderProgressText()}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 border border-slate-300 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-crimson-600 to-crimson-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${minOrderProgressPercent()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Clear All Button */}
          <button
            onClick={handleClearCart}
            className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700 hover:border-slate-300 shadow-sm"
          >
            <i className="fa-solid fa-trash text-crimson-600"></i>
            <span>Clear All</span>
          </button>

          {/* Checkout Action Button */}
          <button
            onClick={onCheckoutClick}
            disabled={isCheckoutDisabled}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              !isCheckoutDisabled
                ? 'bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-700 hover:to-crimson-600 text-white shadow-md shadow-crimson-100 hover:scale-105 active:scale-95'
                : 'bg-slate-200 border border-slate-350 text-slate-400 cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-basket-shopping"></i>
            <span>Checkout Now</span>
          </button>

        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useStore } from '../context/StoreContext';

export default function Terms() {
  const { settings } = useStore();

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  return (
    <div className="relative text-slate-800 select-none">
      {/* 1. Premium Glassmorphic Hero Banner */}
      <section className="relative bg-white border-b border-slate-200 overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-crimson-100/20 via-white to-slate-50 opacity-90 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-gold-50 border border-gold-200 text-gold-700 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
            <i className="fa-solid fa-scale-balanced text-crimson-600"></i> Official Booking Policy
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Terms & Conditions
          </h2>
          <p className="text-xs text-slate-550 max-w-xl mx-auto leading-relaxed font-semibold">
            Please review our official terms, payment policies, delivery frameworks, and transport conditions before placing your fireworks booking.
          </p>
        </div>
      </section>

      {/* 2. Terms and Conditions Main Content Area */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-slate-50/50 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-6">
            {settings.terms_conditions && settings.terms_conditions.trim() !== '' ? (
              <div
                className="text-slate-650 space-y-4 font-medium"
                dangerouslySetInnerHTML={{ __html: settings.terms_conditions }}
              />
            ) : (
              /* Fallback default terms */
              <div className="space-y-8 text-slate-550 font-medium">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <i className="fa-solid fa-circle-check text-crimson-600"></i> 1. Booking Eligibility & Order Guidelines
                  </h3>
                  <p>
                    By placing an order on our online booking storefront, you confirm that you are at least 18 years of age and authorized to purchase fireworks products in your local jurisdiction.
                  </p>
                  <p>
                    All items added to your cart represent Sivakasi wholesale stock and are subject to availability. The minimum purchase value to qualify for transport delivery is strictly <strong>₹{formatCurrency(settings.min_order_value)}</strong> (net payable value after flat discounts are calculated).
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <i className="fa-solid fa-circle-check text-crimson-600"></i> 2. Pricing, Discounts & Wholesale Schemes
                  </h3>
                  <p>
                    All products listed indicate their official Maximum Retail Price (MRP) alongside our discounted Sivakasi wholesale rate (a standard <strong>{settings.discount_percent}% off</strong>). Prices are subject to change in line with chemical feedstock costs, but prices locked in at order submission remain fully guaranteed.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <i className="fa-solid fa-circle-check text-crimson-600"></i> 3. Delivery via Lorry Transport & Packing
                  </h3>
                  <p>
                    Because firecrackers cannot be sent via standard couriers (such as DTDC or BlueDart) due to explosive hazard regulations, all consignments are dispatched exclusively through registered parcel lorry transport services.
                  </p>
                  <p>
                    We pack all items in heavy-duty cardboard boxes wrapped in waterproof sheets to prevent damage. Freight charges are paid directly to the transport provider upon delivery at their designated hub (To-Pay basis).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

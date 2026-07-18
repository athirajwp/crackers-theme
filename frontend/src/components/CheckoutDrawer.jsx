import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function CheckoutDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    settings,
    cart,
    totalQty,
    totalNet,
    clearCart,
    appliedPromo,
    promoDiscount,
    promoMessage,
    promoSuccess,
    applyPromoCode,
    taxAmount,
    deliveryCharge,
    finalPayableAmount,
  } = useStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: 'Tamilnadu',
    pincode: '',
    transport_name: '',
    notes: '',
  });

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = () => {
    applyPromoCode(promoCodeInput);
  };

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const orderItems = Object.values(cart)
      .filter((item) => item.qty > 0)
      .map((item) => ({
        id: item.id,
        qty: item.qty,
      }));

    const payload = {
      ...form,
      promo_code: appliedPromo,
      items: orderItems,
    };

    fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || 'Failed to place order.');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSubmitting(false);
        if (data.success) {
          // Clear cart
          clearCart();
          // Extract order number from redirect URL or similar
          // Redirect URL format: http://127.0.0.1:8000/checkout/success/ORD-XXXXX
          const urlParts = data.redirect.split('/');
          const orderNumber = urlParts[urlParts.length - 1];

          onClose();
          navigate(`/checkout/success/${orderNumber}`);
        } else {
          window.Swal.fire({
            title: 'Error!',
            text: data.error || 'Failed to place order.',
            icon: 'error',
            confirmButtonColor: '#e51d1d',
          });
        }
      })
      .catch((error) => {
        setSubmitting(false);
        window.Swal.fire({
          title: 'Error!',
          text: error.message || 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#e51d1d',
        });
      });
  };

  const enablePromoCodes = settings.enable_promo_codes === 'yes';
  const enableTaxDelivery = settings.enable_tax_delivery === 'yes';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg">
          <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between select-none">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-basket-shopping text-crimson-655"></i> Finalize Booking
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Provide shipping details to book Sivakasi crackers
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-655 p-2 rounded-lg transition-colors">
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <i className="fa-solid fa-user mr-1 text-crimson-500/80"></i>Full Name{' '}
                    <span className="text-crimson-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <i className="fa-solid fa-phone mr-1 text-crimson-500/80"></i>Mobile Number{' '}
                      <span className="text-crimson-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Active Mobile Number"
                      value={form.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <i className="fa-brands fa-whatsapp mr-1 text-crimson-500/80"></i>WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      placeholder="WhatsApp Number (Optional)"
                      value={form.whatsapp}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <i className="fa-solid fa-envelope mr-1 text-crimson-500/80"></i>Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address (Optional)"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <i className="fa-solid fa-location-dot mr-1 text-crimson-500/80"></i>Delivery Address
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    placeholder="Full Delivery Address"
                    value={form.address}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <i className="fa-solid fa-map-pin mr-1 text-crimson-500/80"></i>Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Landmark (Optional)"
                      value={form.landmark}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <i className="fa-solid fa-city mr-1 text-crimson-500/80"></i>City / Town
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City or Town"
                      value={form.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <i className="fa-solid fa-globe mr-1 text-crimson-500/80"></i>State
                    </label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none transition-all"
                    >
                      <option value="Tamilnadu">Tamilnadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Puducherry">Puducherry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <i className="fa-solid fa-map-location mr-1 text-crimson-500/80"></i>Pin Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pin Code"
                      value={form.pincode}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <i className="fa-solid fa-truck-ramp-box mr-1 text-crimson-500/80"></i>Preferred Lorry Transport Name
                  </label>
                  <input
                    type="text"
                    name="transport_name"
                    placeholder="Preferred Transport Name (Optional)"
                    value={form.transport_name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Promo Code Input */}
                {enablePromoCodes && (
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <i className="fa-solid fa-ticket mr-1 text-crimson-500/80"></i>Promo / Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMessage && (
                      <span
                        className={`text-[10px] block mt-1 font-bold ${
                          promoSuccess ? 'text-emerald-600' : 'text-crimson-600'
                        }`}
                      >
                        {promoMessage}
                      </span>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <i className="fa-solid fa-pencil mr-1 text-crimson-500/80"></i>Special Delivery Instructions
                  </label>
                  <textarea
                    name="notes"
                    rows="2"
                    placeholder="Instructions/Notes (Optional)"
                    value={form.notes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Drawer Footer breakdown */}
              <div className="pt-4 border-t border-slate-250 space-y-4 mt-auto">
                {enableTaxDelivery || (enablePromoCodes && appliedPromo) ? (
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs font-semibold">
                    <div className="flex justify-between text-slate-500">
                      <span>Items Net Value:</span>
                      <span>₹{formatCurrency(totalNet)}</span>
                    </div>
                    {enablePromoCodes && appliedPromo && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Promo Code Discount:</span>
                        <span>-₹{formatCurrency(promoDiscount)}</span>
                      </div>
                    )}
                    {enableTaxDelivery && (
                      <>
                        <div className="flex justify-between text-slate-500">
                          <span>GST / Tax ({settings.tax_percent}%):</span>
                          <span>₹{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Delivery Charge:</span>
                          <span>₹{formatCurrency(deliveryCharge)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-slate-800 border-t border-slate-200 pt-2 font-black">
                      <span>Final Payable Total:</span>
                      <span className="text-crimson-655 text-sm font-black">₹{formatCurrency(finalPayableAmount)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Total Net Booking Amount:</span>
                    <span className="text-crimson-650 font-extrabold text-sm">₹{formatCurrency(totalNet)}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-700 hover:to-crimson-600 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider shadow transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin mr-1"></i>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-file-invoice-dollar mr-1"></i>
                      <span>Submit & Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

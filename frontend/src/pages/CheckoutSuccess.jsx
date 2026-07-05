import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CheckoutSuccess() {
  const { orderNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/checkout/success/${orderNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load success details:', err);
        setLoading(false);
      });
  }, [orderNumber]);

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
        <p className="text-sm font-semibold text-slate-500">Loading invoice details...</p>
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-rose-600">Order Not Found!</h2>
        <p className="text-xs text-slate-500 font-semibold mt-2">
          We couldn't retrieve the invoice details for booking reference: {orderNumber}.
        </p>
      </div>
    );
  }

  const { order, whatsappUrl } = data;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-slate-800">
      {/* Congratulations Header */}
      <div className="text-center space-y-4 mb-10 select-none">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-3xl shadow-sm">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Order Booking Successful!</h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed font-semibold">
          Your booking is registered. Please click the WhatsApp button below to confirm your order details and coordinate delivery options!
        </p>
      </div>

      {/* Main Success Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left: Order Invoice Details */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Invoice Title & Print actions */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Details</h3>
              <span className="text-base font-extrabold text-slate-800 tracking-wider font-mono select-all">
                {order.order_number}
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <i className="fa-solid fa-print text-crimson-600"></i> Print Invoice
            </button>
          </div>

          {/* Customer Shipping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-655 font-semibold">
            <div className="space-y-2">
              <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Billing / Delivery Address</div>
              <div className="font-extrabold text-slate-800">{order.name}</div>
              <div className="leading-relaxed">{order.address}</div>
              {order.landmark && (
                <div className="text-slate-500">
                  <strong className="text-slate-400 text-[10px] uppercase font-bold">Landmark:</strong> {order.landmark}
                </div>
              )}
              <div>
                {order.city}, {order.state} - <strong>{order.pincode}</strong>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Booking Details</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Mobile:</span>
                <strong className="text-slate-800 font-mono select-all">{order.phone}</strong>
              </div>
              {order.whatsapp && (
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp:</span>
                  <strong className="text-slate-800 font-mono select-all">{order.whatsapp}</strong>
                </div>
              )}
              {order.transport_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Transport Lorry:</span>
                  <strong className="text-crimson-605 font-bold">{order.transport_name}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Order Date:</span>
                <span className="text-slate-700 font-bold">
                  {new Date(order.created_at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Order Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="select-none">
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-3 sm:px-4">Item Details</th>
                    <th className="hidden sm:table-cell py-3.5 px-4 text-center">Unit</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right">Price (₹)</th>
                    <th className="py-3.5 px-3 sm:px-4 text-center">Qty</th>
                    <th className="py-3.5 px-3 sm:px-4 text-right">Sub Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold">
                  {order.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-3 sm:px-4 text-slate-800">
                        <div className="font-bold text-xs leading-normal">{item.product_name}</div>
                        <span className="sm:hidden text-[9px] font-bold text-slate-400 font-mono">{item.pack_size}</span>
                      </td>
                      <td className="hidden sm:table-cell py-3.5 px-4 text-slate-500 text-center font-mono">
                        {item.pack_size}
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-right font-medium text-slate-655">
                        ₹{formatCurrency(item.price)}
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-center text-slate-700 font-mono font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-right font-extrabold text-crimson-600">
                        ₹{formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Totals Panel */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 text-xs font-semibold">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal printed MRP sum:</span>
              <span className="line-through">₹{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-crimson-655">
              <span>Discount Savings:</span>
              <span className="font-black">-₹{formatCurrency(order.discount_amount)}</span>
            </div>

            <div className="flex justify-between text-slate-800 border-t border-slate-200 pt-2.5 text-sm font-black">
              <span>Net Amount Payable:</span>
              <span className="text-crimson-650 text-base font-black">₹{formatCurrency(order.net_amount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Confirmation */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-center">
            <span className="inline-flex bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              <i className="fa-brands fa-whatsapp mr-1"></i> Fast Confirmation
            </span>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-black">Confirm Booking</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Please share your order details with us on WhatsApp to verify your booking and discuss delivery and offline payment logistics!
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-full text-xs uppercase tracking-wider shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i>
              <span>Confirm on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

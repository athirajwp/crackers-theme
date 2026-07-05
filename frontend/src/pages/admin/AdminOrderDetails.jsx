import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const Swal = window.Swal;

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states for status update
  const [orderStatus, setOrderStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [transportName, setTransportName] = useState('');
  const [lrNumber, setLrNumber] = useState('');

  const fetchOrderDetails = () => {
    setLoading(true);
    fetch(`/api/admin/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        if (resData.order) {
          setOrderStatus(resData.order.order_status);
          setPaymentStatus(resData.order.payment_status);
          setTransportName(resData.order.transport_name || '');
          setLrNumber(resData.order.lr_number || '');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load order:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: orderStatus,
          payment_status: paymentStatus,
          transport_name: transportName,
          lr_number: lrNumber,
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Order Updated!',
          text: 'Statuses and logistics notes have been saved.',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchOrderDetails();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: resData.error || 'Please review input constraints.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update order status.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
          <p className="text-sm font-semibold text-slate-500">Loading order log details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data || !data.order) {
    return (
      <AdminLayout>
        <div className="text-center py-20 animate-fade-in">
          <h2 className="text-xl font-bold text-rose-600">Booking Order Not Found!</h2>
          <p className="text-xs text-slate-500 font-semibold mt-2">Could not retrieve invoice metrics.</p>
        </div>
      </AdminLayout>
    );
  }

  const { order } = data;

  // Prepare Whatsapp payload text
  const storeName = 'Cracker Store';
  let waMessage = `Hello *${order.name}*,\n\n`
    + `Here is the invoice summary for your order at *${storeName}*:\n\n`
    + `*Order Number:* ${order.order_number}\n`
    + `*Order Date:* ${new Date(order.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n`
    + `*Net Amount:* ₹${formatCurrency(order.net_amount)}\n`
    + `*Order Status:* ${order.order_status.toUpperCase()}\n`
    + `*Payment Status:* ${order.payment_status.toUpperCase()}\n\n`
    + `*Order Items Summary:*\n`;

  order.items?.forEach((item) => {
    waMessage += `• ${item.product_name} (Qty: ${item.quantity}) - ₹${formatCurrency(item.total_price)}\n`;
  });

  waMessage += `\nTrack your order here: ${window.location.origin}/track?query=${order.order_number}\n\n`
    + `Thank you for booking with us!`;

  let targetPhone = String(order.whatsapp || order.phone).replace(/[^0-9]/g, '');
  if (targetPhone.length === 10) {
    targetPhone = '91' + targetPhone;
  }
  const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(waMessage)}`;

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header & Quick actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Link to="/admin/orders" className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              <span>Order Booking Management</span>
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none font-bold">
              Reference: <strong className="text-slate-700 font-mono select-all">{order.order_number}</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i> Send WhatsApp Invoice
            </a>
            <Link
              to={`/admin/orders/${order.id}/invoice`}
              target="_blank"
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <i className="fa-solid fa-file-invoice text-crimson-600"></i> View Retail Invoice
            </Link>
          </div>
        </div>

        {/* Main detail layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left panel details */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-3">
              Client Booking Information
            </h3>

            {/* Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                  Delivery Address
                </span>
                <strong className="text-slate-800 text-sm">{order.name}</strong>
                <p className="leading-relaxed text-slate-655">{order.address}</p>
                {order.landmark && (
                  <p className="text-slate-500">
                    <strong className="text-slate-400 text-[9px] uppercase font-black">Landmark:</strong>{' '}
                    {order.landmark}
                  </p>
                )}
                <div>
                  {order.city}, {order.state} - <strong>{order.pincode}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                  Contact Coordinates
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <strong className="text-slate-800 font-mono select-all">{order.phone}</strong>
                </div>
                {order.whatsapp && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">WhatsApp:</span>
                    <strong className="text-slate-800 font-mono select-all">{order.whatsapp}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Date:</span>
                  <strong className="text-slate-750">
                    {new Date(order.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Order Items section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Booked Items
                </h4>
                <Link
                  to={`/admin/orders/${order.id}/edit-items`}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                >
                  <i className="fa-solid fa-pen-to-square text-blue-500 mr-1"></i> Edit Items list
                </Link>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 font-bold text-[9px] uppercase tracking-wider">
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-4 text-center">Unit Pack</th>
                      <th className="py-3 px-4 text-right">Price (₹)</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold">
                    {order.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-800 font-bold">{item.product_name}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500">{item.pack_size}</td>
                        <td className="py-3 px-4 text-right font-medium font-mono">₹{formatCurrency(item.price)}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-crimson-600 font-mono">
                          ₹{formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal MRP sum:</span>
                  <span className="line-through">₹{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-crimson-655">
                  <span>Discount Savings:</span>
                  <span className="font-black">-₹{formatCurrency(order.discount_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-800 border-t border-slate-200 pt-2.5 text-sm font-black">
                  <span>Net Price Payable:</span>
                  <span className="text-crimson-650 text-base font-black">₹{formatCurrency(order.net_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Update parameters */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Logistics & Statuses
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Order Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Packing</option>
                  <option value="shipped">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Lorry Transport Name
                </label>
                <input
                  type="text"
                  value={transportName}
                  onChange={(e) => setTransportName(e.target.value)}
                  placeholder="e.g. SRM Lorry Transport, KPN"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Lorry LR Number / Slip
                </label>
                <input
                  type="text"
                  value={lrNumber}
                  onChange={(e) => setLrNumber(e.target.value)}
                  placeholder="e.g. LR-492949-A"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-crimson-600 hover:bg-crimson-500 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-crimson-100 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Save Logistics updates'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

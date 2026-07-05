import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || 'all';
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const statusQuery = activeStatus !== 'all' ? `?status=${activeStatus}` : '';
    fetch(`/api/admin/orders${statusQuery}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus]);

  const handleStatusChange = (status) => {
    if (status === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
  };

  const getOrderStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 border-amber-200 text-amber-600';
      case 'approved': return 'bg-sky-50 border-sky-250 text-sky-600';
      case 'processing': return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'shipped': return 'bg-purple-50 border-purple-200 text-purple-600';
      case 'delivered': return 'bg-emerald-50 border-emerald-200 text-emerald-600';
      case 'cancelled': return 'bg-rose-50 border-rose-200 text-rose-600';
      default: return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 border-amber-200 text-amber-600';
      case 'paid': return 'bg-emerald-50 border-emerald-200 text-emerald-600';
      case 'verified': return 'bg-sky-50 border-sky-200 text-sky-600';
      default: return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  });

  const statuses = [
    { slug: 'all', label: 'All Bookings' },
    { slug: 'pending', label: 'Pending' },
    { slug: 'approved', label: 'Approved' },
    { slug: 'processing', label: 'Packing' },
    { slug: 'shipped', label: 'Dispatched' },
    { slug: 'delivered', label: 'Delivered' },
    { slug: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Client Bookings Registry</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
              Review and dispatch client cracker bookings
            </p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {statuses.map((s) => (
            <button
              key={s.slug}
              onClick={() => handleStatusChange(s.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                activeStatus === s.slug
                  ? 'bg-crimson-600 text-white shadow-md shadow-crimson-600/10'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Bookings Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          {/* Search bar */}
          <div className="flex justify-between items-center">
            <div className="relative w-full sm:max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-crimson-500 transition-colors">
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search by order ref, customer, phone..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-300 focus:bg-white focus:ring-4 focus:ring-crimson-50/50 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655"
                >
                  <i className="fa-solid fa-circle-xmark text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <i className="fa-solid fa-spinner animate-spin text-2xl text-crimson-600"></i>
              <p className="text-[11px] font-semibold text-slate-400 mt-2">Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/20 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[9px] select-none">
                    <th className="py-3.5 px-4">Order Code</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Region / Delivery</th>
                    <th className="py-3.5 px-4 text-right">Net Price (₹)</th>
                    <th className="py-3.5 px-4 text-center">Payment</th>
                    <th className="py-3.5 px-4 text-center">Logistics</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-650 font-semibold">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold tracking-wider text-slate-800 select-all">
                        {order.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800">{order.name}</div>
                        <div className="text-[10px] text-slate-450 font-mono select-all leading-none mt-0.5">
                          {order.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 leading-normal">{order.city}</div>
                        <div className="text-[9px] text-slate-400 leading-none">
                          {order.state} - {order.pincode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-crimson-655 font-mono">
                        ₹{formatCurrency(order.net_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${getOrderStatusBadgeClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                        {order.transport_name && (
                          <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider truncate max-w-[120px] mx-auto">
                            {order.transport_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 w-8 h-8 rounded-lg text-slate-650 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                          title="Manage Booking"
                        >
                          <i className="fa-solid fa-arrow-right text-xs"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 font-bold italic">
                        <i className="fa-solid fa-inbox text-2xl mb-2 block text-slate-300"></i>
                        <span>No booked orders registered under this criteria.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

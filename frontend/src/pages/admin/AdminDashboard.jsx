import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
          <p className="text-sm font-semibold text-slate-500">Loading metrics dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-rose-600">Failed to load metrics!</h2>
          <p className="text-xs text-slate-500 font-semibold mt-2">Could not retrieve stats from API.</p>
        </div>
      </AdminLayout>
    );
  }

  const { stats, recentOrders } = data;

  const cards = [
    {
      title: 'Total Bookings',
      value: stats.total_orders,
      icon: 'fa-receipt',
      colorClass: 'text-slate-800',
      bgClass: 'bg-slate-50 border-slate-200',
    },
    {
      title: 'Pending Bookings',
      value: stats.pending_orders,
      icon: 'fa-spinner-third animate-spin',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'Verified Revenue',
      value: `₹${formatCurrency(stats.total_revenue)}`,
      icon: 'fa-money-bill-trend-up',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Unverified Revenue',
      value: `₹${formatCurrency(stats.pending_revenue)}`,
      icon: 'fa-wallet',
      colorClass: 'text-crimson-600',
      bgClass: 'bg-crimson-50 border-crimson-100',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Title banner */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Administrative Console Dashboard</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
            Real-Time Core Performance Metrics
          </p>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                  {card.title}
                </span>
                <strong className={`text-2xl font-black font-mono leading-none ${card.colorClass}`}>
                  {card.value}
                </strong>
              </div>
              <div className={`w-11 h-11 border rounded-xl flex items-center justify-center text-base shadow-inner ${card.bgClass}`}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links & Inventory status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Quick shortcuts */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick shortcuts</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-extrabold select-none">
              <Link
                to="/admin/products"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl gap-2 transition-all"
              >
                <i className="fa-solid fa-box-open text-base text-crimson-600"></i>
                <span>Inventory ({stats.total_products})</span>
              </Link>
              <Link
                to="/admin/categories"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl gap-2 transition-all"
              >
                <i className="fa-solid fa-tags text-base text-blue-600"></i>
                <span>Categories ({stats.total_categories})</span>
              </Link>
              <Link
                to="/admin/settings"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl gap-2 transition-all animate-pulse"
              >
                <i className="fa-solid fa-sliders text-base text-emerald-600"></i>
                <span>Settings</span>
              </Link>
              <Link
                to="/admin/branding"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl gap-2 transition-all"
              >
                <i className="fa-solid fa-palette text-base text-purple-600"></i>
                <span>Branding</span>
              </Link>
            </div>
          </div>

          {/* Right panel: Recent Bookings */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Booking Orders</h3>
              <Link
                to="/admin/orders"
                className="text-[10px] font-black uppercase tracking-wider text-crimson-600 hover:text-crimson-500 flex items-center gap-1 transition-all"
              >
                View all orders <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payable Sum</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 select-all">
                        {order.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800">{order.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-bold leading-none mt-0.5">
                          {order.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-crimson-600">
                        ₹{formatCurrency(order.net_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            order.order_status === 'pending'
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : order.order_status === 'approved' || order.order_status === 'delivered'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

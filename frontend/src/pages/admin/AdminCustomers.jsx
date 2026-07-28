import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams({ search });
    fetch(`/api/admin/customers?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
      })
      .then((data) => {
        setCustomers(data.customers || []);
        setMetrics(data.metrics || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatCurrency = (val) => {
    return parseFloat(val || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  return (
    <AdminLayout>
      <div className="space-y-8 text-slate-800 select-none animate-fade-in">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-users text-blue-600"></i> Customer Directory & Insights
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              View customer contact information, order history, repeat clients, and total lifetime value.
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Customers
              </span>
              <strong className="text-2xl font-black font-mono text-slate-900 leading-none">
                {metrics.total_customers}
              </strong>
              <p className="text-[10px] text-slate-500 font-semibold pt-1">
                Unique buyers recorded
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                Repeat Customers
              </span>
              <strong className="text-2xl font-black font-mono text-emerald-700 leading-none">
                {metrics.repeat_customers}
              </strong>
              <p className="text-[10px] text-emerald-600 font-semibold pt-1">
                Placed more than 1 booking
              </p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                Total Customer Lifetime Value
              </span>
              <strong className="text-2xl font-black font-mono text-blue-800 leading-none">
                ₹{formatCurrency(metrics.total_lifetime_spent)}
              </strong>
              <p className="text-[10px] text-blue-600 font-semibold pt-1">
                Cumulative net booking spend
              </p>
            </div>

            <div className="bg-purple-50/70 border border-purple-200 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">
                Avg Value / Customer
              </span>
              <strong className="text-2xl font-black font-mono text-purple-800 leading-none">
                ₹{formatCurrency(metrics.avg_spent_per_customer)}
              </strong>
              <p className="text-[10px] text-purple-600 font-semibold pt-1">
                Average lifetime spend
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input
              type="text"
              placeholder="Search by customer name, phone number, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-crimson-600 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-700 font-semibold placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-900 font-black">{customers.length}</strong> customer profiles
          </div>
        </div>

        {/* Loading / Table Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
            <p className="text-xs font-bold text-slate-500">Loading customer records...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Total Orders</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Spent (₹)</th>
                  <th className="py-3.5 px-4">Last Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {customers.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        {cust.name}
                        {cust.total_orders > 1 && (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            Repeat Buyer ({cust.total_orders})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 flex items-center gap-3">
                        <span><i className="fa-solid fa-phone text-slate-400 mr-1"></i>{cust.phone || 'N/A'}</span>
                        {cust.email && <span><i className="fa-solid fa-envelope text-slate-400 mr-1"></i>{cust.email}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{cust.city}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{cust.district ? `${cust.district}, ${cust.state || ''}` : ''}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold">
                        {cust.total_orders}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-crimson-600">
                      ₹{formatCurrency(cust.total_spent)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{cust.last_order_date}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Ref: {cust.last_order_number}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 shadow-sm"
                      >
                        <i className="fa-solid fa-eye mr-1"></i> View History
                      </button>
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                      No customer records match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer History Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Customer Profile & Order History
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Customer Contact Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Phone Number</span>
                  <p className="text-slate-800 font-mono font-bold mt-0.5">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Email Address</span>
                  <p className="text-slate-800 font-mono font-bold mt-0.5">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Delivery Address</span>
                  <p className="text-slate-800 font-medium mt-0.5">
                    {selectedCustomer.address || ''} {selectedCustomer.city ? `, ${selectedCustomer.city}` : ''} {selectedCustomer.district ? `, ${selectedCustomer.district}` : ''} {selectedCustomer.state ? `, ${selectedCustomer.state}` : ''}
                  </p>
                </div>
              </div>

              {/* Orders History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Bookings History ({selectedCustomer.orders.length})
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[9px] uppercase">
                        <th className="py-2.5 px-3">Order Ref</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Net Amount</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {selectedCustomer.orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{ord.order_number}</td>
                          <td className="py-3 px-3 text-slate-600">{ord.created_at}</td>
                          <td className="py-3 px-3 text-right font-mono font-black text-crimson-600">
                            ₹{formatCurrency(ord.net_amount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              ord.order_status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}>
                              {ord.order_status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              to={`/admin/orders/${ord.id}`}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

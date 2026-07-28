import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

export default function AdminReports() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [period, setPeriod] = useState('monthly'); // 'specific_date', 'daily', 'monthly', 'yearly'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthsList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const fetchReports = () => {
    setLoading(true);
    const params = new URLSearchParams({
      period,
      date: selectedDate,
      year: selectedYear,
      month: selectedMonth,
      status: paymentStatus,
    });

    fetch(`/api/admin/reports/sales?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load reports');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        if (resData.year && selectedYear !== 'all' && selectedYear !== resData.year) {
          setSelectedYear(resData.year);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, [period, selectedDate, selectedYear, selectedMonth, paymentStatus]);

  const formatCurrency = (val) => {
    return parseFloat(val || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const handleExportCSV = () => {
    if (!data || !data.breakdown) return;
    let csv = 'Period/Date,Total Bookings,Verified Revenue (₹),Pending Revenue (₹),Total Revenue (₹)\n';
    data.breakdown.forEach((row) => {
      csv += `"${row.label}",${row.total_orders},${row.verified_revenue},${row.pending_revenue},${row.total_revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sales_Report_${period}_${selectedDate || selectedYear}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const setPresetToday = () => {
    setSelectedDate(todayStr);
    setPeriod('specific_date');
  };

  const setPresetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    setPeriod('specific_date');
  };

  const setPresetThisMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
    setPeriod('daily');
  };

  const setPresetThisYear = () => {
    setSelectedYear(new Date().getFullYear());
    setPeriod('monthly');
  };

  const maxRevenue = data?.breakdown?.reduce((max, item) => Math.max(max, item.total_revenue), 0) || 1;

  return (
    <AdminLayout>
      <div className="space-y-8 text-slate-800 select-none animate-fade-in print:p-0">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-crimson-600"></i> Sales Analytics & Date Reports
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              View sales data for any specific day, specific month, or specific year with custom date picker.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportCSV}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow transition-all active:scale-95"
            >
              <i className="fa-solid fa-file-csv text-emerald-400"></i> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <i className="fa-solid fa-print"></i> Print Report
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5 print:hidden">
          
          {/* Quick Presets row */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-2">Quick Presets:</span>
            <button
              type="button"
              onClick={setPresetToday}
              className="px-3 py-1 bg-slate-100 hover:bg-crimson-50 hover:text-crimson-600 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              <i className="fa-solid fa-clock text-emerald-500 mr-1"></i> Today
            </button>
            <button
              type="button"
              onClick={setPresetYesterday}
              className="px-3 py-1 bg-slate-100 hover:bg-crimson-50 hover:text-crimson-600 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              <i className="fa-solid fa-calendar-minus text-amber-500 mr-1"></i> Yesterday
            </button>
            <button
              type="button"
              onClick={setPresetThisMonth}
              className="px-3 py-1 bg-slate-100 hover:bg-crimson-50 hover:text-crimson-600 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              <i className="fa-solid fa-calendar-days text-blue-500 mr-1"></i> This Month
            </button>
            <button
              type="button"
              onClick={setPresetThisYear}
              className="px-3 py-1 bg-slate-100 hover:bg-crimson-50 hover:text-crimson-600 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              <i className="fa-solid fa-calendar text-purple-500 mr-1"></i> This Year
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Period Selector Tabs */}
            <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPeriod('specific_date')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  period === 'specific_date'
                    ? 'bg-crimson-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-calendar-check mr-1.5"></i> Specific Day
              </button>
              <button
                type="button"
                onClick={() => setPeriod('daily')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  period === 'daily'
                    ? 'bg-crimson-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-calendar-day mr-1.5"></i> Daily Breakdown
              </button>
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  period === 'monthly'
                    ? 'bg-crimson-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-calendar-days mr-1.5"></i> Monthly Breakdown
              </button>
              <button
                type="button"
                onClick={() => setPeriod('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  period === 'yearly'
                    ? 'bg-crimson-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-calendar mr-1.5"></i> Yearly Breakdown
              </button>
            </div>

            {/* Dynamic Date Filter Inputs */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* 1. Single Date Picker (For Specific Day mode) */}
              {period === 'specific_date' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500">Pick Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-crimson-600 focus:outline-none"
                  />
                </div>
              )}

              {/* 2. Year Dropdown */}
              {period !== 'yearly' && period !== 'specific_date' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-crimson-600 focus:outline-none"
                  >
                    <option value="all">All Years (All Time)</option>
                    {data?.available_years?.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 3. Month Dropdown (for Daily View) */}
              {period === 'daily' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-crimson-600 focus:outline-none"
                  >
                    {monthsList.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. Payment Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">Status:</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-crimson-600 focus:outline-none"
                >
                  <option value="all">All Bookings</option>
                  <option value="paid">Verified Paid Only</option>
                  <option value="pending">Unverified Pending Only</option>
                </select>
              </div>

            </div>

          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
            <p className="text-xs font-bold text-slate-500">Generating report for selected timeframe...</p>
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Total Sales Revenue
                </span>
                <strong className="text-2xl font-black font-mono text-slate-900 leading-none">
                  ₹{formatCurrency(data?.summary?.total_revenue)}
                </strong>
                <p className="text-[10px] text-slate-500 font-semibold pt-1">
                  Across {data?.summary?.total_orders} total bookings
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                  Verified Paid Revenue
                </span>
                <strong className="text-2xl font-black font-mono text-emerald-700 leading-none">
                  ₹{formatCurrency(data?.summary?.verified_revenue)}
                </strong>
                <p className="text-[10px] text-emerald-600 font-semibold pt-1">
                  Payment confirmed & received
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">
                  Pending Revenue
                </span>
                <strong className="text-2xl font-black font-mono text-amber-700 leading-none">
                  ₹{formatCurrency(data?.summary?.pending_revenue)}
                </strong>
                <p className="text-[10px] text-amber-600 font-semibold pt-1">
                  Payment verification pending
                </p>
              </div>

              <div className="bg-purple-50/70 border border-purple-200 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">
                  Average Booking Value
                </span>
                <strong className="text-2xl font-black font-mono text-purple-800 leading-none">
                  ₹{formatCurrency(data?.summary?.avg_order_value)}
                </strong>
                <p className="text-[10px] text-purple-600 font-semibold pt-1">
                  Average per customer order
                </p>
              </div>

            </div>

            {/* Visual Bar Chart Section */}
            {data?.breakdown?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-chart-column text-crimson-600"></i> Revenue Distribution Bar Chart
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Visual comparison for {period === 'specific_date' ? `Date ${selectedDate}` : period === 'daily' ? 'Days' : period === 'yearly' ? 'Years' : 'Months'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      <span className="w-2.5 h-2.5 rounded-full bg-crimson-600 inline-block"></span> Total Revenue
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {period.toUpperCase()} BREAKDOWN
                    </span>
                  </div>
                </div>

                {/* Chart Graphic Area */}
                <div className="pt-2 pb-4">
                  <div className="overflow-x-auto pb-2">
                    <div className="min-w-[500px] flex items-end justify-between gap-3 h-72 border-b-2 border-slate-200 px-4 pt-12">
                      {data.breakdown.map((item, idx) => {
                        const calcHeight = maxRevenue > 0 ? Math.round((item.total_revenue / maxRevenue) * 180) : 0;
                        const barHeightPx = item.total_revenue > 0 ? Math.max(calcHeight, 28) : 8;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-end flex-1 min-w-[60px] max-w-[100px] h-full group relative"
                          >
                            {/* 1. Permanent Revenue Amount Badge ABOVE the Bar */}
                            <div className="mb-2 text-center select-all">
                              <span className="text-[10.5px] font-black font-mono text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shadow-xs block whitespace-nowrap group-hover:bg-crimson-600 group-hover:text-white transition-colors">
                                ₹{formatCurrency(item.total_revenue)}
                              </span>
                              <span className="text-[9px] font-extrabold text-slate-400 block mt-0.5">
                                {item.total_orders} {item.total_orders === 1 ? 'order' : 'orders'}
                              </span>
                            </div>

                            {/* 2. Visual Bar with Gradient Fill */}
                            <div
                              className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end shadow-inner border-t border-x border-slate-200 transition-all duration-300 group-hover:shadow-md"
                              style={{ height: `${barHeightPx}px` }}
                            >
                              <div
                                className={`w-full h-full rounded-t-lg transition-all duration-500 ${
                                  item.total_revenue > 0
                                    ? 'bg-gradient-to-t from-crimson-700 via-crimson-600 to-crimson-500 group-hover:from-gold-600 group-hover:to-gold-400 shadow-sm'
                                    : 'bg-slate-300'
                                }`}
                              />
                            </div>

                            {/* 3. X-Axis Date / Period Label */}
                            <div className="mt-3 text-center w-full">
                              <span className="text-[10px] font-extrabold text-slate-700 block truncate leading-tight">
                                {item.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Breakdown Table & Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Breakdown Table */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {period === 'specific_date' ? `Hourly Sales for ${selectedDate}` : period === 'daily' ? 'Daily Sales Details' : period === 'yearly' ? 'Yearly Summary Details' : 'Monthly Sales Details'}
                  </h3>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                    {data?.breakdown?.length || 0} Records
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
                        <th className="py-3 px-4">Period / Time</th>
                        <th className="py-3 px-4 text-center">Bookings</th>
                        <th className="py-3 px-4 text-right">Verified (₹)</th>
                        <th className="py-3 px-4 text-right">Pending (₹)</th>
                        <th className="py-3 px-4 text-right">Total Net (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {data?.breakdown?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {row.label}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-[11px]">
                              {row.total_orders}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-bold">
                            ₹{formatCurrency(row.verified_revenue)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-amber-600 font-bold">
                            ₹{formatCurrency(row.pending_revenue)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                            ₹{formatCurrency(row.total_revenue)}
                          </td>
                        </tr>
                      ))}
                      {(!data?.breakdown || data.breakdown.length === 0) && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">
                            No sales recorded for this timeframe.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Top Products or Orders List */}
              <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-trophy text-gold-600"></i> Top Products in Period
                </h3>

                <div className="space-y-3">
                  {data?.top_products?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{item.product_name}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Qty Sold: <strong className="text-slate-900 font-bold">{item.total_qty}</strong>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-black text-crimson-600">
                        ₹{formatCurrency(item.total_sales)}
                      </span>
                    </div>
                  ))}
                  {(!data?.top_products || data.top_products.length === 0) && (
                    <p className="text-xs text-slate-400 font-semibold text-center py-6">
                      No item sales data recorded.
                    </p>
                  )}
                </div>

                {/* Specific Date Orders List */}
                {data?.orders?.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Orders in Selected Period ({data.orders.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {data.orders.map((ord) => (
                        <div key={ord.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900 font-mono">{ord.order_number}</div>
                            <div className="text-[10px] text-slate-500">{ord.name} ({ord.phone})</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold font-mono text-crimson-600">₹{formatCurrency(ord.net_amount)}</div>
                            <Link to={`/admin/orders/${ord.id}`} className="text-[9px] font-black uppercase text-blue-600 hover:underline">
                              Manage
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}

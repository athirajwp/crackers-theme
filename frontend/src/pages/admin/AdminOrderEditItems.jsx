import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const Swal = window.Swal;

export default function AdminOrderEditItems() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // { productId: qty }
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        // Prefill quantity map
        const qMap = {};
        resData.order.items?.forEach((item) => {
          qMap[item.product_id] = item.quantity;
        });
        setQuantities(qMap);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load order for edit:', err);
        setLoading(false);
      });
  }, [id]);

  const handleQtyChange = (productId, val) => {
    const qty = parseInt(val);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(qty) || qty < 0 ? 0 : qty,
    }));
  };

  const handleSave = async () => {
    // Check if there is at least one item with qty > 0
    const hasItems = Object.values(quantities).some((qty) => qty > 0);
    if (!hasItems) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Order',
        text: 'The order must contain at least one item with a quantity greater than zero.',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: quantities }),
      });

      const resData = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Order items updated!',
          showConfirmButton: false,
          timer: 1500,
        });
        navigate(`/admin/orders/${id}`);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: resData.error || 'Failed to update order items.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Connection error while saving order items.',
      });
    } finally {
      setSaving(false);
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
          <p className="text-sm font-semibold text-slate-500">Loading catalog items spreadsheet...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-20 animate-fade-in">
          <h2 className="text-xl font-bold text-rose-600">Failed to load edit console!</h2>
        </div>
      </AdminLayout>
    );
  }

  const { categories } = data;

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Link to={`/admin/orders/${id}`} className="text-slate-400 hover:text-slate-655">
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              <span>Edit Booking Items</span>
            </h2>
            <p className="text-[10px] text-slate-450 uppercase tracking-widest leading-none font-bold">
              Adjust quantities in invoice spreadsheet
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/admin/orders/${id}`}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            >
              Discard changes
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-crimson-600 hover:bg-crimson-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : 'Save Items List'}
            </button>
          </div>
        </div>

        {/* Catalog search bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full sm:max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-crimson-500 transition-colors">
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search products..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-300 focus:bg-white focus:ring-4 focus:ring-crimson-50/50 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-655"
                >
                  <i className="fa-solid fa-circle-xmark text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {/* Categories/Products spreadsheet list */}
          <div className="space-y-6">
            {categories.map((category) => {
              // Filter products under this category matching search query
              const filteredProducts = category.products?.filter((p) => {
                const q = searchQuery.toLowerCase().trim();
                return !q || p.name.toLowerCase().includes(q);
              }) || [];

              if (filteredProducts.length === 0) return null;

              return (
                <div key={category.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Category header banner */}
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                      {category.name}
                    </h3>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-450 font-bold uppercase tracking-wider text-[9px] select-none">
                        <th className="py-2.5 px-5">Product Details</th>
                        <th className="py-2.5 px-4 text-center">Unit pack</th>
                        <th className="py-2.5 px-4 text-right">MRP Price (₹)</th>
                        <th className="py-2.5 px-4 text-right">Offer Price (₹)</th>
                        <th className="py-2.5 px-5 text-center w-36">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {filteredProducts.map((product) => {
                        const qty = quantities[product.id] || 0;
                        return (
                          <tr key={product.id} className="hover:bg-slate-50/20">
                            <td className="py-3 px-5">
                              <div className="font-bold text-slate-800">{product.name}</div>
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-slate-450">
                              {product.pack_size}
                            </td>
                            <td className="py-3 px-4 text-right text-slate-400 line-through font-mono">
                              ₹{parseFloat(product.mrp).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right text-crimson-600 font-extrabold font-mono">
                              ₹{parseFloat(product.selling_price).toFixed(2)}
                            </td>
                            <td className="py-3 px-5 text-center">
                              <div className="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(product.id, qty - 1)}
                                  className="px-3 py-1.5 hover:bg-slate-200/50 text-slate-600 transition-colors"
                                >
                                  <i className="fa-solid fa-minus text-[9px]"></i>
                                </button>
                                <input
                                  type="text"
                                  value={qty || ''}
                                  onChange={(e) => handleQtyChange(product.id, e.target.value)}
                                  placeholder="0"
                                  className="w-12 text-center bg-transparent text-xs font-mono font-bold text-slate-850 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(product.id, qty + 1)}
                                  className="px-3 py-1.5 hover:bg-slate-200/50 text-slate-600 transition-colors"
                                >
                                  <i className="fa-solid fa-plus text-[9px]"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

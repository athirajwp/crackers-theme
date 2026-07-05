import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

const Swal = window.Swal;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    pack_size: '',
    mrp: 0,
    selling_price: 0,
    sort_order: 0,
    status: 'active',
  });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/products')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      category_id: categories[0]?.id || '',
      name: '',
      pack_size: '',
      mrp: 0,
      selling_price: 0,
      sort_order: products.length + 10,
      status: 'active',
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      category_id: product.category_id,
      name: product.name,
      pack_size: product.pack_size,
      mrp: product.mrp,
      selling_price: product.selling_price,
      sort_order: product.sort_order,
      status: product.status,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingProduct
      ? `/api/admin/products/${editingProduct.id}/update`
      : '/api/admin/products/store';

    const postData = new FormData();
    postData.append('category_id', formData.category_id);
    postData.append('name', formData.name);
    postData.append('pack_size', formData.pack_size);
    postData.append('mrp', formData.mrp);
    postData.append('selling_price', formData.selling_price);
    postData.append('sort_order', formData.sort_order);
    postData.append('status', formData.status);
    if (imageFile) {
      postData.append('image', imageFile);
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        // Do NOT set Content-Type header here; browser needs to assign multipart boundaries
        body: postData,
      });

      const data = await res.json();

      if (res.ok) {
        setModalOpen(false);
        Swal.fire({
          icon: 'success',
          title: editingProduct ? 'Product Updated!' : 'Product Created!',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchData();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Operation Failed',
          text: data.error || data.message || 'Please check your inputs.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save product details.',
      });
    }
  };

  const handleDelete = (product) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete: "${product.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e51d1d',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/products/${product.id}/destroy`, {
            method: 'DELETE',
          });
          if (res.ok) {
            Swal.fire('Deleted!', 'Product has been removed from inventory.', 'success');
            fetchData();
          } else {
            Swal.fire('Failed!', 'Could not delete product.', 'error');
          }
        } catch (err) {
          Swal.fire('Error!', 'An error occurred.', 'error');
        }
      }
    });
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.pack_size.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Inventory Registry</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
              Add, edit, or remove store products
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-700 hover:to-crimson-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <i className="fa-solid fa-circle-plus"></i> Add Product
          </button>
        </div>

        {/* Product list container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Search Bar */}
          <div className="mb-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-crimson-500 transition-colors">
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search products or categories..."
                className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-crimson-300 focus:bg-white focus:ring-4 focus:ring-crimson-50/50 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className="fa-solid fa-circle-xmark text-xs"></i>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <i className="fa-solid fa-spinner animate-spin text-2xl text-crimson-600"></i>
              <p className="text-[11px] font-semibold text-slate-400 mt-2">Loading products...</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-wider select-none">
                    <th className="py-3 px-4 w-16">Image</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">MRP (₹)</th>
                    <th className="py-3 px-4 text-right">Offer Price (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                          {product.image ? (
                            <img
                              src={`/${product.image}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fa-solid fa-image text-slate-400"></i>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 text-sm">{product.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          Size/Pack: {product.pack_size}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-655 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right line-through text-slate-400 font-mono font-bold">
                        ₹{parseFloat(product.mrp).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-crimson-600 font-extrabold text-sm font-mono">
                        ₹{parseFloat(product.selling_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            product.status === 'active'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-rose-50 border-rose-200 text-rose-600'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="bg-slate-50 hover:bg-slate-150 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                        >
                          <i className="fa-solid fa-pen-to-square text-blue-500 mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                        >
                          <i className="fa-solid fa-trash text-rose-500 mr-1"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-bold">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create/Edit Product */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh] animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {editingProduct ? 'Update Product' : 'Register New Product'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-450 hover:text-slate-655"
                >
                  <i className="fa-solid fa-circle-xmark text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Category Link
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. 10cm Sparklers Green"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Pack Details / Size
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pack_size}
                      onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                      placeholder="e.g. 10 Box, 1 Box, 5 Pcs"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Sort Index
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Printed MRP Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.mrp}
                      onChange={(e) =>
                        setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Offer Price / Wholesales (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.selling_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selling_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Product Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Visibility Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-crimson-600 hover:bg-crimson-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

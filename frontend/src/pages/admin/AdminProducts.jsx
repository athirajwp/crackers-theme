import React, { useEffect, useState, useRef } from 'react';
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
  
  // Excel import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
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

  // ─── Excel Import / Export ──────────────────────────────────────────

  const handleOpenImportModal = () => {
    setImportFile(null);
    setImportResult(null);
    setImportModalOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      const ext = file.name.split('.').pop().toLowerCase();
      if (validTypes.includes(file.type) || ['xlsx', 'xls', 'csv'].includes(ext)) {
        setImportFile(file);
        setImportResult(null);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please upload an Excel file (.xlsx, .xls) or CSV file.',
        });
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      Swal.fire({ icon: 'warning', title: 'No File', text: 'Please select an Excel file first.' });
      return;
    }

    setImporting(true);
    setImportResult(null);

    const postData = new FormData();
    postData.append('file', importFile);

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: postData,
      });

      const data = await res.json();

      if (res.ok) {
        setImportResult(data);
        fetchData();
      } else {
        setImportResult({ error: data.error || data.message || 'Import failed. Please check your file format.' });
      }
    } catch (err) {
      setImportResult({ error: 'Network error. Could not connect to server.' });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/admin/products/export?include_data=false';
  };

  const handleExportProducts = () => {
    window.location.href = '/api/admin/products/export?include_data=true';
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Inventory Registry</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
              Add, edit, or remove store products
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              title="Download Excel template"
            >
              <i className="fa-solid fa-file-arrow-down text-emerald-500"></i> Template
            </button>
            <button
              onClick={handleExportProducts}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              title="Export all products as Excel"
            >
              <i className="fa-solid fa-download text-blue-500"></i> Export
            </button>
            <button
              onClick={handleOpenImportModal}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider shadow transition-all active:scale-95 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-file-arrow-up"></i> Import Excel
            </button>
            <button
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-700 hover:to-crimson-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow transition-all active:scale-95 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-circle-plus"></i> Add Product
            </button>
          </div>
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
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {filteredProducts.length} of {products.length} products
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

        {/* ─── Modal: Create/Edit Product ─────────────────────────────── */}
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

        {/* ─── Modal: Excel Import ──────────────────────────────────── */}
        {importModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh] animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-file-excel text-emerald-500"></i>
                  Import Products from Excel
                </h3>
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="text-slate-450 hover:text-slate-655"
                >
                  <i className="fa-solid fa-circle-xmark text-lg"></i>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-info"></i> Excel Format Instructions
                </p>
                <div className="text-[10px] text-blue-600 font-semibold space-y-1">
                  <p>Your Excel file must have these column headers in the <strong>first row</strong>:</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['Category', 'Product Name', 'Pack Size', 'MRP', 'Selling Price'].map((col) => (
                      <span key={col} className="bg-blue-100 border border-blue-200 px-2 py-0.5 rounded font-black text-blue-800 text-[9px]">
                        {col} <span className="text-red-500">*</span>
                      </span>
                    ))}
                    {['Sort Order', 'Status'].map((col) => (
                      <span key={col} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-600 text-[9px]">
                        {col}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[9px] text-blue-500">
                    <i className="fa-solid fa-lightbulb mr-1"></i>
                    Existing products (same name + category) will be updated. New category names will be auto-created.
                  </p>
                </div>
              </div>

              {/* Quick Download buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-file-arrow-down"></i> Download Blank Template
                </button>
                <button
                  onClick={handleExportProducts}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-download"></i> Export Existing Products
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-emerald-400 bg-emerald-50'
                    : importFile
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {importFile ? (
                  <div className="space-y-2">
                    <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <i className="fa-solid fa-file-excel text-2xl text-emerald-600"></i>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{importFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImportFile(null);
                        setImportResult(null);
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-bold underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto bg-slate-200/50 rounded-2xl flex items-center justify-center">
                      <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Drag & drop your Excel file here
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        or <span className="text-crimson-500 underline">click to browse</span> — Accepts .xlsx, .xls, .csv
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`rounded-xl p-4 border ${importResult.error ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  {importResult.error ? (
                    <div className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-exclamation text-rose-500 mt-0.5"></i>
                      <div>
                        <p className="text-xs font-bold text-rose-700">Import Failed</p>
                        <p className="text-[11px] text-rose-600 mt-1">{importResult.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-500"></i>
                        <p className="text-xs font-bold text-emerald-700">Import Completed Successfully!</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-emerald-100 text-center">
                          <p className="text-lg font-black text-emerald-600">{importResult.imported}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">New Added</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-100 text-center">
                          <p className="text-lg font-black text-blue-600">{importResult.updated}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Updated</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                          <p className="text-lg font-black text-amber-600">{importResult.skipped}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Skipped</p>
                        </div>
                      </div>
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                          <p className="text-[10px] font-bold text-amber-700 mb-1">
                            <i className="fa-solid fa-triangle-exclamation mr-1"></i> Warnings ({importResult.errors.length})
                          </p>
                          <div className="max-h-24 overflow-y-auto space-y-0.5">
                            {importResult.errors.map((err, i) => (
                              <p key={i} className="text-[10px] text-amber-600 font-semibold">{err}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {importResult?.success ? 'Close' : 'Cancel'}
                </button>
                {!importResult?.success && (
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={!importFile || importing}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      !importFile || importing
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                    }`}
                  >
                    {importing ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin"></i> Importing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-file-import"></i> Import Now
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

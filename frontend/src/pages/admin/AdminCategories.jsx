import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

const Swal = window.Swal;

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null means adding
  const [formData, setFormData] = useState({ name: '', sort_order: 0, status: 'active' });

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/admin/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', sort_order: 0, status: 'active' });
    setModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, sort_order: category.sort_order, status: category.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingCategory
      ? `/api/admin/categories/${editingCategory.id}/update`
      : '/api/admin/categories/store';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setModalOpen(false);
        Swal.fire({
          icon: 'success',
          title: editingCategory ? 'Category Updated!' : 'Category Created!',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchCategories();
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
        text: 'Failed to save changes. Please try again.',
      });
    }
  };

  const handleDelete = (category) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the category: "${category.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e51d1d',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/categories/${category.id}/destroy`, {
            method: 'DELETE',
          });
          if (res.ok) {
            Swal.fire('Deleted!', 'Category has been deleted.', 'success');
            fetchCategories();
          } else {
            Swal.fire('Failed!', 'Could not delete category.', 'error');
          }
        } catch (err) {
          Swal.fire('Error!', 'An error occurred.', 'error');
        }
      }
    });
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Category Collections Registry</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
              Add, edit, or delete store categories
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-700 hover:to-crimson-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <i className="fa-solid fa-circle-plus"></i> Add Category
          </button>
        </div>

        {/* Category list table card */}
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
                placeholder="Search categories..."
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
              <p className="text-[11px] font-semibold text-slate-400 mt-2">Loading categories...</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-wider select-none">
                    <th className="py-3 px-4 w-12 text-center">Order</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug Identifier</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {category.sort_order}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                        {category.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 font-bold">
                        {category.slug}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            category.status === 'active'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-rose-50 border-rose-200 text-rose-600'
                          }`}
                        >
                          {category.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(category)}
                          className="bg-slate-50 hover:bg-slate-150 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                        >
                          <i className="fa-solid fa-pen-to-square text-blue-500 mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                        >
                          <i className="fa-solid fa-trash text-rose-500 mr-1"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCategories.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold">
                        No categories found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create/Edit Category */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {editingCategory ? 'Update Category' : 'Register New Category'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-450 hover:text-slate-655"
                >
                  <i className="fa-solid fa-circle-xmark text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sparklers, Ground Chakkars"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Sort Index
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Display Status
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

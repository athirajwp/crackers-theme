import React, { useState, useEffect } from 'react';

const Swal = window.Swal;

export default function AdminSysCompany() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    code: '',
    name: '',
    website: '',
    contact_1: '',
    contact_2: '',
    contact_3: '',
    contact_4: '',
    address: '',
    gst_no: '',
    pan_no: '',
    msme_no: '',
    status: 'active',
    bank_name_1: '',
    bank_acc_1: '',
    bank_ifsc_1: '',
    bank_branch_1: '',
    bank_name_2: '',
    bank_acc_2: '',
    bank_ifsc_2: '',
    bank_branch_2: '',
    upi_id_1: '',
    upi_id_2: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchCompanies = () => {
    setLoading(true);
    fetch('/api/admin_sys/companies')
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        return contentType.includes('application/json') ? res.json() : {};
      })
      .then((data) => {
        if (data.companies) {
          setCompanies(data.companies);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load companies:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      ...initialForm,
      ...comp,
      gst_no: comp.gst_no || comp.gst_number || '',
      pan_no: comp.pan_no || comp.pan_number || '',
      msme_no: comp.msme_no || comp.msme_number || '',
      address: comp.address || comp.address_1 || '',
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editingCompany;
    const url = isEdit
      ? `/api/admin_sys/companies/${editingCompany.id}/update`
      : '/api/admin_sys/companies/store';

    const formPayload = new FormData();
    const ignoreKeys = ['id', 'created_at', 'updated_at', 'bank_qr_1', 'bank_qr_2', 'bank_qr_3', 'logo_path', 'favicon_path'];

    Object.keys(formData).forEach((key) => {
      if (!ignoreKeys.includes(key) && formData[key] !== null && formData[key] !== undefined && typeof formData[key] !== 'object') {
        formPayload.append(key, formData[key]);
      }
    });

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formPayload,
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          return { status: res.status, data };
        } else {
          const text = await res.text();
          return {
            status: res.status,
            data: {
              success: false,
              message: res.ok ? text : `Server returned non-JSON error (Status ${res.status}). Please check backend server log.`
            }
          };
        }
      })
      .then(({ status, data }) => {
        setSubmitting(false);
        if (data.success) {
          setIsModalOpen(false);
          fetchCompanies();
          if (Swal) {
            Swal.fire({
              title: isEdit ? 'Company Updated!' : 'Company Registered!',
              text: data.message || 'Operation completed successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          }
        } else {
          let errorText = data.message || 'Validation error encountered.';
          if (data.errors) {
            errorText = Object.values(data.errors).flat().join('\n');
          }
          if (Swal) {
            Swal.fire({
              title: 'Operation Failed',
              text: errorText,
              icon: 'error',
            });
          }
        }
      })
      .catch((err) => {
        setSubmitting(false);
        if (Swal) {
          Swal.fire({
            title: 'Error',
            text: err.message || 'Failed to process request.',
            icon: 'error',
          });
        }
      });
  };

  const handleToggleStatus = (comp) => {
    fetch(`/api/admin_sys/companies/${comp.id}/toggle-status`, { method: 'POST' })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        return contentType.includes('application/json') ? res.json() : {};
      })
      .then((data) => {
        if (data.success) {
          fetchCompanies();
        }
      });
  };

  const handleDelete = (comp) => {
    if (Swal) {
      Swal.fire({
        title: `Delete ${comp.name}?`,
        text: `Are you sure you want to delete company record "${comp.code}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e51d1d',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Delete Record',
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`/api/admin_sys/companies/${comp.id}/destroy`, { method: 'DELETE' })
            .then(async (res) => {
              const contentType = res.headers.get('content-type') || '';
              return contentType.includes('application/json') ? res.json() : {};
            })
            .then((data) => {
              if (data.success) {
                fetchCompanies();
                Swal.fire('Deleted!', 'Company record has been removed.', 'success');
              }
            });
        }
      });
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.website?.toLowerCase().includes(q) ||
      c.contact_1?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  });

  const displayedCompanies = filteredCompanies.slice(0, entriesLimit);

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header with Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Website Overview
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Manage multi-domain fireworks storefront companies and tenant databases
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95"
        >
          <i className="fa-solid fa-plus text-sm"></i>
          <span>Add Company</span>
        </button>
      </div>

      {/* 2. Interactive Table Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Search & Entry Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Show</span>
            <select
              value={entriesLimit}
              onChange={(e) => setEntriesLimit(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-slate-900 font-bold"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Code, Website, Status..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold shadow-inner"
            />
          </div>
        </div>

        {/* 3. Companies Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-amber-400 font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 w-14 text-center border-r border-slate-800">S.No</th>
                  <th className="py-3.5 px-4 w-60 border-r border-slate-800">Company Details</th>
                  <th className="py-3.5 px-4 w-48 border-r border-slate-800">Website</th>
                  <th className="py-3.5 px-4 w-64 border-r border-slate-800">Address</th>
                  <th className="py-3.5 px-4 w-32 border-r border-slate-800">GST / Tax Info</th>
                  <th className="py-3.5 px-4 w-28 text-center border-r border-slate-800">Status</th>
                  <th className="py-3.5 px-4 w-36 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <i className="fa-solid fa-spinner animate-spin text-2xl mb-2 text-amber-500 block"></i>
                      Loading company domains...
                    </td>
                  </tr>
                ) : displayedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No companies found matching query.
                    </td>
                  </tr>
                ) : (
                  displayedCompanies.map((company, idx) => (
                    <tr
                      key={company.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-amber-50/20 transition-colors'}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono border-r border-slate-150">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4 border-r border-slate-150 space-y-1">
                        <div className="text-slate-900 font-black">Name: {company.name}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">
                          Code: <strong className="text-amber-600 font-mono">{company.code}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Contact: <span className="font-bold text-slate-800">{company.contact_1}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 border-r border-slate-150 font-bold text-slate-800">
                        <a
                          href={company.website.startsWith('http') ? company.website : `http://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-650 hover:underline flex items-center gap-1"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                          {company.website}
                        </a>
                      </td>

                      <td className="py-3.5 px-4 border-r border-slate-150 text-slate-600 font-medium leading-relaxed max-w-xs">
                        {company.address || '—'}
                      </td>

                      <td className="py-3.5 px-4 border-r border-slate-150 text-slate-600 space-y-0.5 text-[11px]">
                        <div>GST: <span className="font-mono font-bold text-slate-800">{company.gst_no || 'N/A'}</span></div>
                        <div>PAN: <span className="font-mono font-bold text-slate-800">{company.pan_no || 'N/A'}</span></div>
                      </td>

                      <td className="py-3.5 px-4 text-center border-r border-slate-150">
                        <button
                          onClick={() => handleToggleStatus(company)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition-all ${
                            company.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                          }`}
                        >
                          {company.status}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                        {/* Client Admin Portal Button */}
                        <a
                          href={`/admin/login?company=${company.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors shadow-sm"
                          title={`Open Client Admin Portal (${company.name})`}
                        >
                          <i className="fa-solid fa-user-shield text-xs"></i>
                        </a>
                        <button
                          onClick={() => handleOpenEdit(company)}
                          className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition-colors shadow-sm"
                          title="Edit Details"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(company)}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors shadow-sm"
                          title="Delete Company"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Add/Edit Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-150 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-building text-amber-500"></i>
                {editingCompany ? `Edit Company: ${editingCompany.name}` : 'Register New Company Domain'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Company Code (Unique)</label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    disabled={!!editingCompany}
                    placeholder="e.g. jallikattu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Jallikattu Crackers"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Website Domain</label>
                  <input
                    type="text"
                    name="website"
                    required
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="e.g. jallikattucrackers.com or localhost"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Phone Contact 1 (Primary)</label>
                  <input
                    type="text"
                    name="contact_1"
                    required
                    value={formData.contact_1}
                    onChange={handleChange}
                    placeholder="+91 9998887776"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Phone Contact 2</label>
                  <input
                    type="text"
                    name="contact_2"
                    value={formData.contact_2 || ''}
                    onChange={handleChange}
                    placeholder="+91 9998887775"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Phone Contact 3</label>
                  <input
                    type="text"
                    name="contact_3"
                    value={formData.contact_3 || ''}
                    onChange={handleChange}
                    placeholder="+91 9998887774"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Phone Contact 4</label>
                  <input
                    type="text"
                    name="contact_4"
                    value={formData.contact_4 || ''}
                    onChange={handleChange}
                    placeholder="+91 9998887773"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-amber-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 block">GST Number</label>
                  <input
                    type="text"
                    name="gst_no"
                    value={formData.gst_no || ''}
                    onChange={handleChange}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 block">Store Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Full physical address..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-800 outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow"
                >
                  {submitting ? 'Saving...' : editingCompany ? 'Update Company' : 'Register & Create Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

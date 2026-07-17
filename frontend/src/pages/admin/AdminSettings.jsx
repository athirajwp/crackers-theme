import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

const Swal = window.Swal;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState(null);

  const [formData, setFormData] = useState({
    store_name: '',
    min_order_value: 3800,
    discount_percent: 60,
    store_whatsapp: '',
    store_phone: '',
    store_email: '',
    store_address: '',
    store_upi: '',
    store_upi_qr: '',
    bank_name: '',
    bank_acc_no: '',
    bank_ifsc: '',
    bank_holder: '',
    enable_min_order: 'yes',
    enable_promo_codes: 'yes',
    enable_tax_delivery: 'no',
    enable_fireworks: 'yes',
    tax_percent: 18,
    delivery_charge: 150,
  });

  const fetchSettings = () => {
    setLoading(true);
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.settings) {
          setFormData({
            ...data.settings,
            min_order_value: parseFloat(data.settings.min_order_value) || 0,
            discount_percent: parseFloat(data.settings.discount_percent) || 0,
            tax_percent: parseFloat(data.settings.tax_percent) || 0,
            delivery_charge: parseFloat(data.settings.delivery_charge) || 0,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const postData = new FormData();
    Object.keys(formData).forEach((key) => {
      // Append all fields except files (or file strings)
      if (key !== 'store_upi_qr') {
        postData.append(key, formData[key]);
      }
    });

    if (qrFile) {
      postData.append('store_upi_qr', qrFile);
    }

    try {
      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        body: postData,
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Settings Saved!',
          text: 'General configuration variables have been saved.',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchSettings();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Operation Failed',
          text: data.error || 'Failed to update store settings.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
          <p className="text-sm font-semibold text-slate-500">Loading settings variables...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System General Settings</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
            Edit store parameters, checkout limits, discounts, and payment methods
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* General Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                General Store Credentials
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Support Phone
                    </label>
                    <input
                      type="text"
                      required
                      name="store_phone"
                      value={formData.store_phone}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      WhatsApp Coordinator
                    </label>
                    <input
                      type="text"
                      required
                      name="store_whatsapp"
                      value={formData.store_whatsapp}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    name="store_email"
                    value={formData.store_email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Physical Store Address
                  </label>
                  <textarea
                    required
                    rows="3"
                    name="store_address"
                    value={formData.store_address}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Policies & Taxes */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Order Policies & Calculations
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Enable Min Purchase limit
                    </label>
                    <select
                      name="enable_min_order"
                      value={formData.enable_min_order}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                    >
                      <option value="yes">Yes (Enforce)</option>
                      <option value="no">No (Skip check)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Min Purchase Value (₹)
                    </label>
                    <input
                      type="number"
                      name="min_order_value"
                      value={formData.min_order_value}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Flat Catalog Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount_percent"
                      value={formData.discount_percent}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Enable Promo Codes
                    </label>
                    <select
                      name="enable_promo_codes"
                      value={formData.enable_promo_codes}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Tax & Delivery Charges
                  </label>
                  <select
                    name="enable_tax_delivery"
                    value={formData.enable_tax_delivery}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                  >
                    <option value="yes">Enable GST & Shipping</option>
                    <option value="no">Disable / Free</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Enable Fireworks Burst Animation
                  </label>
                  <select
                    name="enable_fireworks"
                    value={formData.enable_fireworks}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
                  >
                    <option value="yes">Yes (Enabled)</option>
                    <option value="no">No (Disabled)</option>
                  </select>
                </div>

                {formData.enable_tax_delivery === 'yes' && (
                  <div className="grid grid-cols-2 gap-4 animate-slide-down">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        GST Tax Percent (%)
                      </label>
                      <input
                        type="number"
                        name="tax_percent"
                        value={formData.tax_percent}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        Lorry Delivery Fee (₹)
                      </label>
                      <input
                        type="number"
                        name="delivery_charge"
                        value={formData.delivery_charge}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment & offline banks */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Offline Payment credentials & UPI
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Merchant UPI ID
                  </label>
                  <input
                    type="text"
                    name="store_upi"
                    value={formData.store_upi}
                    onChange={handleChange}
                    placeholder="e.g. name@upi, code@okaxis"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Upload UPI QR Code (Image)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setQrFile(e.target.files[0])}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2 text-xs font-semibold outline-none transition-all"
                  />
                  {formData.store_upi_qr && (
                    <div className="mt-2 w-28 h-28 border border-slate-200 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={`/${formData.store_upi_qr}`}
                        alt="Current UPI QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Account Holder
                    </label>
                    <input
                      type="text"
                      name="bank_holder"
                      value={formData.bank_holder}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="bank_acc_no"
                      value={formData.bank_acc_no}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="bank_ifsc"
                      value={formData.bank_ifsc}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 select-none">
            <button
              type="submit"
              disabled={saving}
              className="bg-crimson-600 hover:bg-crimson-500 text-white font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md shadow-crimson-100/50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : 'Save Configuration Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

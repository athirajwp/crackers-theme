import React, { useState, useEffect } from 'react';

const Swal = window.Swal;

export default function AdminSysProfile() {
  const [formData, setFormData] = useState({
    username: 'superadmin',
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin_sys/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setFormData((prev) => ({ ...prev, username: data.username }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    if (formData.password && formData.password !== formData.password_confirmation) {
      setSaving(false);
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    fetch('/api/admin_sys/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        setSaving(false);
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            current_password: '',
            password: '',
            password_confirmation: '',
          }));
          if (Swal) {
            Swal.fire({
              title: 'Profile Updated!',
              text: data.message || 'Super Admin details updated successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          }
        } else {
          setErrorMsg(data.message || 'Verification failed.');
        }
      })
      .catch((err) => {
        setSaving(false);
        setErrorMsg('Network error. Please try again.');
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <i className="fa-solid fa-spinner animate-spin text-3xl text-amber-500"></i>
        <p className="text-xs font-bold text-slate-500">Loading Super Admin profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-150 pb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-user-gear text-amber-500"></i>
            Super Admin Profile & Security
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Update your Super Admin console login credentials
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-bold text-rose-700 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 uppercase tracking-wider block text-[10px]">
              Super Admin Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 font-bold text-slate-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 uppercase tracking-wider block text-[10px]">
              Current Password (Required to save changes)
            </label>
            <input
              type="password"
              name="current_password"
              required
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Enter current password"
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 font-bold text-slate-900 outline-none transition-all"
            />
          </div>

          <div className="pt-2 border-t border-slate-150 space-y-4">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
              Change Security Password (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block text-[10px]">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block text-[10px]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 font-bold text-slate-900 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl shadow transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';

const Swal = window.Swal;

export default function AdminProfile() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'New password confirmation does not match!',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          password: password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Password Changed!',
          text: 'Admin console password updated successfully.',
          showConfirmButton: false,
          timer: 1500,
        });
        setCurrentPassword('');
        setPassword('');
        setPasswordConfirmation('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data.error || 'Failed to update credentials. Check current password.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Connection failure while updating password.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Security & Credentials</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
            Change administrative passwords for the console
          </p>
        </div>

        <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder-slate-300 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder-slate-300 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder-slate-300 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-crimson-600 hover:bg-crimson-500 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md shadow-crimson-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Saving updates...' : 'Update Password Credentials'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

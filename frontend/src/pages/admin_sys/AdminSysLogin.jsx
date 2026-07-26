import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Swal = window.Swal;

export default function AdminSysLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    fetch('/api/admin_sys/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        setSubmitting(false);
        if (data.success) {
          if (Swal) {
            Swal.fire({
              title: 'Access Granted!',
              text: 'Super Admin authentication successful.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
          }
          navigate('/admin_sys/company');
        } else {
          setErrorMsg(data.message || 'Invalid username or password!');
        }
      })
      .catch((err) => {
        setSubmitting(false);
        setErrorMsg('Network error. Please try again.');
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <i className="fa-solid fa-crown text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Super Admin Console
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            SaaS Domain Management Portal
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs font-extrabold text-rose-400 flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation text-base flex-shrink-0"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Super Admin Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <i className="fa-solid fa-user-shield text-xs"></i>
              </span>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter super admin username"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-colors placeholder-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Security Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <i className="fa-solid fa-key text-xs"></i>
              </span>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-colors placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Sign In to Super Admin Console</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <a
            href="/"
            className="text-[11px] font-bold text-slate-500 hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-[9px]"></i>
            <span>Return to Storefront</span>
          </a>
        </div>
      </div>
    </div>
  );
}

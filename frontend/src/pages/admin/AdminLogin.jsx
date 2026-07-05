import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    fetch('/api/admin/auth/check')
      .then((res) => {
        if (res.ok) {
          navigate('/admin/dashboard');
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        const redirect = searchParams.get('redirect') || '/admin/dashboard';
        navigate(redirect);
      } else {
        setError(data.error || 'Login failed. Invalid password!');
      }
    } catch (err) {
      setError('Connection failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 font-sans select-none">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700/60 p-8 rounded-3xl shadow-2xl space-y-6">
        
        {/* Header branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 bg-crimson-600/10 border border-crimson-500/20 text-crimson-500 rounded-2xl items-center justify-center text-2xl shadow-inner shadow-crimson-900/10">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Authentication</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Enter password to manage storefront catalog
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border border-slate-700 focus:border-crimson-500 text-white rounded-xl py-3.5 pl-4 pr-12 text-sm font-semibold outline-none transition-all shadow-inner focus:shadow-crimson-500/5 placeholder-slate-700 ${showPassword ? 'tracking-normal' : 'tracking-widest'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-950/20 border border-rose-800/40 text-rose-300 px-4 py-3.5 rounded-xl text-[11px] font-bold flex items-start gap-2 shadow-sm animate-shake">
              <i className="fa-solid fa-circle-exclamation text-xs mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson-600 hover:bg-crimson-500 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-crimson-950/50 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-unlock-keyhole"></i>
                <span>Access Console</span>
              </>
            )}
          </button>
        </form>
      </div>

      <a
        href="/"
        className="mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-350 transition-all flex items-center gap-2"
      >
        <i className="fa-solid fa-arrow-left"></i> Back to Public Store
      </a>
    </div>
  );
}

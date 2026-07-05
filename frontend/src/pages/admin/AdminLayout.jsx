import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if authenticated
    fetch('/api/admin/auth/check')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        navigate(`/admin/login?redirect=${encodeURIComponent(location.pathname)}`);
      });
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      navigate('/admin/login');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
        <i className="fa-solid fa-circle-notch animate-spin text-4xl text-crimson-600"></i>
        <p className="text-sm font-bold text-slate-500">Checking admin authorization...</p>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fa-gauge' },
    { path: '/admin/orders', label: 'Orders', icon: 'fa-cart-shopping' },
    { path: '/admin/products', label: 'Products', icon: 'fa-box-open' },
    { path: '/admin/categories', label: 'Categories', icon: 'fa-tags' },
    { path: '/admin/settings', label: 'General Settings', icon: 'fa-sliders' },
    { path: '/admin/branding', label: 'Branding & Themes', icon: 'fa-palette' },
    { path: '/admin/profile', label: 'Admin Profile', icon: 'fa-user-gear' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 text-slate-800 font-sans relative">
      {/* Mobile Top Navbar (Hidden on desktop) */}
      <header className="lg:hidden w-full bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md select-none sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-300 hover:text-white p-1 text-lg focus:outline-none"
            title="Open Menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center text-white text-sm font-black shadow-md">
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <h1 className="text-xs font-black uppercase tracking-wider">Admin Console</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
            Live
          </span>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:z-auto w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl select-none transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-crimson-900/30">
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider">Admin Console</h1>
              <span className="text-[10px] text-slate-500 font-bold">Storefront manager</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-350 p-1 text-sm"
            title="Close Menu"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Menu link list */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-crimson-600 text-white shadow-md shadow-crimson-600/10'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            <span>View Public Store</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all border border-transparent hover:border-rose-950"
          >
            <i className="fa-solid fa-power-off"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main panel container */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Main top header (Desktop only) */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-5 items-center justify-between select-none shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {menuItems.find((item) => location.pathname.startsWith(item.path))?.label || 'Dashboard'}
            </h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Control Panel Overview
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Live Connection
            </span>
          </div>
        </header>

        {/* Mobile Header Banner */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 select-none flex items-center justify-between shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            {menuItems.find((item) => location.pathname.startsWith(item.path))?.label || 'Dashboard'}
          </h2>
          <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
            Admin Console
          </span>
        </div>

        {/* Page contents area */}
        <div className="p-4 sm:p-8 flex-grow overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

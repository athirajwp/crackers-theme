import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const Swal = window.Swal;

export default function AdminSysLayout() {
  const { settings } = useStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState('superadmin');

  useEffect(() => {
    fetch('/api/admin_sys/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          navigate('/admin_sys/login');
        } else {
          if (data.username) setUsername(data.username);
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        navigate('/admin_sys/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    if (Swal) {
      Swal.fire({
        title: 'Logout Super Admin?',
        text: 'Are you sure you want to end your Super Admin session?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e51d1d',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Logout',
      }).then((result) => {
        if (result.isConfirmed) {
          performLogout();
        }
      });
    } else {
      performLogout();
    }
  };

  const performLogout = () => {
    fetch('/api/admin_sys/auth/logout', { method: 'POST' })
      .then(() => {
        navigate('/admin_sys/login');
      })
      .catch(() => {
        navigate('/admin_sys/login');
      });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center space-y-4">
        <i className="fa-solid fa-crown animate-bounce text-4xl text-amber-500"></i>
        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
          Authenticating Super Admin...
        </p>
      </div>
    );
  }

  const navItems = [
    { to: '/admin_sys/company', label: 'Website Overview', icon: 'fa-globe' },
    { to: '/admin_sys/profile', label: 'Super Admin Profile', icon: 'fa-user-gear' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* 1. Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <i className={mobileOpen ? 'fa-solid fa-xmark text-sm' : 'fa-solid fa-bars text-sm'}></i>
            </button>
            <Link to="/admin_sys/company" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
                <i className="fa-solid fa-shield-halved text-base"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wider uppercase text-amber-400 leading-none">
                  Super Admin Console
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-tight mt-0.5">
                  Multi-Domain SaaS Management
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/admin/login"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <i className="fa-solid fa-[#EFEBE8] fa-user-shield text-amber-400"></i>
              <span>Client Admin Portal</span>
            </a>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-300">
                {username}
              </span>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 border border-slate-700 flex items-center justify-center text-slate-400 transition-colors ml-1"
                title="Logout"
              >
                <i className="fa-solid fa-right-from-bracket text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid with Left Sidebar */}
      <div className="flex-grow container mx-auto px-4 py-8 flex gap-8 items-start">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm sticky top-20 space-y-4">
          <div className="px-3 py-2 border-b border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Navigation Menu
            </span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <i className={`fa-solid ${item.icon} text-sm opacity-80`}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <a
              href="/admin/login"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <i className="fa-solid fa-store text-sm text-crimson-600"></i>
              <span>Client Admin Portal</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket text-sm"></i>
              <span>Logout Console</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl p-6 space-y-6 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Super Admin Navigation
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-slate-50 text-slate-700'
                      }`
                    }
                  >
                    <i className={`fa-solid ${item.icon} text-base`}></i>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href="/admin/login"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 font-bold py-3 rounded-2xl text-xs"
                >
                  <i className="fa-solid fa-store text-crimson-600"></i> Open Client Admin Portal
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 font-extrabold py-3 rounded-2xl text-xs"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout Super Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-grow w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

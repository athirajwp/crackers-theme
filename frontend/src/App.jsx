import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Storefront from './pages/Storefront';
import About from './pages/About';
import Terms from './pages/Terms';
import PriceList from './pages/PriceList';
import TrackOrder from './pages/TrackOrder';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Contact from './pages/Contact';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminOrderEditItems from './pages/admin/AdminOrderEditItems';
import AdminInvoice from './pages/admin/AdminInvoice';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBranding from './pages/admin/AdminBranding';
import AdminProfile from './pages/admin/AdminProfile';

function PublicLayout() {
  const { loading } = useStore();
  const [companyName, setCompanyName] = useState('Sivakasi Fireworks');

  useEffect(() => {
    const el = document.getElementById('laravel-company');
    if (el) {
      try {
        const data = JSON.parse(el.textContent);
        if (data.name) setCompanyName(data.name);
      } catch (e) {}
    }
  }, []);

  if (loading) {
    const fireworkStyles = `
      @keyframes launch {
        0% { transform: translateY(100vh) scale(0.3); opacity: 1; }
        60% { transform: translateY(var(--top)) scale(0.8); opacity: 1; }
        65% { opacity: 0; }
        100% { transform: translateY(var(--top)); opacity: 0; }
      }

      @keyframes burst {
        0%, 60% { transform: scale(0); opacity: 0; }
        65% { transform: scale(0.1); opacity: 1; }
        85% { opacity: 1; }
        100% { transform: scale(1.2); opacity: 0; }
      }

      @keyframes spark {
        0%, 60% { transform: translate(0, 0) scale(1); opacity: 0; }
        65% { opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
      }

      .firework-rocket {
        animation: launch 4s infinite ease-out;
      }

      .firework-burst {
        animation: burst 4s infinite ease-out;
      }

      .firework-spark {
        animation: spark 4s infinite ease-out;
      }
    `;

    // Define 4 fireworks with different properties
    const fireworks = [
      { id: 1, left: '15%', top: '25vh', delay: '0s', color: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' },
      { id: 2, left: '80%', top: '20vh', delay: '1s', color: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' },
      { id: 3, left: '30%', top: '40vh', delay: '2s', color: 'bg-emerald-400 shadow-[0_0_8px_#34d399]' },
      { id: 4, left: '65%', top: '35vh', delay: '3s', color: 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' }
    ];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden select-none">
        <style dangerouslySetInnerHTML={{ __html: fireworkStyles }} />

        {/* Fireworks animation container */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {fireworks.map((fw) => (
            <React.Fragment key={fw.id}>
              {/* Rocket trail */}
              <div 
                className="absolute bottom-0 w-1 bg-gradient-to-t from-transparent to-amber-300 rounded-full firework-rocket flex items-center justify-center" 
                style={{ 
                  animationDelay: fw.delay, 
                  left: fw.left,
                  '--top': fw.top,
                  height: '40px'
                }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>

              {/* Burst explosion */}
              <div 
                className="absolute firework-burst flex items-center justify-center" 
                style={{ 
                  animationDelay: fw.delay, 
                  left: fw.left, 
                  top: fw.top 
                }}
              >
                {[...Array(16)].map((_, i) => {
                  const angle = (i * 22.5 * Math.PI) / 180;
                  const distance = 90; // explosion size
                  const dx = `${Math.cos(angle) * distance}px`;
                  const dy = `${Math.sin(angle) * distance}px`;
                  return (
                    <div 
                      key={i} 
                      className={`absolute w-1.5 h-1.5 rounded-full firework-spark ${fw.color}`} 
                      style={{ 
                        '--dx': dx, 
                        '--dy': dy, 
                        animationDelay: fw.delay 
                      }}
                    />
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Floating Sparkly Stars in foreground */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <i className="fa-solid fa-star text-amber-300 absolute text-xs top-1/4 left-1/3 animate-ping" style={{ animationDuration: '3s' }} />
          <i className="fa-solid fa-star text-rose-300 absolute text-[10px] top-1/3 right-1/4 animate-pulse" style={{ animationDuration: '2s' }} />
          <i className="fa-solid fa-star text-emerald-300 absolute text-xs bottom-1/3 left-1/5 animate-pulse" style={{ animationDuration: '4s' }} />
          <i className="fa-solid fa-star text-blue-300 absolute text-[9px] top-[15%] right-1/3 animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>

        {/* Content Box */}
        <div className="text-center space-y-6 max-w-xl px-6 relative z-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-3xl shadow-lg shadow-amber-500/20 transform rotate-12 animate-pulse">
            <i className="fa-solid fa-fire text-white text-4xl -rotate-12"></i>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3.5xl font-black tracking-tight uppercase bg-gradient-to-r from-amber-400 via-gold-500 to-amber-400 bg-clip-text text-transparent animate-pulse leading-tight">
              {companyName}
            </h1>
            <p className="text-[10px] sm:text-xs font-black tracking-widest text-slate-450 uppercase">
              Welcomes You to the Festive Celebration
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
            <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
              Loading Storefront...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Public Pages Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Storefront />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/price-list" element={<PriceList />} />
            <Route path="/price_list" element={<PriceList />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/checkout/success/:orderNumber" element={<CheckoutSuccess />} />
          </Route>

          {/* Standalone Admin Pages */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/orders/:id/invoice" element={<AdminInvoice />} />

          {/* Protected Admin Console Pages */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
          <Route path="/admin/orders/:id/edit-items" element={<AdminOrderEditItems />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/branding" element={<AdminBranding />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;

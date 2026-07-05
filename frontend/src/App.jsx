import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
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

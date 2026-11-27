import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import CatalogView from './views/CatalogView';
import OrdersView from './views/OrdersView';
import SellerDashboard from './views/SellerDashboard';
import AdminDashboard from './views/AdminDashboard';
import './index.css';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders' | 'seller' | 'admin'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Automatically reset to catalog if user logs out while on a private view
  useEffect(() => {
    if (!user && (activeTab === 'orders' || activeTab === 'seller' || activeTab === 'admin')) {
      setActiveTab('catalog');
    }
  }, [user, activeTab]);

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'catalog' && (
          <CatalogView onOpenAuth={() => setIsAuthOpen(true)} />
        )}
        {activeTab === 'orders' && (
          <OrdersView
            onNavigateCatalog={() => setActiveTab('catalog')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        {activeTab === 'seller' && <SellerDashboard />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals & Drawers */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigateOrders={() => setActiveTab('orders')}
        onNavigateCatalog={() => setActiveTab('catalog')}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 NexusStore Management System — Powered by Spring Boot 3 & React</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

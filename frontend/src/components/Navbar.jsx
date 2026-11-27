import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  Store,
  ShieldCheck,
  Package,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenCart }) {
  const { user, logout, hasRole } = useAuth();
  const { totalItems } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isCustomer = user && hasRole('ROLE_CUSTOMER');
  const isSeller = user && hasRole('ROLE_SELLER');
  const isAdmin = user && hasRole('ROLE_ADMIN');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    setActiveTab('catalog');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setActiveTab('catalog')}>
          <ShoppingBag className="brand-icon" size={28} />
          <span className="brand-title">NexusStore</span>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <ShoppingBag size={18} />
            <span>Catalog</span>
          </button>

          {isCustomer && (
            <button
              className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} />
              <span>My Orders</span>
            </button>
          )}

          {isSeller && (
            <button
              className={`nav-btn ${activeTab === 'seller' ? 'active' : ''}`}
              onClick={() => setActiveTab('seller')}
            >
              <Store size={18} />
              <span>Seller Hub</span>
            </button>
          )}

          {isAdmin && (
            <button
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldCheck size={18} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right Section: Cart & Profile */}
        <div className="nav-actions">
          {/* Cart button */}
          <button className="cart-trigger-btn" onClick={onOpenCart} title="Open Cart">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {user ? (
            <div className="user-nav-group" ref={dropdownRef}>
              {/* Profile Pill with Dropdown Trigger */}
              <button
                type="button"
                className={`user-profile-btn ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen((prev) => !prev)}
                title="Account menu"
              >
                <div className="user-avatar-circle">
                  {user.username ? user.username.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <div className="user-profile-text">
                  <span className="username-label">{user.username}</span>
                  <span className="role-tag">
                    {isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Customer'}
                  </span>
                </div>
                <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
              </button>

              {/* Compact Dropdown: ONLY Sign Out */}
              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <button
                    type="button"
                    className="dropdown-signout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={onOpenAuth}>
              <User size={18} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

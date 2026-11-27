import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CreditCard, ArrowLeft, ShoppingBag } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function OrdersView({ onNavigateCatalog, onOpenAuth }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/my-orders');
      setOrders(res.data.content || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'status-delivered';
      case 'SHIPPED':
        return 'status-shipped';
      case 'PROCESSING':
        return 'status-processing';
      case 'PAID':
        return 'status-paid';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header-bar">
        <div>
          <h2>My Order History</h2>
          <p>Track your current orders and review previous purchases.</p>
        </div>
        <button className="primary-btn auto-width with-icon" onClick={onNavigateCatalog}>
          <ShoppingBag size={18} />
          <span>Browse Products</span>
        </button>
      </div>

      {!user ? (
        <div className="empty-orders-state">
          <Package size={56} className="empty-icon" />
          <h3>Sign in to View Your Orders</h3>
          <p>You need to be logged in with a Customer account to view your past orders.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button className="primary-btn auto-width" onClick={onOpenAuth}>
              Sign In Now
            </button>
            <button className="secondary-btn auto-width" onClick={onNavigateCatalog}>
              Browse Catalog
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-state">
          <Package size={56} className="empty-icon" />
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Visit our catalog to start shopping!</p>
          <button className="primary-btn auto-width" onClick={onNavigateCatalog} style={{ marginTop: '16px' }}>
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-number">Tracking ID: <b>{order.orderTrackingNumber}</b></span>
                  <span className="order-date">
                    <Clock size={14} />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <span className={`status-pill ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items-preview">
                {order.items?.map((item) => (
                  <div key={item.id} className="order-item-snippet">
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
                      alt={item.productName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120';
                      }}
                    />
                    <div className="snippet-info">
                      <h4>{item.productName}</h4>
                      <p>
                        ${Number(item.unitPrice).toFixed(2)} × {item.quantity} = <b>${Number(item.subtotal).toFixed(2)}</b>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="footer-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{order.shippingAddress}</span>
                  </div>
                  <div className="detail-item">
                    <CreditCard size={16} />
                    <span>Payment: {order.paymentMethod} ({order.paymentStatus})</span>
                  </div>
                </div>

                <div className="order-total-block">
                  <span className="label">Total Paid:</span>
                  <span className="amount">${Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

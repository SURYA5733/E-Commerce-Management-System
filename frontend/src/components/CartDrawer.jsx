import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function CartDrawer({ isOpen, onClose, onOpenAuth, onNavigateOrders, onNavigateCatalog }) {
  const { cart, updateQuantity, removeItem, clearCart, fetchCart } = useCart();
  const { user } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [shippingAddress, setShippingAddress] = useState(user?.address || '100 Market St, Suite 400');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Please provide a valid shipping address.');
      return;
    }

    try {
      setOrdering(true);
      setError('');
      const res = await API.post('/orders', {
        shippingAddress,
        paymentMethod,
      });
      setPlacedOrder(res.data);
      setCheckoutStep('success');
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setOrdering(false);
    }
  };

  const handleReset = () => {
    setCheckoutStep('cart');
    setPlacedOrder(null);
    setError('');
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={handleReset}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={22} />
            <h3>Your Shopping Cart</h3>
          </div>
          <button className="close-btn" onClick={handleReset}>
            <X size={20} />
          </button>
        </div>

        {/* Content based on Step */}
        {checkoutStep === 'cart' && (
          <>
            <div className="drawer-body">
              {!user ? (
                <div className="drawer-empty-state">
                  <p>Please sign in with a Customer account to manage your shopping cart.</p>
                  <button
                    className="primary-btn"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                  >
                    Sign In Now
                  </button>
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="drawer-empty-state">
                  <ShoppingBag size={48} className="empty-icon" />
                  <h4>Your cart is empty</h4>
                  <p>Explore our catalog and add items to your cart.</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.items.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <div className="cart-item-img">
                        <img
                          src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
                          alt={item.productName}
                        />
                      </div>
                      <div className="cart-item-info">
                        <h4>{item.productName}</h4>
                        <span className="cart-item-price">${Number(item.unitPrice).toFixed(2)} each</span>
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="qty-btn"
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-end">
                        <span className="subtotal-val">${Number(item.subtotal).toFixed(2)}</span>
                        <button
                          className="item-delete-btn"
                          onClick={() => removeItem(item.productId)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart && cart.items.length > 0 && (
              <div className="drawer-footer">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${Number(cart.totalAmount).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">FREE</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${Number(cart.totalAmount).toFixed(2)}</span>
                </div>

                <button
                  className="checkout-btn"
                  onClick={() => setCheckoutStep('checkout')}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {checkoutStep === 'checkout' && (
          <div className="drawer-body checkout-form-container">
            <h3>Delivery & Payment</h3>
            {error && <div className="alert-box error">{error}</div>}

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Shipping Address</label>
                <textarea
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  className="basic-textarea"
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-options">
                  <label className={`payment-pill ${paymentMethod === 'CREDIT_CARD' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Credit / Debit Card</span>
                  </label>
                  <label className={`payment-pill ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>UPI / Instant Pay</span>
                  </label>
                  <label className={`payment-pill ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <div className="order-review-box">
                <div className="summary-row">
                  <span>Total Due:</span>
                  <span className="total-highlight">${Number(cart?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setCheckoutStep('cart')}
                >
                  Back to Cart
                </button>
                <button type="submit" disabled={ordering} className="confirm-order-btn">
                  {ordering ? 'Placing Order...' : 'Pay & Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        )}

        {checkoutStep === 'success' && placedOrder && (
          <div className="drawer-body success-state">
            <CheckCircle2 size={64} className="success-icon" />
            <h3>Order Placed Successfully!</h3>
            <p>Thank you for shopping with us. Your payment has been processed.</p>

            <div className="tracking-card">
              <span className="label">Order Tracking Number:</span>
              <span className="tracking-number">{placedOrder.orderTrackingNumber}</span>
              <span className="status-badge paid">STATUS: {placedOrder.status}</span>
            </div>

            <div className="success-actions">
              <button
                className="primary-btn"
                onClick={() => {
                  handleReset();
                  onNavigateOrders();
                }}
              >
                View in My Orders
              </button>
              <button
                className="secondary-btn"
                onClick={() => {
                  handleReset();
                  if (onNavigateCatalog) onNavigateCatalog();
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

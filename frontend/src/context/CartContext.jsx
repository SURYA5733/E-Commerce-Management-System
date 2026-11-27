import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, hasRole } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCustomer = user && hasRole('ROLE_CUSTOMER');

  const fetchCart = async () => {
    if (!isCustomer) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isCustomer) {
      return { success: false, message: 'Please sign in as a Customer to add items to cart.' };
    }
    try {
      const res = await API.post('/cart/items', { productId, quantity });
      setCart(res.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add item to cart',
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await API.put(`/cart/items/${productId}?quantity=${quantity}`);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await API.delete(`/cart/items/${productId}`);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const clearCart = async () => {
    try {
      await API.delete('/cart');
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems: cart?.totalItems || 0,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ecommerce_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ecommerce_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, ...userData } = res.data;
      setToken(token);
      setUser(userData);
      localStorage.setItem('ecommerce_token', token);
      localStorage.setItem('ecommerce_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      const errorMsg = !err.response
        ? 'Cannot connect to backend server. Make sure Spring Boot is running on http://localhost:8080.'
        : err.response.data?.message || 'Login failed. Please check credentials.';
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/signup', signupData);
      return { success: true, message: res.data.message };
    } catch (err) {
      let errorMsg;
      if (!err.response) {
        errorMsg = 'Cannot connect to backend server. Make sure Spring Boot is running on http://localhost:8080.';
      } else if (err.response.data?.errors && typeof err.response.data.errors === 'object') {
        errorMsg = Object.values(err.response.data.errors).join(', ');
      } else {
        errorMsg = err.response.data?.message || err.response.data?.error || 'Registration failed.';
      }
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ecommerce_token');
    localStorage.removeItem('ecommerce_user');
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

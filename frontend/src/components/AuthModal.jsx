import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer'); // customer, seller, admin

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegister) {
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      const res = await signup({
        username,
        email,
        password,
        fullName,
        phoneNumber,
        address,
        roles: [role],
      });

      if (res.success) {
        setSuccess('Account created successfully! You can now log in.');
        setIsRegister(false);
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(username, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    }
  };

  const fillQuickAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setIsRegister(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {success && <div className="alert-box success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username {isRegister && <span className="helper-label">(min. 3 characters)</span>}</label>
            <div className="input-with-icon">
              <User size={18} />
              <input
                type="text"
                required
                minLength={isRegister ? 3 : 1}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. johndoe"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="basic-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 555-0199"
                    className="basic-input"
                  />
                </div>
                <div className="form-group">
                  <label>Select Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="basic-select"
                  >
                    <option value="customer">Customer (Shop & Order)</option>
                    <option value="seller">Seller (List Products)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Shipping / Billing Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, ZIP"
                  className="basic-input"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password {isRegister && <span className="helper-label">(min. 6 characters)</span>}</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type="password"
                required
                minLength={isRegister ? 6 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="text-toggle-btn"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
            >
              {isRegister ? 'Log in here' : 'Sign up now'}
            </button>
          </p>

          {!isRegister && (
            <div className="quick-login-banner" onClick={fillQuickAdmin}>
              <Shield size={16} />
              <span>Click here to auto-fill default <b>Admin</b> credentials (admin / admin123)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  FolderTree,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import API from '../api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'categories' | 'users'
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Add Category Modal State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catError, setCatError] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, catRes, usersRes] = await Promise.all([
        API.get('/admin/analytics'),
        API.get('/categories'),
        API.get('/admin/users?size=50'),
      ]);
      setAnalytics(analyticsRes.data);
      setCategories(catRes.data || []);
      setUsers(usersRes.data.content || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setCatError('');
      await API.post('/categories', {
        name: newCatName,
        description: newCatDesc,
      });
      setNewCatName('');
      setNewCatDesc('');
      showToast('Category created successfully!');
      loadAdminData();
    } catch (err) {
      setCatError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      showToast('Category deleted.');
      loadAdminData();
    } catch (err) {
      showToast('Failed to delete category.', true);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = !user.enabled;
    try {
      await API.patch(`/admin/users/${user.id}/status?enabled=${newStatus}`);
      showToast(`User ${user.username} is now ${newStatus ? 'Active' : 'Disabled'}.`);
      loadAdminData();
    } catch (err) {
      showToast('Failed to update user status.', true);
    }
  };

  const showToast = (msg, isErr = false) => {
    setToast({ text: msg, isError: isErr });
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="dashboard-container">
      {/* Toast */}
      {toast && (
        <div className={`toast-popup ${toast.isError ? 'error' : 'success'}`}>
          {toast.isError ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h2>System Administration Console</h2>
          <p>Complete control over platform analytics, taxonomy categories, and registered user accounts.</p>
        </div>

        <div className="tab-pill-group">
          <button
            className={`pill-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview & KPIs
          </button>
          <button
            className={`pill-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories ({categories.length})
          </button>
          <button
            className={`pill-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading admin records...</p>
        </div>
      ) : activeTab === 'overview' ? (
        <div className="admin-overview">
          <div className="kpi-grid">
            <div className="kpi-card revenue">
              <div className="kpi-icon">
                <TrendingUp size={28} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-value">${Number(analytics?.totalRevenue || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="kpi-card orders">
              <div className="kpi-icon">
                <CreditCard size={28} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Total Orders Placed</span>
                <span className="kpi-value">{analytics?.totalOrders || 0}</span>
              </div>
            </div>

            <div className="kpi-card products">
              <div className="kpi-icon">
                <ShoppingBag size={28} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Catalog Products</span>
                <span className="kpi-value">{analytics?.totalProducts || 0}</span>
              </div>
            </div>

            <div className="kpi-card users">
              <div className="kpi-icon">
                <Users size={28} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Registered Accounts</span>
                <span className="kpi-value">{analytics?.totalUsers || 0}</span>
              </div>
            </div>
          </div>

          <div className="admin-guidance-card">
            <h3>Quick Administration Guide</h3>
            <ul>
              <li><b>Categories:</b> Create main product categories so sellers can categorize listings.</li>
              <li><b>Users:</b> Monitor registration activity, view assigned security roles, and suspend malicious users instantly.</li>
              <li><b>Method Security:</b> All admin operations are safeguarded with <code>@PreAuthorize("hasRole('ADMIN')")</code> on the Spring Boot backend.</li>
            </ul>
          </div>
        </div>
      ) : activeTab === 'categories' ? (
        <div className="dashboard-section">
          {/* Add Category Form */}
          <div className="inline-add-card">
            <h4>Add New Product Category</h4>
            {catError && <div className="alert-box error">{catError}</div>}
            <form onSubmit={handleAddCategory} className="inline-form">
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Electronics, Fashion, Home)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="basic-input"
              />
              <input
                type="text"
                placeholder="Short Description (Optional)"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="basic-input"
              />
              <button type="submit" className="primary-btn with-icon">
                <Plus size={18} />
                <span>Create Category</span>
              </button>
            </form>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td className="cell-title">{c.name}</td>
                    <td>{c.description || '—'}</td>
                    <td>
                      <button
                        className="action-icon-btn delete"
                        onClick={() => handleDeleteCategory(c.id)}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="dashboard-section">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Registered</th>
                  <th>Account Status</th>
                  <th>Toggle Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-title">{u.username}</div>
                      <div className="cell-sub">{u.fullName || 'No name'}</div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <div className="roles-pill-row">
                        {u.roles?.map((r) => (
                          <span key={r} className="role-tag">
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${u.enabled ? 'status-paid' : 'status-cancelled'}`}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="status-toggle-btn"
                        onClick={() => handleToggleUserStatus(u)}
                        title={u.enabled ? 'Disable user' : 'Enable user'}
                      >
                        {u.enabled ? (
                          <ToggleRight size={28} className="toggle-on" />
                        ) : (
                          <ToggleLeft size={28} className="toggle-off" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Store, Plus, Package, Edit, Trash2, Check, AlertCircle, X } from 'lucide-react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('products'); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Modal State for New Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes, catRes] = await Promise.all([
        API.get(`/products/seller/${user.id}`),
        API.get('/orders/seller'),
        API.get('/categories'),
      ]);
      setProducts(prodRes.data || []);
      setOrders(orderRes.data || []);
      setCategories(catRes.data || []);
      if (catRes.data && catRes.data.length > 0) {
        setCategoryId(catRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load seller data', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditProduct(prod);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(prod.price);
    setStockQuantity(prod.stockQuantity);
    setSku(prod.sku || '');
    setImageUrl(prod.imageUrl || '');
    setCategoryId(prod.categoryId || (categories[0]?.id || ''));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setFormError('Please select or create a category first.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        name,
        description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        sku,
        imageUrl,
        categoryId: parseInt(categoryId),
      };

      if (editProduct) {
        await API.put(`/products/${editProduct.id}`, payload);
        showToast('Product updated successfully!');
      } else {
        await API.post('/products', payload);
        showToast('New product created successfully!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      showToast('Product deleted.');
      loadData();
    } catch (err) {
      showToast('Failed to delete product', true);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      showToast('Failed to update status', true);
    }
  };

  const showToast = (msg, isErr = false) => {
    setToast({ text: msg, isError: isErr });
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-popup ${toast.isError ? 'error' : 'success'}`}>
          {toast.isError ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h2>Seller Management Hub</h2>
          <p>Manage your product catalog, inventory levels, and process incoming customer orders.</p>
        </div>

        <div className="tab-pill-group">
          <button
            className={`pill-btn ${activeSubTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('products')}
          >
            My Products ({products.length})
          </button>
          <button
            className={`pill-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('orders')}
          >
            Customer Orders ({orders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading seller hub...</p>
        </div>
      ) : activeSubTab === 'products' ? (
        <div className="dashboard-section">
          <div className="section-bar">
            <h3>Active Catalog Listings</h3>
            <button className="primary-btn with-icon" onClick={openCreateModal}>
              <Plus size={18} />
              <span>Add New Product</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="empty-state-card">
              <Package size={48} />
              <h4>No Products Listed Yet</h4>
              <p>Click "Add New Product" above to publish your first item on the marketplace.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>SKU</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="product-cell">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
                          alt={p.name}
                        />
                        <div>
                          <div className="cell-title">{p.name}</div>
                          <div className="cell-sub">{p.description?.substring(0, 45)}...</div>
                        </div>
                      </td>
                      <td>{p.categoryName || 'Unassigned'}</td>
                      <td className="price-bold">${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span className={`stock-tag ${p.stockQuantity > 5 ? 'good' : 'low'}`}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td><code>{p.sku || 'N/A'}</code></td>
                      <td>
                        <span className={`status-pill ${p.active ? 'status-paid' : 'status-cancelled'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-icon-btn edit" onClick={() => openEditModal(p)} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="action-icon-btn delete" onClick={() => handleDeleteProduct(p.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="dashboard-section">
          <div className="section-bar">
            <h3>Incoming Orders for Your Products</h3>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state-card">
              <Store size={48} />
              <h4>No Orders Yet</h4>
              <p>When customers purchase products from your catalog, orders will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Customer</th>
                    <th>Items Purchased</th>
                    <th>Total Value</th>
                    <th>Current Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><code>{o.orderTrackingNumber}</code></td>
                      <td>{o.customerUsername}</td>
                      <td>
                        {o.items?.map((it) => (
                          <div key={it.id} className="small-item-row">
                            • {it.productName} (×{it.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="price-bold">${Number(o.totalAmount).toFixed(2)}</td>
                      <td>
                        <span className="status-pill status-paid">{o.status}</span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="table-status-select"
                        >
                          <option value="PAID">PAID</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="alert-box error">{formError}</div>}

            <form onSubmit={handleSaveProduct} className="product-form">
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="basic-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.99"
                    className="basic-input"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="50"
                    className="basic-input"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="basic-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-1001"
                    className="basic-input"
                  />
                </div>

                <div className="form-group">
                  <label>Product Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="basic-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications, features, and warranty..."
                  className="basic-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="primary-btn">
                  {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

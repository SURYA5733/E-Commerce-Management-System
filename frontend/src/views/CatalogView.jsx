import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Tag, Filter, Check, AlertCircle, Minus, Plus } from 'lucide-react';
import API from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CatalogView({ onOpenAuth }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const { user, hasRole } = useAuth();
  const isCustomer = user && hasRole('ROLE_CUSTOMER');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const extractProducts = (data) => {
    if (!data) return [];
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        API.get('/products?size=24'),
        API.get('/categories'),
      ]);
      setProducts(extractProducts(prodRes.data));
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      console.error('Failed to fetch catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByCategory = async (catId) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    try {
      setLoading(true);
      if (catId) {
        const res = await API.get(`/products/category/${catId}`);
        setProducts(extractProducts(res.data));
      } else {
        const res = await API.get('/products?size=24');
        setProducts(extractProducts(res.data));
      }
    } catch (err) {
      console.error('Failed to filter by category', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      handleFilterByCategory(selectedCategory);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get(`/products/search?keyword=${encodeURIComponent(searchQuery)}`);
      setProducts(extractProducts(res.data));
    } catch (err) {
      console.error('Failed search', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const res = await addToCart(product.id, 1);
    if (res.success) {
      showToast(`Added "${product.name}" to your cart!`);
    } else {
      showToast(res.message, true);
    }
  };

  const getCartItem = (productId) => {
    if (!cart || !cart.items) return null;
    return cart.items.find((it) => Number(it.productId) === Number(productId));
  };

  const handleUpdateInCartQty = async (productId, newQty) => {
    if (newQty <= 0) {
      await removeItem(productId);
    } else {
      await updateQuantity(productId, newQty);
    }
  };

  const showToast = (msg, isErr = false) => {
    setToastMessage({ text: msg, isError: isErr });
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="catalog-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-popup ${toastMessage.isError ? 'error' : 'success'}`}>
          {toastMessage.isError ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="catalog-hero">
        <div className="hero-content">
          <h1>Discover Exceptional Products</h1>
          <p>Explore high-quality products curated by verified sellers with secure checkout & fast delivery.</p>

          <form onSubmit={handleSearch} className="search-form">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search gadgets, audio, sneakers, lifestyle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearchQuery('');
                  handleFilterByCategory(selectedCategory);
                }}
              >
                Clear
              </button>
            )}
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category Pills Bar */}
      <div className="category-bar">
        <button
          className={`cat-pill ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => handleFilterByCategory(null)}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleFilterByCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-catalog-state">
          <Tag size={48} className="empty-icon" />
          <h3>No products found</h3>
          <p>
            {categories.length === 0
              ? 'No products have been added yet. Sign in as Admin or Seller to create products!'
              : 'Try adjusting your search criteria or select another category.'}
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="card-image-box">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'}
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                  }}
                />
                {product.categoryName && (
                  <span className="card-category-badge">{product.categoryName}</span>
                )}
                <span className={`stock-badge ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="card-body">
                <h3 className="product-title" title={product.name}>{product.name}</h3>
                <p className="product-desc">{product.description || 'No description provided.'}</p>

                <div className="card-meta">
                  <span className="seller-name">Seller: @{product.sellerUsername || 'Verified Store'}</span>
                </div>

                <div className="card-bottom">
                  <div className="price-tag">
                    <span className="currency">$</span>
                    <span className="amount">{Number(product.price).toFixed(2)}</span>
                  </div>

                  {product.stockQuantity <= 0 ? (
                    <button className="add-cart-btn" disabled>
                      Sold Out
                    </button>
                  ) : (() => {
                    const inCart = getCartItem(product.id);
                    if (inCart) {
                      return (
                        <div className="card-qty-controller">
                          <button
                            type="button"
                            className="qty-stepper-btn minus"
                            onClick={() => handleUpdateInCartQty(product.id, inCart.quantity - 1)}
                            title="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-stepper-value">{inCart.quantity} in Cart</span>
                          <button
                            type="button"
                            className="qty-stepper-btn plus"
                            disabled={inCart.quantity >= product.stockQuantity}
                            onClick={() => handleUpdateInCartQty(product.id, inCart.quantity + 1)}
                            title="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        className="add-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={15} />
                        <span>Add to Cart</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

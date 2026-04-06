import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircle,
  Clock,
  Coffee,
  Edit2,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useCart } from '../../../core/contexts/CartContext';
import { products as seededProducts } from '../../menu/model/products';
import './AdminDashboard.css';

function ProductThumb({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="admin-product-fallback">☕</div>;
  }

  return <img src={src} alt={alt} className="admin-product-img" onError={() => setFailed(true)} />;
}

function MenuItemModal({ onClose, onSave, title, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'Hot Coffee',
    price: initialData?.price || 0,
    description: initialData?.description || '',
    image: initialData?.image || '',
    available: initialData?.available ?? true,
    stock: initialData?.stock || 50,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (initialData) {
      onSave({ ...formData, id: initialData.id });
      return;
    }
    onSave(formData);
  };

  return (
    <dialog className="admin-modal-backdrop" open>
      <div className="admin-modal">
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className="admin-icon-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form className="admin-modal-form" onSubmit={handleSubmit}>
          <label>
            <span>Product Name</span>
            <input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </label>

          <label>
            <span>Category</span>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              required
            >
              <option value="Hot Coffee">Hot Coffee</option>
              <option value="Iced Coffee">Iced Coffee</option>
              <option value="Specialty">Specialty</option>
              <option value="Frappe">Frappe</option>
              <option value="Non-Coffee">Non-Coffee</option>
            </select>
          </label>

          <div className="admin-modal-row-2">
            <label>
              <span>Price (PHP)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </label>
            <label>
              <span>Stock</span>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                required
              />
            </label>
          </div>

          <label>
            <span>Description</span>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </label>

          <label>
            <span>Image URL</span>
            <input
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              required
            />
          </label>

          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
            />
            <span>Available for order</span>
          </label>

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn admin-btn-soft" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary"><Save size={16} /> Save Item</button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

function OrderMonitoring({ orders }) {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [ordersList, setOrdersList] = useState(orders);

  useEffect(() => {
    setOrdersList(orders);
  }, [orders]);

  const statuses = ['All', 'Preparing', 'Ready for Pick Up', 'Out for Delivery', 'Delivered'];

  const filteredOrders = selectedStatus === 'All'
    ? ordersList
    : ordersList.filter((o) => o.status === selectedStatus);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrdersList((prev) => prev.map((order) => (
      order.id === orderId ? { ...order, status: newStatus } : order
    )));
  };

  return (
    <div>
      <h1 className="admin-heading">Order Monitoring</h1>

      <div className="admin-filter-row">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            className={`admin-pill ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {status}
            {status !== 'All' && <span>({ordersList.filter((o) => o.status === status).length})</span>}
          </button>
        ))}
      </div>

      <div className="admin-orders-stack">
        {filteredOrders.map((order) => (
          <article key={order.id} className="admin-order-card">
            <header className="admin-order-head">
              <div className="admin-order-head-meta">
                <div>
                  <p className="admin-muted">Order #</p>
                  <p className="admin-strong">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="admin-muted">Customer</p>
                  <p className="admin-strong">{order.shippingInfo?.fullName || order.shippingInfo?.name || 'Walk-in Customer'}</p>
                </div>
                <div>
                  <p className="admin-muted">Date</p>
                  <p className="admin-strong">{order.date}</p>
                </div>
              </div>
              <p className="admin-order-total">PHP {Number(order.total || 0).toFixed(2)}</p>
            </header>

            <div className="admin-order-items">
              {order.items.map((item) => (
                <div key={item.cartId} className="admin-order-item">
                  <div className="admin-order-item-image"><ProductThumb src={item.image} alt={item.name} /></div>
                  <div className="admin-order-item-text">
                    <p>{item.name}</p>
                    <small>{item.size} - {item.sugarLevel} - x{item.quantity}</small>
                  </div>
                  <span>PHP {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="admin-status-actions">
              <button type="button" onClick={() => updateOrderStatus(order.id, 'Preparing')}>Preparing</button>
              {order.fulfillment === 'pickup' ? (
                <button type="button" onClick={() => updateOrderStatus(order.id, 'Ready for Pick Up')}>Ready for Pick Up</button>
              ) : (
                <button type="button" onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}>Out for Delivery</button>
              )}
              <button type="button" onClick={() => updateOrderStatus(order.id, 'Delivered')}><CheckCircle size={14} /> Complete</button>
            </div>
          </article>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="admin-empty">
          <Package size={34} />
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ onNavigate, isAuthenticated, user }) {
  const { orders } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('home');
      return;
    }

    const isAdmin = (user?.role || '').trim().toLowerCase() === 'admin';
    if (!isAdmin) {
      onNavigate('dashboard');
      return;
    }

    const items = seededProducts.map((product) => ({
      id: String(product.id),
      name: product.name,
      category: product.category,
      price: Number(product.price),
      description: product.description,
      image: product.image,
      available: true,
      stock: Math.floor(Math.random() * 50) + 10,
    }));

    setMenuItems(items);
  }, [isAuthenticated, onNavigate, user?.role]);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingOrders = orders.filter((order) => order.status === 'Preparing').length;
  const activeMenuItems = menuItems.filter((item) => item.available).length;

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(menuItems.map((item) => item.category)));
    return ['All', ...dynamicCategories];
  }, [menuItems]);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (newItem) => {
    const item = { ...newItem, id: `menu-${Date.now()}` };
    setMenuItems((prev) => [...prev, item]);
    setIsAddModalOpen(false);
  };

  const handleUpdateItem = (updatedItem) => {
    setMenuItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleToggleAvailability = (id) => {
    setMenuItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, available: !item.available } : item
    )));
  };

  const isAdmin = (user?.role || '').trim().toLowerCase() === 'admin';
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <div className="admin-brand-left">
              <Coffee size={26} />
              <span className="admin-brand-title">Cafecito Admin</span>
              <span className="admin-chip">ADMIN PANEL</span>
            </div>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-user-info">
              <p className="admin-user-name">{user?.name || 'Admin'}</p>
              <p className="admin-user-email">{user?.email || ''}</p>
            </div>
            <button
              type="button"
              className="admin-avatar-btn"
              onClick={() => onNavigate('profile')}
              aria-label="Open profile"
              title="Profile"
            >
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <div className="admin-shell">
        <div className="admin-tab-row">
          <button type="button" className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <TrendingUp size={16} /> Overview
          </button>
          <button type="button" className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
            <Coffee size={16} /> Menu Management
          </button>
          <button type="button" className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <Package size={16} /> Order Monitoring {pendingOrders > 0 ? <span className="admin-badge">{pendingOrders}</span> : null}
          </button>
        </div>

        {activeTab === 'overview' && (
          <section>
            <h1 className="admin-heading">Dashboard Overview</h1>
            <div className="admin-stats-grid">
              <article className="admin-stat-card">
                <Package size={20} />
                <p>Total Orders</p>
                <h3>{totalOrders}</h3>
              </article>
              <article className="admin-stat-card">
                <TrendingUp size={20} />
                <p>Total Revenue</p>
                <h3>PHP {totalRevenue.toFixed(0)}</h3>
              </article>
              <article className="admin-stat-card">
                <Clock size={20} />
                <p>Pending Orders</p>
                <h3>{pendingOrders}</h3>
              </article>
              <article className="admin-stat-card">
                <Users size={20} />
                <p>Active Menu Items</p>
                <h3>{activeMenuItems}</h3>
              </article>
            </div>

            <div className="admin-recent-card">
              <div className="admin-recent-head">
                <h2>Recent Orders</h2>
                <button type="button" className="admin-link-btn" onClick={() => setActiveTab('orders')}>
                  View All →
                </button>
              </div>

              <div className="admin-recent-list">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="admin-recent-item">
                      <div className="admin-recent-left">
                        <div className="admin-recent-count">{order.items?.length || 0}</div>
                        <div>
                          <p className="admin-recent-strong">{order.orderNumber}</p>
                          <p className="admin-recent-muted">{order.date}</p>
                        </div>
                      </div>
                      <div className="admin-recent-right">
                        <p className="admin-recent-total">PHP {Number(order.total || 0).toFixed(2)}</p>
                        <p className="admin-recent-muted">{order.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="admin-empty">
                    <Package size={34} />
                    <p>No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'menu' && (
          <section>
            <div className="admin-section-head">
              <h1 className="admin-heading">Menu Management</h1>
              <button type="button" className="admin-btn admin-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} /> Add New Item
              </button>
            </div>

            <div className="admin-filters">
              <div className="admin-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search menu items..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="admin-category-row">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategory === category ? 'active' : ''}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-menu-grid">
              {filteredMenuItems.map((item) => (
                <article key={item.id} className="admin-menu-card">
                  <div className="admin-menu-image-wrap">
                    <ProductThumb src={item.image} alt={item.name} />
                    <span className={`admin-availability ${item.available ? 'on' : 'off'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="admin-menu-card-body">
                    <small>{item.category}</small>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="admin-menu-meta">
                      <span>PHP {Number(item.price).toFixed(2)}</span>
                      <span>Stock: {item.stock}</span>
                    </div>
                    <div className="admin-menu-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button type="button" onClick={() => handleToggleAvailability(item.id)}>
                        {item.available ? 'Disable' : 'Enable'}
                      </button>
                      <button type="button" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="admin-empty">
                <Coffee size={34} />
                <p>No menu items found</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'orders' && <OrderMonitoring orders={orders} />}
      </div>

      {isAddModalOpen && (
        <MenuItemModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddItem}
          title="Add New Menu Item"
        />
      )}

      {isEditModalOpen && editingItem && (
        <MenuItemModal
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleUpdateItem}
          title="Edit Menu Item"
          initialData={editingItem}
        />
      )}
    </div>
  );
}

ProductThumb.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string,
};

ProductThumb.defaultProps = {
  alt: 'Product image',
  src: '',
};

MenuItemModal.propTypes = {
  initialData: PropTypes.shape({
    available: PropTypes.bool,
    category: PropTypes.string,
    description: PropTypes.string,
    id: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    stock: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

MenuItemModal.defaultProps = {
  initialData: null,
};

OrderMonitoring.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    fulfillment: PropTypes.string,
    id: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      cartId: PropTypes.string,
      image: PropTypes.string,
      name: PropTypes.string,
      price: PropTypes.number,
      quantity: PropTypes.number,
      size: PropTypes.string,
      sugarLevel: PropTypes.string,
    })),
    orderNumber: PropTypes.string,
    shippingInfo: PropTypes.object,
    status: PropTypes.string,
    total: PropTypes.number,
  })).isRequired,
};

AdminDashboard.propTypes = {
  isAuthenticated: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
  user: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
  }),
};

AdminDashboard.defaultProps = {
  isAuthenticated: false,
  user: null,
};

export default AdminDashboard;

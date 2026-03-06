import React, { useState, useEffect } from 'react';
import { ArrowRight, Coffee, Snowflake } from 'lucide-react';
import './Dashboard.css';
import { TokenUtil } from '../utils/tokenUtil';
import { ApiService } from '../utils/apiService';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';

const BANNER_IMG = 'https://images.unsplash.com/photo-1707500315925-910ab09b92b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80';

const categoryIcons = {
  'Hot Coffee': <Coffee size={20} />,
  'Iced Coffee': <Snowflake size={20} />,
};

const categories = [
  { label: 'All' },
  { label: 'Hot Coffee', icon: <Coffee size={16} /> },
  { label: 'Iced Coffee', icon: <Snowflake size={16} /> },
];

function Dashboard({ onLogout }) {
  const [user, setUser] = useState({ name: 'Guest', email: '' });
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!TokenUtil.isAuthenticated()) {
      window.location.hash = '#/';
      return;
    }
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profileData = await ApiService.getProfile();
      if (profileData) {
        setUser({
          name: profileData.name || 'Guest',
          email: profileData.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    TokenUtil.removeToken();
    onLogout();
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const featuredProducts = products.filter(p => p.featured);

  const firstName = (user.name || 'Guest').split(' ')[0];

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <section className="dashboard-banner">
        <div className="dashboard-banner-bg">
          <img src={BANNER_IMG} alt="Coffee banner" />
          <div className="dashboard-banner-overlay" />
        </div>
        <div className="dashboard-banner-inner">
          <div className="dashboard-banner-content">
            <p className="dashboard-banner-eyebrow">Good morning ☕</p>
            <h1 className="dashboard-banner-title">
              Welcome back,<br />
              <span>{firstName}!</span>
            </h1>
            <p className="dashboard-banner-subtitle">
              Ready for your perfect cup today? Browse our freshly crafted menu.
            </p>
            <div className="dashboard-banner-actions">
              <button className="dashboard-banner-btn">
                View Cart <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Featured Section */}
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="dashboard-section-title">Featured Drinks</h2>
              <p className="dashboard-section-subtitle">Handpicked by our baristas just for you</p>
            </div>
            <button className="dashboard-view-all-btn">
              View All <ArrowRight size={15} />
            </button>
          </div>
          <div className="dashboard-featured-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </section>

        {/* Browse Menu Section */}
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="dashboard-section-title">Browse Menu</h2>
              <p className="dashboard-section-subtitle">Find your perfect cup</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="dashboard-category-tabs">
            {categories.map(cat => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`dashboard-category-tab${activeCategory === cat.label ? ' active' : ''}`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Category Cards (when All is selected) */}
          {activeCategory === 'All' && (
            <div className="dashboard-category-cards">
              {['Hot Coffee', 'Iced Coffee'].map(cat => {
                const catProducts = products.filter(p => p.category === cat);
                const catImage = catProducts[0]?.image;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="dashboard-category-card"
                  >
                    <img src={catImage} alt={cat} />
                    <div className="dashboard-category-card-overlay" />
                    <div className="dashboard-category-card-info">
                      <div className="dashboard-category-card-label">
                        {categoryIcons[cat]}
                        <span>{cat}</span>
                      </div>
                      <p className="dashboard-category-card-count">{catProducts.length} items available</p>
                    </div>
                    <div className="dashboard-category-card-badge">
                      {catProducts.length} items
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Products Grid */}
          <div className="dashboard-products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

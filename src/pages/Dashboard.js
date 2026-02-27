import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [user, setUser] = useState({ name: 'Guest', email: '' });
  const [currentView, setCurrentView] = useState('menu'); // 'menu' or 'cart'
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: 'Espresso', price: 3.50, image: null },
    { id: 2, name: 'Cappuccino', price: 4.50, image: null },
    { id: 3, name: 'Latte', price: 4.75, image: null },
    { id: 4, name: 'Americano', price: 3.75, image: null },
    { id: 5, name: 'Mocha', price: 5.00, image: null },
    { id: 6, name: 'Cold Brew', price: 4.00, image: null },
    { id: 7, name: 'Flat White', price: 4.50, image: null },
    { id: 8, name: 'Macchiato', price: 3.75, image: null }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:8080/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser({ name: data.data.name, email: data.data.email });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
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

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <svg className="nav-logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5C22,3.89 21.1,3 20,3Z" />
          </svg>
          <span className="nav-logo-text">Cafecito</span>
        </div>
        
        <div className="nav-center">
          <input
            type="text"
            className="search-input"
            placeholder="Search for drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="nav-right">
          <button 
            className={`nav-button ${currentView === 'menu' ? 'active' : ''}`}
            onClick={() => setCurrentView('menu')}
          >
            Menu
          </button>
          <button 
            className={`nav-button ${currentView === 'cart' ? 'active' : ''}`}
            onClick={() => setCurrentView('cart')}
          >
            Cart {getCartItemCount() > 0 && `(${getCartItemCount()})`}
          </button>
          <button className="nav-button">Profile</button>
          <button className="nav-button" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {currentView === 'menu' ? (
          <div className="menu-container">
            <h1 className="page-title">Menu</h1>
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <span>[Image]</span>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">₱{product.price.toFixed(2)}</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-header">
              <button className="back-button" onClick={() => setCurrentView('menu')}>
                ← Cafecito
              </button>
            </div>
            <h1 className="page-title">Shopping Cart</h1>
            <div className="cart-content">
              <div className="cart-items">
                {cart.length === 0 ? (
                  <p className="empty-cart">Your cart is empty</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">[Image]</div>
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p className="cart-item-price">₱{item.price.toFixed(2)}</p>
                      </div>
                      <div className="cart-item-quantity">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="order-summary">
                  <h2>Order Summary</h2>
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₱{getCartTotal()}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₱{getCartTotal()}</span>
                  </div>
                  <button className="checkout-btn">Proceed to Checkout</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

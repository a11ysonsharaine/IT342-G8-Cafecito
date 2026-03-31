import './App.css';
import { useState, useEffect } from 'react';
import Navbar from './core/base/ui/Navbar';
import LandingPage from './features/home/ui/LandingPage';
import Login from './features/auth/ui/Login';
import Register from './features/auth/ui/Register';
import Dashboard from './features/menu/ui/Dashboard';
import ProductDetailsPage from './features/menu/ui/ProductDetailsPage';
import ProfilePage from './features/profile/ui/ProfilePage';
import Cart from './features/cart/ui/Cart';
import CheckoutPage from './features/checkout/ui/CheckoutPage';
import OrderProcessingPage from './features/orders/ui/OrderProcessingPage';
import { TokenUtil } from './core/utils/tokenUtil';
import { ApiService } from './core/base/apiService';
import { CartProvider } from './core/contexts/CartContext';
import { products } from './features/menu/model/products';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [navigationState, setNavigationState] = useState({});

  useEffect(() => {
    // Check if user is already logged in
    if (TokenUtil.isAuthenticated()) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      window.location.hash = 'dashboard';
      
      // Get user data from localStorage
      const userData = TokenUtil.getUserData();
      if (userData) {
        setUser(userData);
      }
      return;
    }

    // Check URL hash on mount
    const hash = window.location.hash.substring(1);
    if (hash === 'register') {
      setCurrentPage('register');
    } else if (hash === 'login') {
      setCurrentPage('login');
    } else {
      setCurrentPage('home');
      window.location.hash = 'home';
    }
  }, []);

  const showLogin = () => {
    setCurrentPage('login');
    setIsAuthenticated(false);
    window.location.hash = 'login';
  };

  const showLoginAfterRegister = (msg) => {
    setRegisterSuccessMsg(msg || 'Account created successfully!');
    setCurrentPage('login');
    setIsAuthenticated(false);
    window.location.hash = 'login';
  };

  const showRegister = () => {
    setCurrentPage('register');
    window.location.hash = 'register';
  };

  const showDashboard = () => {
    const userData = TokenUtil.getUserData();
    if (userData) {
      setUser(userData);
    }
    setCurrentPage('dashboard');
    setIsAuthenticated(true);
    window.location.hash = 'dashboard';
  };

  const handleNavigate = (page, state = {}) => {
    setNavigationState(state);
    setCurrentPage(page);
    window.location.hash = page;
    if (page === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenProductDetails = (productId) => {
    setSelectedProductId(String(productId));
    setCurrentPage('product-details');
    window.location.hash = `product-${productId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = ({ quantity }) => {
    setCartCount((count) => count + (quantity || 1));
  };

  const selectedProduct = products.find(
    (product) => String(product.id) === String(selectedProductId)
  );

  const handleLogout = () => {
    TokenUtil.removeToken();
    TokenUtil.removeUserData();
    setIsAuthenticated(false);
    setUser(null);
    setCartCount(0);
    setCurrentPage('home');
    window.location.hash = 'home';
  };

  const handleUpdateProfile = async (form) => {
    try {
      const payload = {
        name: form.name,
        phoneNumber: form.phone || '',
      };

      const { response, data } = await ApiService.updateProfile(payload);

      if (!response.ok || !data?.success) {
        return { success: false, message: data?.message || 'Failed to update profile' };
      }

      const nextUser = data?.data || {
        ...user,
        name: form.name,
        email: form.email,
        phoneNumber: form.phone || '',
      };

      setUser(nextUser);
      TokenUtil.setUserData(nextUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  };

  const handleChangePassword = async ({ current, next }) => {
    try {
      const { response, data } = await ApiService.changePassword({
        currentPassword: current,
        newPassword: next,
      });

      if (!response.ok || !data?.success) {
        return { success: false, message: data?.message || 'Failed to change password' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to change password' };
    }
  };

  const handleUploadPhoto = async (file) => {
    try {
      const data = await ApiService.uploadPhoto(file);
      if (!data?.success) {
        return { success: false, message: data?.message || 'Failed to upload photo' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to upload photo' };
    }
  };

  const handleLoadPhoto = async () => {
    try {
      const url = await ApiService.getPhoto();
      return { success: true, url };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to load photo', url: '' };
    }
  };

  return (
    <CartProvider>
      <div className="App">
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user}
          cartCount={cartCount}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        {!isAuthenticated ? (
          currentPage === 'home' ? (
            <LandingPage 
              onSwitchToRegister={showRegister} 
              onSwitchToLogin={showLogin}
            />
          ) : currentPage === 'login' ? (
            <Login
              onSwitchToRegister={showRegister}
              onSwitchToDashboard={showDashboard}
              successMessage={registerSuccessMsg}
              onClearSuccessMessage={() => setRegisterSuccessMsg('')}
            />
          ) : (
            <Register onSwitchToLogin={showLoginAfterRegister} />
          )
        ) : currentPage === 'profile' ? (
          <ProfilePage
            isAuthenticated={isAuthenticated}
            user={user}
            onBack={() => handleNavigate('dashboard')}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onUploadPhoto={handleUploadPhoto}
            onLoadPhoto={handleLoadPhoto}
          />
        ) : currentPage === 'cart' ? (
          <Cart
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('dashboard')}
          />
        ) : currentPage === 'checkout' ? (
          <CheckoutPage
            isAuthenticated={isAuthenticated}
            user={user}
            discount={Number(navigationState?.discount || 0)}
            onNavigate={handleNavigate}
          />
        ) : currentPage === 'order-processing' ? (
          <OrderProcessingPage onNavigate={handleNavigate} />
        ) : currentPage === 'product-details' ? (
          <ProductDetailsPage
            isAuthenticated={isAuthenticated}
            product={selectedProduct}
            onBack={() => handleNavigate('dashboard')}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        ) : (
          <Dashboard
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProductDetails}
          />
        )}
      </div>
    </CartProvider>
  );
}

export default App;

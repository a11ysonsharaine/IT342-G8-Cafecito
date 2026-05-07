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
import OrderConfirmationPage from './features/orders/ui/OrderConfirmationPage';
import OrdersPage from './features/orders/ui/OrdersPage';
import AdminDashboard from './features/admin/ui/AdminDashboard';
import { TokenUtil } from './core/utils/tokenUtil';
import { ApiService } from './core/base/apiService';
import { CartProvider } from './core/contexts/CartContext';

const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();
const pageForRole = (role) => (normalizeRole(role) === 'admin' ? 'admin' : 'dashboard');

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [navigationState, setNavigationState] = useState({});

  const isAdmin = normalizeRole(user?.role) === 'admin';

  useEffect(() => {
    // Check if user is already logged in
    if (TokenUtil.isAuthenticated()) {
      setIsAuthenticated(true);
      const initialUserData = TokenUtil.getUserData();
      const initialPage = pageForRole(initialUserData?.role);
      setCurrentPage(initialPage);
      window.location.hash = initialPage;
      
      // Get user data from localStorage
      if (initialUserData) setUser(initialUserData);

      // Refresh user profile from API to ensure role is up-to-date.
      (async () => {
        try {
          const freshProfile = await ApiService.getProfile();
          if (freshProfile) {
            setUser(freshProfile);
            TokenUtil.setUserData(freshProfile);

            const freshPage = pageForRole(freshProfile?.role);
            setCurrentPage(freshPage);
            window.location.hash = freshPage;
          }
        } catch (error) {
          // ignore
        }
      })();

      // Load user photo for navbar avatar.
      (async () => {
        try {
          const url = await ApiService.getPhoto();
          setUserPhotoUrl(url || '');
        } catch (error) {
          setUserPhotoUrl('');
        }
      })();
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

  useEffect(() => {
    const syncAuthFromStorage = () => {
      const authed = TokenUtil.isAuthenticated();
      setIsAuthenticated(authed);
      if (!authed) {
        setUser(null);
        setUserPhotoUrl('');
        setCartCount(0);
        setSelectedProduct(null);
        setCurrentPage('home');
        window.location.hash = 'home';
        return;
      }

      const userData = TokenUtil.getUserData();
      if (userData) setUser(userData);
    };

    window.addEventListener('cafecito:auth-token-changed', syncAuthFromStorage);
    window.addEventListener('storage', syncAuthFromStorage);
    return () => {
      window.removeEventListener('cafecito:auth-token-changed', syncAuthFromStorage);
      window.removeEventListener('storage', syncAuthFromStorage);
    };
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

    const initialPage = pageForRole(userData?.role);
    setCurrentPage(initialPage);
    setIsAuthenticated(true);
    window.location.hash = initialPage;

    // Refresh profile after login/navigation so role/name are always up-to-date.
    (async () => {
      try {
        const freshProfile = await ApiService.getProfile();
        if (freshProfile) {
          setUser(freshProfile);
          TokenUtil.setUserData(freshProfile);

          const freshPage = pageForRole(freshProfile?.role);
          setCurrentPage(freshPage);
          window.location.hash = freshPage;
        }
      } catch (error) {
        // ignore
      }
    })();

    (async () => {
      try {
        const url = await ApiService.getPhoto();
        setUserPhotoUrl(url || '');
      } catch (error) {
        setUserPhotoUrl('');
      }
    })();

    // currentPage/isAuthenticated/hash already set above
  };

  const handleNavigate = (page, state = {}) => {
    if (isAuthenticated && isAdmin) {
      const blockedForAdmin = new Set([
        'cart',
        'checkout',
        'order-processing',
        'order-confirmation',
        'orders',
      ]);

      if (blockedForAdmin.has(page)) {
        setNavigationState({});
        setCurrentPage('admin');
        window.location.hash = 'admin';
        return;
      }
    }

    setNavigationState(state);
    setCurrentPage(page);
    window.location.hash = page;
    if (page === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenProductDetails = (productOrId) => {
    const product = productOrId && typeof productOrId === 'object' ? productOrId : null;
    const productId = product?.id ?? productOrId;

    setSelectedProduct(product);
    setCurrentPage('product-details');
    window.location.hash = `product-${productId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = ({ quantity }) => {
    setCartCount((count) => count + (quantity || 1));
  };

  const handleLogout = () => {
    TokenUtil.removeToken();
    TokenUtil.removeUserData();
    setIsAuthenticated(false);
    setUser(null);
    setUserPhotoUrl('');
    setCartCount(0);
    setSelectedProduct(null);
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
      setUserPhotoUrl(url || '');
      return { success: true, url };
    } catch (error) {
      setUserPhotoUrl('');
      return { success: false, message: error.message || 'Failed to load photo', url: '' };
    }
  };

  return (
    <CartProvider>
      <div className="App">
        {currentPage !== 'admin' && (
          <Navbar
            isAuthenticated={isAuthenticated}
            user={user}
            userPhotoUrl={userPhotoUrl}
            cartCount={cartCount}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}
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
            onBack={() => handleNavigate(isAdmin ? 'admin' : 'dashboard')}
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
          <OrderProcessingPage onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />
        ) : currentPage === 'order-confirmation' ? (
          <OrderConfirmationPage onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />
        ) : currentPage === 'orders' ? (
          <OrdersPage onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />
        ) : currentPage === 'admin' ? (
          <AdminDashboard
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        ) : currentPage === 'product-details' ? (
          <ProductDetailsPage
            isAuthenticated={isAuthenticated}
            user={user}
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

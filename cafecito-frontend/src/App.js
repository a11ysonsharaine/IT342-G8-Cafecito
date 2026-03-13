import './App.css';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { TokenUtil } from './utils/tokenUtil';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');

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

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
    if (page === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    TokenUtil.removeToken();
    TokenUtil.removeUserData();
    setIsAuthenticated(false);
    setUser(null);
    setCartCount(0);
    setCurrentPage('home');
    window.location.hash = 'home';
  };

  return (
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
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

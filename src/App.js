import './App.css';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      window.location.hash = 'dashboard';
      return;
    }

    // Check URL hash on mount
    const hash = window.location.hash.substring(1);
    if (hash === 'register') {
      setCurrentPage('register');
    } else {
      setCurrentPage('login');
      window.location.hash = 'login';
    }
  }, []);

  const showLogin = () => {
    setCurrentPage('login');
    setIsAuthenticated(false);
    window.location.hash = 'login';
  };

  const showRegister = () => {
    setCurrentPage('register');
    window.location.hash = 'register';
  };

  const showDashboard = () => {
    setCurrentPage('dashboard');
    setIsAuthenticated(true);
    window.location.hash = 'dashboard';
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showLogin();
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        currentPage === 'login' ? (
          <Login 
            onSwitchToRegister={showRegister} 
            onSwitchToDashboard={showDashboard}
          />
        ) : (
          <Register onSwitchToLogin={showLogin} />
        )
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

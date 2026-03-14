import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import './Navbar.css';
import logo from '../logo.png';

function Navbar({ 
  isAuthenticated, 
  user, 
  cartCount = 0, 
  currentPage,
  onNavigate,
  onLogout 
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const isLanding = currentPage === 'home';
  const isGuestPage = ['home', 'login', 'register'].includes(currentPage);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      
      // Detect which section is in view
      if (isLanding) {
        const sections = ['menu', 'about', 'contact'];
        const scrollPosition = window.scrollY + 100; // Offset for navbar height
        
        // Check if we're at the top
        if (window.scrollY < 200) {
          setActiveSection(null);
          return;
        }
        
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(sectionId);
              return;
            }
          }
        }
      }
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

  const handleLogout = () => {
    onLogout();
    setUserMenuOpen(false);
  };

  const handleNavigation = (page) => {
    onNavigate(page);
    setMobileOpen(false);
    if (page === 'home') {
      setActiveSection(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (page) => currentPage === page;

  const navBg = isLanding
    ? scrolled
      ? 'navbar-scrolled'
      : 'navbar-transparent'
    : 'navbar-scrolled';

  const linkBase = 'nav-link';
  const linkColor = isLanding && !scrolled ? 'nav-link-light' : 'nav-link-dark';
  const linkActive = isLanding && !scrolled ? 'nav-link-active-light' : 'nav-link-active-dark';

  const navLink = (page, label) => (
    <button
      onClick={() => handleNavigation(page)}
      className={`${linkBase} ${isActive(page) ? linkActive : linkColor}`}
    >
      {label}
      <span className={`nav-link-underline ${isActive(page) ? 'nav-link-underline-active' : ''}`} />
    </button>
  );

  return (
    <nav className={`navbar ${navBg}`}>
      <div className="navbar-container">
        <div className="navbar-content">

          {/* Logo */}
          <button
            onClick={() => handleNavigation(isAuthenticated ? 'dashboard' : 'home')}
            className="navbar-logo"
          >
            <div className="navbar-logo-icon">
              <img src={logo} alt="Cafecito Logo" className="logo-image" />
            </div>
            <span className={`navbar-logo-text ${isLanding && !scrolled ? 'logo-text-light' : 'logo-text-dark'}`}>
              Cafecito
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="navbar-links">
            {!isAuthenticated ? (
              <>
                {isGuestPage && (
                  <button
                    onClick={() => handleNavigation('home')}
                    className={`${linkBase} ${isActive('home') && !activeSection ? linkActive : linkColor}`}
                  >
                    Home
                    <span className={`nav-link-underline ${isActive('home') && !activeSection ? 'nav-link-underline-active' : ''}`} />
                  </button>
                )}
                <button
                  onClick={() => scrollToSection('menu')}
                  className={`${linkBase} ${activeSection === 'menu' ? 'nav-link-active-dark' : linkColor}`}
                >
                  Menu
                  <span className={`nav-link-underline ${activeSection === 'menu' ? 'nav-link-underline-active' : ''}`} />
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className={`${linkBase} ${activeSection === 'about' ? 'nav-link-active-dark' : linkColor}`}
                >
                  About
                  <span className={`nav-link-underline ${activeSection === 'about' ? 'nav-link-underline-active' : ''}`} />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`${linkBase} ${activeSection === 'contact' ? 'nav-link-active-dark' : linkColor}`}
                >
                  Contact
                  <span className={`nav-link-underline ${activeSection === 'contact' ? 'nav-link-underline-active' : ''}`} />
                </button>
              </>
            ) : (
              <>
                {navLink('dashboard', 'Menu')}
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Cart */}
            <button
              onClick={() => isAuthenticated && handleNavigation('cart')}
              className={`navbar-cart ${
                isAuthenticated
                  ? isLanding && !scrolled ? 'cart-icon-light' : 'cart-icon-dark'
                  : isLanding && !scrolled ? 'cart-icon-disabled-light' : 'cart-icon-disabled-dark'
              }`}
              title={isAuthenticated ? 'Cart' : 'Login to use cart'}
              disabled={!isAuthenticated}
            >
              <ShoppingCart size={19} />
              {isAuthenticated && cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className={`navbar-divider ${isLanding && !scrolled ? 'divider-light' : 'divider-dark'}`} />

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation('login')}
                  className={`navbar-login-btn ${isLanding && !scrolled ? 'login-btn-light' : 'login-btn-dark'}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavigation('register')}
                  className="navbar-signup-btn"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="navbar-user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="user-menu-trigger"
                >
                  <div className="user-avatar">
                    <span className="user-avatar-text">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className={`user-name ${isLanding && !scrolled ? 'user-name-light' : 'user-name-dark'}`}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`user-menu-icon ${userMenuOpen ? 'menu-icon-open' : ''} ${isLanding && !scrolled ? 'menu-icon-light' : 'menu-icon-dark'}`}
                  />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <button
                      onClick={() => { handleNavigation('profile'); setUserMenuOpen(false); }}
                      className="dropdown-item"
                    >
                      <User size={14} className="dropdown-icon" /> Profile
                    </button>
                    <div className="dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="dropdown-item dropdown-item-logout"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`navbar-hamburger ${isLanding && !scrolled ? 'hamburger-light' : 'hamburger-dark'}`}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => handleNavigation('home')}
                className={`mobile-menu-item ${isActive('home') && !activeSection ? 'font-bold' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('menu')}
                className={`mobile-menu-item ${activeSection === 'menu' ? 'mobile-menu-item-active' : ''}`}
              >
                Menu
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className={`mobile-menu-item ${activeSection === 'about' ? 'mobile-menu-item-active' : ''}`}
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className={`mobile-menu-item mobile-menu-item-last ${activeSection === 'contact' ? 'mobile-menu-item-active' : ''}`}
              >
                Contact
              </button>
              <div className="mobile-menu-actions">
                <button onClick={() => handleNavigation('login')} className="mobile-login-btn">
                  Log In
                </button>
                <button onClick={() => handleNavigation('register')} className="mobile-signup-btn">
                  Sign Up
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigation('dashboard')} className="mobile-menu-item">
                Menu
              </button>
              <button onClick={() => handleNavigation('profile')} className="mobile-menu-item">
                Profile
              </button>
              <button onClick={() => handleNavigation('cart')} className="mobile-menu-item mobile-menu-item-last">
                <ShoppingCart size={17} /> Cart
                {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
              </button>
              <div className="mobile-menu-logout">
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={17} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

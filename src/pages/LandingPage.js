import React, { useEffect, useRef } from 'react';
import {
  ArrowRight, Star, Truck, Clock, Leaf,
  Mail, Phone, MapPin, Instagram, Facebook, Twitter,
  ArrowUpRight,
} from 'lucide-react';
import './LandingPage.css';
import logo from '../logo.png';

// Sample featured products
const featuredProducts = [
  {
    id: 1,
    name: 'Iced Matcha Latte',
    price: 5.25,
    rating: 4.8,
    image: '/images/menu/iced matcha latte.png',
    description: 'Refreshing matcha green tea with cold milk'
  },
  {
    id: 2,
    name: 'Hot Mocha',
    price: 5.00,
    rating: 4.9,
    image: '/images/menu/hot mocha.png',
    description: 'Espresso, chocolate, and steamed milk'
  },
  {
    id: 3,
    name: 'Iced Caramel Macchiato',
    price: 5.50,
    rating: 4.7,
    image: '/images/menu/iced caramel.png',
    description: 'Sweet caramel blended with espresso and ice'
  }
];

const pillars = [
  { icon: <img src={logo} alt="Logo" style={{ width: 20, height: 20, objectFit: 'contain' }} />, label: 'Single Origin Beans' },
  { icon: <Leaf size={20} />, label: 'Ethically Sourced' },
  { icon: <Truck size={20} />, label: '30 Min Delivery' },
  { icon: <Clock size={20} />, label: 'Open Daily 6AM–10PM' },
];

function LandingPage({ onSwitchToRegister, onSwitchToLogin }) {
  const heroRef = useRef(null);

  // Subtle parallax on hero image
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.transform = `translateY(${y * 0.3}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">

      {/* HERO SECTION */}
      <section className="hero-section">
        {/* Parallax background */}
        <div className="hero-bg-wrapper">
          <div ref={heroRef} className="hero-bg">
            <img
              src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1920"
              alt="Cafecito atmosphere"
              className="hero-image"
            />
          </div>
          <div className="hero-overlay" />
          <div className="hero-vignette" />
        </div>

        {/* Hero content */}
        <div className="hero-content">
          <p className="hero-eyebrow">Est. 2023 · Freshly Brewed Coffee</p>
          
          <h1 className="hero-title">
            Brewing Moments,<br />
            <em className="hero-title-accent">One Cup at a Time</em>
          </h1>

          <p className="hero-description">
            Experience the finest artisan coffee in a space designed for those who
            appreciate the craft — slow, intentional, memorable.
          </p>

          <button onClick={() => scrollToSection('menu')} className="hero-cta">
            EXPLORE MENU
            <ArrowRight size={16} className="cta-icon" />
          </button>

          <button onClick={onSwitchToRegister} className="hero-signup-link">
            Create an account to order
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line" />
        </div>
      </section>

      {/* PILLARS STRIP */}
      <div className="pillars-strip">
        <div className="pillars-container">
          {pillars.map((p, i) => (
            <React.Fragment key={p.label}>
              <div className="pillar-item">
                <span className="pillar-icon">{p.icon}</span>
                <span className="pillar-label">{p.label}</span>
              </div>
              {i < pillars.length - 1 && <div className="pillar-divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* PHILOSOPHY SECTION */}
      <section className="philosophy-section">
        <div className="section-container">
          <div className="philosophy-grid">
            
            {/* Photo block */}
            <div className="philosophy-image-wrapper">
              <div className="philosophy-image">
                <img
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"
                  alt="Latte art close up"
                />
              </div>
              <div className="rating-card">
                <div className="rating-number">4.9</div>
                <div className="rating-stars">
                  {[1,2,3,4,5].map(s => <Star key={s} size={11} className="rating-star" />)}
                </div>
                <div className="rating-label">App Rating</div>
              </div>
            </div>

            {/* Text block */}
            <div className="philosophy-text">
              <p className="section-eyebrow">Our Philosophy</p>
              <h2 className="section-title">
                Coffee is not just a drink.<br />
                <span className="section-title-accent">It's a ritual.</span>
              </h2>
              <p className="section-description">
                At Cafecito, we believe every cup deserves intention. We source single-origin beans from farms
                that share our values — quality, sustainability, and fairness.
              </p>
              <p className="section-description">
                Our baristas are craftspeople. Trained for precision, guided by passion — they turn simple
                ingredients into something that stays with you long after the last sip.
              </p>

              {/* Stats */}
              <div className="stats-row">
                {[
                  { val: '10K+', label: 'Customers Served' },
                  { val: '2 Years', label: 'Of Excellence' },
                  { val: '100%', label: 'Premium Coffee Beans' },
                ].map(s => (
                  <div key={s.label} className="stat-item">
                    <div className="stat-value">{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={onSwitchToRegister} className="btn-secondary">
                START YOUR ORDER
                <ArrowUpRight size={15} className="btn-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MENU PREVIEW */}
      <section id="menu" className="menu-section">
        <div className="section-container">
          
          {/* Header */}
          <div className="menu-header">
            <div>
              <p className="section-eyebrow-light">What We Brew</p>
              <h2 className="section-title-light">Today's Favorites</h2>
            </div>
            <button onClick={onSwitchToRegister} className="menu-link">
              VIEW FULL MENU
              <ArrowUpRight size={14} className="link-icon" />
            </button>
          </div>

          {/* Product cards */}
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card" onClick={onSwitchToRegister}>
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-overlay" />
                  <div className="product-price">₱{product.price.toFixed(2)}</div>
                </div>

                <div className="product-info">
                  <div className="product-rating">
                    {[1,2,3,4,5].map(s => (
                      <Star 
                        key={s} 
                        size={11} 
                        className={s <= Math.round(product.rating) ? 'star-filled' : 'star-empty'} 
                      />
                    ))}
                    <span className="product-rating-text">{product.rating}</span>
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-cta">
                    <span className="product-cta-text">Order Now</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="menu-cta-wrapper">
            <button onClick={onSwitchToRegister} className="btn-primary">
              BROWSE FULL MENU
              <ArrowRight size={15} className="btn-icon" />
            </button>
          </div>
        </div>
      </section>

      {/* ATMOSPHERE */}
      <section className="atmosphere-section">
        <img
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920"
          alt="Cafecito interior"
          className="atmosphere-bg"
        />
        <div className="atmosphere-overlay" />
        <div className="atmosphere-content">
          <p className="section-eyebrow-light">Our Space</p>
          <blockquote className="atmosphere-quote">
            "A place where time slows down, and coffee brings people together."
          </blockquote>
          <button onClick={onSwitchToRegister} className="atmosphere-link">
            Order & Pick Up
          </button>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="about-grid">
            
            {/* Text */}
            <div className="about-text">
              <p className="section-eyebrow">Our Story</p>
              <h2 className="section-title">
                More Than Just<br />
                <span className="section-title-accent">a Coffee Shop</span>
              </h2>
              <p className="section-description">
                Founded in 2023, Cafecito was born from a love of exceptional coffee and warm community. We source beans directly from ethical farms across Sultan Kudarat and Bukidnon.
              </p>
              <p className="section-description">
                Our baristas undergo 200+ hours of training. Whether it's your morning ritual or a quiet afternoon escape, every cup is crafted specifically for you.
              </p>

              <div className="about-stats">
                {[
                  { val: '15+', label: 'Specialty Blends' },
                  { val: '30min', label: 'Avg. Delivery' },
                  { val: '100%', label: 'Ethically Sourced' },
                  { val: '24/7', label: 'Customer Support' },
                ].map(s => (
                  <div key={s.label} className="about-stat-item">
                    <div className="about-stat-value">{s.val}</div>
                    <div className="about-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={onSwitchToRegister} className="btn-dark">
                START ORDERING
                <ArrowRight size={14} className="btn-icon" />
              </button>
            </div>

            {/* Barista Image */}
            <div className="about-image-wrapper">
              <div className="about-image">
                <img
                  src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800"
                  alt="Cafecito barista"
                />
              </div>
              <div className="about-accent-label">
                <div className="accent-label-value">2+</div>
                <div className="accent-label-text">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          
          <div className="contact-header">
            <p className="section-eyebrow-light">Find Us</p>
            <h2 className="section-title-light">We'd Love to Hear From You</h2>
          </div>

          <div className="contact-grid">
            {[
              { icon: <MapPin size={20} />, title: 'Visit Us', detail: '123 Brew Street\nBasak, Cebu City' },
              { icon: <Phone size={20} />, title: 'Call Us', detail: '+63 2 8123 4567' },
              { icon: <Mail size={20} />, title: 'Email Us', detail: 'cafecito@gmail.com' },
            ].map(c => (
              <div key={c.title} className="contact-card">
                <div className="contact-icon">{c.icon}</div>
                <h3 className="contact-title">{c.title}</h3>
                <p className="contact-detail">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="footer-logo">
            <img src={logo} alt="Cafecito Logo" className="footer-logo-icon" />
            <span className="footer-logo-text">Cafecito</span>
          </button>

          <p className="footer-copyright">
            © 2026 Cafecito · All rights reserved · Crafted with passion
          </p>

          <div className="footer-social">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <button key={i} className="social-icon">
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

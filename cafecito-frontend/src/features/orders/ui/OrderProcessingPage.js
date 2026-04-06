import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Coffee } from 'lucide-react';
import { useCart } from '../../../core/contexts/CartContext';
import './OrderProcessingPage.css';

function OrderProcessingPage({ onNavigate, isAuthenticated }) {
  const { currentOrder, lastOrder } = useCart();
  const activeOrder = currentOrder || lastOrder;

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('home');
      return;
    }

    if (!activeOrder) {
      onNavigate('cart');
      return;
    }

    const timer = setTimeout(() => {
      onNavigate('order-confirmation');
    }, 2800);

    return () => clearTimeout(timer);
  }, [activeOrder, isAuthenticated, onNavigate]);

  if (!activeOrder) {
    return null;
  }

  return (
    <div className="order-page">
      <div className="order-processing-shell">
        <div className="order-processing-icon-wrap">
          <div className="order-processing-icon">
            <Coffee size={40} className="order-processing-coffee" />
          </div>
          <div className="order-processing-ripple order-processing-ripple-one" />
          <div className="order-processing-ripple order-processing-ripple-two" />
        </div>
        <h2 className="order-processing-title">Processing Your Order</h2>
        <p className="order-processing-subtitle">
          Our baristas are getting ready to craft your perfect order. Just a moment...
        </p>

        <div className="order-processing-progress-track">
          <div className="order-processing-progress-fill" />
        </div>

        <div className="order-processing-spinner-row">
          <svg className="order-processing-spinner" viewBox="0 0 24 24" fill="none">
            <circle className="order-processing-spinner-fade" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="order-processing-spinner-solid" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Confirming with our kitchen...
        </div>
      </div>
    </div>
  );
}

OrderProcessingPage.propTypes = {
  isAuthenticated: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
};

OrderProcessingPage.defaultProps = {
  isAuthenticated: false,
};

export default OrderProcessingPage;
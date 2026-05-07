import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  Home,
  MapPin,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../../core/contexts/CartContext';
import './OrderConfirmationPage.css';

const paymentIcons = {
  'Credit/Debit Card': '💳',
  GCash: '📱',
  'Cash on Delivery': '💵',
  gcash: '📱',
  'cash-on-delivery': '💵',
  card: '💳',
};

function getPaymentLabel(paymentMethod) {
  if (paymentMethod === 'gcash') return 'GCash';
  if (paymentMethod === 'cash-on-delivery') return 'Cash on Delivery';
  if (paymentMethod === 'card') return 'Credit/Debit Card';
  return paymentMethod || 'Payment';
}

function ConfirmationImage({ src, alt }) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return <div className="order-confirmation-item-image-fallback">☕</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="order-confirmation-item-image"
      onError={() => setFailed(true)}
    />
  );
}

function OrderConfirmationPage({ onNavigate, isAuthenticated }) {
  const { currentOrder } = useCart();
  const paymentLabel = getPaymentLabel(currentOrder?.paymentMethod);
  const shippingName = currentOrder?.shippingInfo?.fullName || currentOrder?.shippingInfo?.name || 'Customer';
  const shippingAddress = currentOrder?.shippingInfo?.address || 'Address not provided';

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('home');
      return;
    }

    if (!currentOrder) {
      onNavigate('dashboard');
    }
  }, [currentOrder, isAuthenticated, onNavigate]);

  if (!currentOrder) {
    return null;
  }

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-wrapper">
        <div className="order-confirmation-header">
          <div className="order-confirmation-success-icon">
            <CheckCircle2 size={40} className="order-confirmation-success-check" />
          </div>
          <h1 className="order-confirmation-title">Order Confirmed! 🎉</h1>
          <p className="order-confirmation-subtitle">
            {currentOrder.fulfillment === 'pickup'
              ? "We're preparing your order. Head over when ready!"
              : "Thank you for your order! We're preparing your drinks with care."}
          </p>
        </div>

        <div className="order-confirmation-card">
          <div className="order-confirmation-card-head">
            <div>
              <p className="order-confirmation-label">Order Number</p>
              <p className="order-confirmation-order-number">{currentOrder.orderNumber}</p>
            </div>
            <div className="order-confirmation-date-wrap">
              <p className="order-confirmation-label">Order Date</p>
              <p className="order-confirmation-date">{currentOrder.date}</p>
            </div>
          </div>

          <div className="order-confirmation-status">
            <div className="order-confirmation-status-icon">
              {currentOrder.fulfillment === 'pickup' ? (
                <ShoppingBag size={16} className="order-confirmation-status-symbol" />
              ) : (
                <Coffee size={16} className="order-confirmation-status-symbol" />
              )}
            </div>
            <div>
              <p className="order-confirmation-status-title">Status: {currentOrder.status}</p>
              <p className="order-confirmation-status-subtitle">
                {currentOrder.fulfillment === 'pickup'
                  ? 'Your order is being prepared for pick up'
                  : 'Your order is being prepared'}
              </p>
            </div>
          </div>

          <div className="order-confirmation-body">
            <h3 className="order-confirmation-section-title">Items Ordered</h3>
            <div className="order-confirmation-items">
              {currentOrder.items.map((item) => (
                <div key={item.cartId} className="order-confirmation-item-row">
                  <div className="order-confirmation-item-image-wrap">
                    <ConfirmationImage src={item.image} alt={item.name} />
                  </div>
                  <div className="order-confirmation-item-meta">
                    <p className="order-confirmation-item-name">{item.name}</p>
                    <p className="order-confirmation-item-options">
                      {item.size} - {item.sugarLevel} - x{item.quantity}
                    </p>
                  </div>
                  <p className="order-confirmation-item-price">₱{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="order-confirmation-breakdown">
              <div className="order-confirmation-breakdown-row">
                <span>Subtotal</span>
                <span>₱{currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="order-confirmation-breakdown-row">
                <span>{currentOrder.fulfillment === 'delivery' ? 'Delivery Fee' : 'Pick Up'}</span>
                <span className={currentOrder.fulfillment === 'pickup' ? 'order-confirmation-free' : ''}>
                  {currentOrder.fulfillment === 'pickup' ? 'FREE' : `₱${currentOrder.deliveryFee.toFixed(2)}`}
                </span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="order-confirmation-breakdown-row order-confirmation-discount-row">
                  <span>Discount</span>
                  <span>-₱{currentOrder.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="order-confirmation-total-wrap">
              <span className="order-confirmation-total-label">Total Paid</span>
              <span className="order-confirmation-total-value">₱{currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="order-confirmation-info-grid">
            <div className="order-confirmation-info-cell">
              <p className="order-confirmation-info-label">Payment Method</p>
              <p className="order-confirmation-info-value">
                <span>{paymentIcons[paymentLabel] || paymentIcons[currentOrder.paymentMethod] || '💳'}</span> {paymentLabel}
              </p>
            </div>

            <div className="order-confirmation-info-cell">
              <p className="order-confirmation-info-label">
                <Clock size={11} /> {currentOrder.fulfillment === 'pickup' ? 'Est. Ready In' : 'Est. Delivery'}
              </p>
              <p className="order-confirmation-info-value">
                {currentOrder.fulfillment === 'pickup' ? '10–15 minutes' : '30–45 minutes'}
              </p>
            </div>

            <div className="order-confirmation-info-cell">
              {currentOrder.fulfillment === 'pickup' ? (
                <>
                  <p className="order-confirmation-info-label"><MapPin size={11} /> Pick Up At</p>
                  <p className="order-confirmation-info-value">Cafecito Store</p>
                  <p className="order-confirmation-info-subvalue">123 Coffee Lane, Manila</p>
                </>
              ) : (
                <>
                  <p className="order-confirmation-info-label"><Package size={11} /> Delivering To</p>
                  <p className="order-confirmation-info-value truncate">{shippingName}</p>
                  <p className="order-confirmation-info-subvalue truncate">{shippingAddress}</p>
                </>
              )}
            </div>
          </div>

        </div>

        <div className="order-confirmation-actions">
          <button
            onClick={() => onNavigate('dashboard')}
            className="order-confirmation-btn order-confirmation-btn-outline"
            type="button"
          >
            <Home size={18} /> Back to Home
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="order-confirmation-btn order-confirmation-btn-primary"
            type="button"
          >
            <Package size={18} /> View Orders <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

OrderConfirmationPage.propTypes = {
  isAuthenticated: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
};

OrderConfirmationPage.defaultProps = {
  isAuthenticated: false,
};

ConfirmationImage.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string,
};

ConfirmationImage.defaultProps = {
  alt: 'Product image',
  src: '',
};

export default OrderConfirmationPage;

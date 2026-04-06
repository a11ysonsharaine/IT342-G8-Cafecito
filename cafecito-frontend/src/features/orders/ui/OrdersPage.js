import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft,
  Coffee,
  MapPin,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../../core/contexts/CartContext';
import './OrdersPage.css';

function getPaymentLabel(paymentMethod) {
  if (paymentMethod === 'gcash') return 'GCash';
  if (paymentMethod === 'cash-on-delivery') return 'Cash on Delivery';
  if (paymentMethod === 'card') return 'Credit/Debit Card';
  return paymentMethod || 'Payment';
}

function getStatusClass(status) {
  switch (status) {
    case 'Preparing':
      return 'orders-status orders-status-preparing';
    case 'Out for Delivery':
      return 'orders-status orders-status-delivery';
    case 'Delivered':
      return 'orders-status orders-status-delivered';
    case 'Ready for Pick Up':
      return 'orders-status orders-status-pickup';
    default:
      return 'orders-status orders-status-default';
  }
}

function OrdersImage({ src, alt }) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return <div className="orders-item-image-fallback">☕</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="orders-item-image"
      onError={() => setFailed(true)}
    />
  );
}

function OrdersPage({ onNavigate, isAuthenticated }) {
  const { orders } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('home');
    }
  }, [isAuthenticated, onNavigate]);

  return (
    <div className="orders-page">
      <div className="orders-wrapper orders-page-wrapper">
        <button
          onClick={() => onNavigate('dashboard')}
          className="orders-back"
          type="button"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="orders-title">Order History</h1>
        <p className="orders-subtitle">
          {orders.length === 0 ? 'You have no orders yet' : `${orders.length} order(s) found`}
        </p>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon-wrap">
              <Package size={36} className="orders-empty-icon" />
            </div>
            <p className="orders-empty-title">No orders yet</p>
            <p className="orders-empty-subtitle">Start browsing our menu and place your first order!</p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="orders-browse-btn"
              type="button"
            >
              Browse Menu <Coffee size={18} />
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="orders-card">
                <div className="orders-card-head">
                  <div className="orders-card-head-group">
                    <div>
                      <p className="orders-label">Order Number</p>
                      <p className="orders-number">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="orders-label">Date</p>
                      <p className="orders-date">{order.date}</p>
                    </div>
                  </div>
                  <span className={getStatusClass(order.status)}>{order.status}</span>
                </div>

                <div className="orders-card-body">
                  <div className="orders-items-list">
                    {order.items.map((item) => (
                      <div key={item.cartId} className="orders-item-row">
                        <div className="orders-item-image-wrap">
                          <OrdersImage src={item.image} alt={item.name} />
                        </div>
                        <div className="orders-item-content">
                          <p className="orders-item-name">{item.name}</p>
                          <p className="orders-item-meta">{item.size} - x{item.quantity}</p>
                        </div>
                        <p className="orders-item-price">₱{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="orders-details-grid">
                    <div>
                      <p className="orders-detail-label">Total Paid</p>
                      <p className="orders-detail-total">₱{order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="orders-detail-label">Payment Method</p>
                      <p className="orders-detail-value orders-detail-payment-value">
                        {getPaymentLabel(order.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <p className="orders-detail-label orders-detail-fulfillment-label">
                        {order.fulfillment === 'pickup' ? <ShoppingBag size={11} /> : <MapPin size={11} />}
                        {order.fulfillment === 'pickup' ? 'Pick Up' : 'Delivery'}
                      </p>
                      <p className="orders-detail-value">
                        {order.fulfillment === 'pickup'
                          ? 'Cafecito Store'
                          : (order.shippingInfo?.address || 'Address not provided').split(',')[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

OrdersPage.propTypes = {
  isAuthenticated: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
};

OrdersPage.defaultProps = {
  isAuthenticated: false,
};

OrdersImage.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string,
};

OrdersImage.defaultProps = {
  alt: 'Product image',
  src: '',
};

export default OrdersPage;

import React from 'react';
import PropTypes from 'prop-types';
import { Clock3, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../../core/contexts/CartContext';
import './OrderProcessingPage.css';

function OrderProcessingPage({ onNavigate }) {
  const { currentOrder, lastOrder } = useCart();
  const activeOrder = currentOrder || lastOrder;

  if (!activeOrder) {
    return (
      <div className="order-page">
        <div className="order-card">
          <h1 className="order-title">No Active Order</h1>
          <p className="order-subtitle">Place an order first to see processing status.</p>
          <button className="order-btn" type="button" onClick={() => onNavigate('dashboard')}>
            Go to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-card">
        <div className="order-status-icon">
          <Clock3 size={40} />
        </div>
        <h1 className="order-title">Order is Being Processed</h1>
        <p className="order-subtitle">Your order has been received and is now in the queue.</p>

        <div className="order-details">
          <div className="order-row">
            <span>Order ID</span>
            <span>{activeOrder.id}</span>
          </div>
          <div className="order-row">
            <span>Order Number</span>
            <span>{activeOrder.orderNumber || 'N/A'}</span>
          </div>
          <div className="order-row">
            <span>Date</span>
            <span>{activeOrder.date || 'N/A'}</span>
          </div>
          <div className="order-row">
            <span>Items</span>
            <span>{activeOrder.items.length}</span>
          </div>
          <div className="order-row">
            <span>Fulfillment</span>
            <span>{activeOrder.fulfillment}</span>
          </div>
          <div className="order-row">
            <span>Status</span>
            <span>{activeOrder.status}</span>
          </div>
          <div className="order-row order-row-total">
            <span>Total Paid</span>
            <span>₱{activeOrder.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="order-success">
          <CheckCircle2 size={18} />
          <span>We sent confirmation details to your contact information.</span>
        </div>

        <button className="order-btn" type="button" onClick={() => onNavigate('dashboard')}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

OrderProcessingPage.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

export default OrderProcessingPage;
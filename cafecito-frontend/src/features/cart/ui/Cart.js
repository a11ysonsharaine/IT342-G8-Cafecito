import React from 'react';
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useCart } from '../../../core/contexts/CartContext';
import './Cart.css';

function Cart({ onNavigate, onBack }) {
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, cartCount, cartTotal } = useCart();
  const discount = cartTotal >= 1000 ? 100 : 0;
  const deliveryFee = 50;
  const finalTotal = Math.max(0, cartTotal - discount + deliveryFee);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-wrapper">
          <button
            onClick={() => onNavigate('dashboard')}
            className="cart-back"
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="cart-title">Shopping Cart</h1>

          <div className="cart-empty">
            <ShoppingCart size={48} className="cart-empty-icon" />
            <p className="cart-empty-text">Your cart is empty</p>
            <p className="cart-empty-subtext">
              Start adding your favorite drinks to get started
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="cart-empty-btn"
              type="button"
            >
              <ShoppingCart size={16} /> Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-wrapper">
        <button
          onClick={() => onNavigate('dashboard')}
          className="cart-back"
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="cart-title">Shopping Cart</h1>

        <div className="cart-container">
          {/* Cart Items */}
          <div className="cart-list">
            {cartItems.map((item) => (
              <div key={item.cartId} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-content">
                  <div className="cart-item-header">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-specs">
                      {item.size && <span className="cart-item-spec">{item.size}</span>}
                      {item.sugarLevel && item.sugarLevel !== 'Normal' && (
                        <span className="cart-item-spec">Sugar: {item.sugarLevel}</span>
                      )}
                      {item.milkType && item.milkType !== 'None' && (
                        <span className="cart-item-spec">{item.milkType}</span>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-footer">
                    <div className="cart-quantity-controls">
                      <button
                        onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                        className="cart-qty-button"
                        type="button"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-qty-display">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.cartId, Math.min(10, item.quantity + 1))}
                        className="cart-qty-button"
                        type="button"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="cart-item-price">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="cart-item-remove"
                      type="button"
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>

            <div className="cart-summary-row">
              <span>Subtotal ({cartCount} items)</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Discount</span>
              <span>{discount > 0 ? `-₱${discount.toFixed(2)}` : '₱0.00'}</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span>₱50.00</span>
            </div>

            <div className="cart-summary-total">
              <span className="cart-summary-total-label">Total</span>
              <span className="cart-summary-total-price">
                ₱{finalTotal.toFixed(2)}
              </span>
            </div>

            <div className="cart-actions">
              <button
                className="cart-checkout-btn"
                type="button"
                onClick={() => onNavigate('checkout', { discount })}
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="cart-continue-shopping-btn"
                type="button"
              >
                Continue Shopping
              </button>
              <button
                onClick={clearCart}
                className="cart-clear-btn"
                type="button"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Cart.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default Cart;

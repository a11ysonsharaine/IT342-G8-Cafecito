import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../../../core/contexts/CartContext';
import './CheckoutPage.css';

function CheckoutPage({ onNavigate, isAuthenticated, user, discount }) {
  const { cartItems, cartTotal, placeOrder } = useCart();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [fulfillment, setFulfillment] = useState('delivery');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    if (cartItems.length === 0) {
      onNavigate('cart');
    }
  }, [cartItems.length, isAuthenticated, onNavigate]);

  const deliveryFee = fulfillment === 'delivery' ? 1.5 : 0;
  const finalTotal = useMemo(
    () => Math.max(0, cartTotal - Number(discount || 0) + deliveryFee),
    [cartTotal, deliveryFee, discount]
  );

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) nextErrors.email = 'A valid email is required';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    if (fulfillment === 'delivery' && !form.address.trim()) nextErrors.address = 'Address is required';
    return nextErrors;
  };

  const isFormValid = () => Object.keys(validate()).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setSubmitted(true);

    placeOrder({
      shippingInfo: form,
      paymentMethod,
      discount,
      fulfillment,
    });

    onNavigate('order-processing');
  };

  return (
    <div className="checkout-page">
      <div className="checkout-wrapper">
        <button className="checkout-back" type="button" onClick={() => onNavigate('cart')}>
          <ArrowLeft size={16} /> Back to Cart
        </button>

        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2 className="checkout-section-title">Shipping Information</h2>

            <label className="checkout-label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              className="checkout-input"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            />
            {errors.fullName && <p className="checkout-error">{errors.fullName}</p>}

            <label className="checkout-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="checkout-input"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            {errors.email && <p className="checkout-error">{errors.email}</p>}

            <label className="checkout-label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              className="checkout-input"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            {errors.phone && <p className="checkout-error">{errors.phone}</p>}

            <div className="checkout-row">
              <button
                type="button"
                className={`checkout-chip ${fulfillment === 'delivery' ? 'active' : ''}`}
                onClick={() => setFulfillment('delivery')}
              >
                Delivery
              </button>
              <button
                type="button"
                className={`checkout-chip ${fulfillment === 'pickup' ? 'active' : ''}`}
                onClick={() => setFulfillment('pickup')}
              >
                Pickup
              </button>
            </div>

            {fulfillment === 'delivery' && (
              <>
                <label className="checkout-label" htmlFor="address">Address</label>
                <textarea
                  id="address"
                  className="checkout-input checkout-textarea"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                />
                {errors.address && <p className="checkout-error">{errors.address}</p>}
              </>
            )}

            <label className="checkout-label" htmlFor="notes">Order Notes (Optional)</label>
            <textarea
              id="notes"
              className="checkout-input checkout-textarea"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />

            <h2 className="checkout-section-title">Payment Method</h2>
            <div className="checkout-row">
              <button
                type="button"
                className={`checkout-chip ${paymentMethod === 'cash-on-delivery' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash-on-delivery')}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                className={`checkout-chip ${paymentMethod === 'gcash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('gcash')}
              >
                GCash
              </button>
            </div>

            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="checkout-submit"
            >
              <Lock size={16} />
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            {submitted && !loading && (
              <p className="checkout-note">Order submitted. Redirecting to processing page...</p>
            )}
          </form>

          <aside className="checkout-summary">
            <h2 className="checkout-section-title">Order Summary</h2>
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Discount</span>
              <span>{discount > 0 ? `-₱${Number(discount).toFixed(2)}` : '₱0.00'}</span>
            </div>
            <div className="checkout-summary-row">
              <span>{fulfillment === 'delivery' ? 'Delivery Fee' : 'Pickup Fee'}</span>
              <span>₱{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="checkout-summary-total">
              <span>Total</span>
              <span>₱{finalTotal.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

CheckoutPage.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
  }),
  discount: PropTypes.number,
};

CheckoutPage.defaultProps = {
  isAuthenticated: false,
  user: null,
  discount: 0,
};

export default CheckoutPage;
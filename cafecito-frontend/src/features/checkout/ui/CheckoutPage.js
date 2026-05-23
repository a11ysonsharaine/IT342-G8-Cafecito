import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Lock,
  MapPin,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { useCart } from '../../../core/contexts/CartContext';
import './CheckoutPage.css';

function SummaryImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="checkout-item-image-fallback">☕</div>;
  }

  return <img src={src} alt={alt} className="checkout-item-image" onError={() => setFailed(true)} />;
}

function CheckoutPage({ onNavigate, isAuthenticated, user, discount }) {
  const { cartItems, cartTotal, placeOrder } = useCart();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [fulfillment, setFulfillment] = useState('delivery');
  const [gcashPaidConfirmed, setGcashPaidConfirmed] = useState(false);
  const [gcashReference, setGcashReference] = useState('');
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

  const deliveryFee = fulfillment === 'delivery' ? 20 : 0;
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setSubmitted(true);

    setSubmitError('');

    try {
      await placeOrder({
        shippingInfo: form,
        paymentMethod,
        discount,
        fulfillment,
      });

      onNavigate('order-processing');
    } catch (error) {
      setSubmitError(error?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  const paymentOptions = [
    {
      value: 'gcash',
      label: 'GCash',
      description: 'Pay via GCash wallet',
      icon: Smartphone,
    },
    {
      value: 'cash-on-delivery',
      label: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: Banknote,
    },
  ];

  const isGcashPayment = paymentMethod === 'gcash';
  return (
    <div className="checkout-page">
      <div className="checkout-wrapper checkout-page-wrapper">
        <button className="checkout-back" type="button" onClick={() => onNavigate('cart')}>
          <ArrowLeft size={16} /> Back to Cart
        </button>

        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Complete your order details below</p>

        <form onSubmit={handleSubmit}>
          <div className="checkout-grid">
            <div className="checkout-form-column">
              <section className="checkout-card">
                <h2 className="checkout-section-title"><span className="checkout-step-badge">1</span>{' '}<span>How would you like to receive your order?</span></h2>

                <div className="checkout-fulfillment-grid">
                  <button
                    type="button"
                    className={`checkout-fulfillment-option ${fulfillment === 'delivery' ? 'active' : ''}`}
                    onClick={() => setFulfillment('delivery')}
                  >
                    <span className="checkout-fulfillment-icon"><MapPin size={22} /></span>
                    <span className="checkout-fulfillment-title">Delivery</span>
                    <span className="checkout-fulfillment-copy">Delivered to your door</span>
                    <span className="checkout-radio-shell">
                      {fulfillment === 'delivery' && <span className="checkout-radio-dot" />}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`checkout-fulfillment-option ${fulfillment === 'pickup' ? 'active' : ''}`}
                    onClick={() => setFulfillment('pickup')}
                  >
                    <span className="checkout-fulfillment-icon"><ShoppingBag size={22} /></span>
                    <span className="checkout-fulfillment-title">Pick Up</span>
                    <span className="checkout-fulfillment-copy">Collect at our store</span>
                    <span className="checkout-radio-shell">
                      {fulfillment === 'pickup' && <span className="checkout-radio-dot" />}
                    </span>
                  </button>
                </div>

                {fulfillment === 'pickup' && (
                  <div className="checkout-pickup-note">
                    <MapPin size={15} />
                    <div>
                      <p className="checkout-pickup-note-title">Cafecito Store</p>
                      <p className="checkout-pickup-note-copy">123 Street, Basak Cebu, City - Open 7AM-9PM</p>
                    </div>
                  </div>
                )}
              </section>

              <section className="checkout-card">
                <h2 className="checkout-section-title">
                  <span className="checkout-step-badge">2</span>
                  {fulfillment === 'delivery' ? 'Shipping Information' : 'Contact Information'}
                </h2>

                <div className="checkout-fields-grid">
                  <div>
                    <label className="checkout-label" htmlFor="fullName">
                      Full Name <span className="checkout-required">*</span>
                    </label>
                    <input
                      id="fullName"
                      className={`checkout-input ${errors.fullName ? 'checkout-input-error' : ''}`}
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Maria Santos"
                    />
                    {errors.fullName && (
                      <p className="checkout-error">
                        <AlertCircle size={11} /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="checkout-label" htmlFor="email">
                      Email Address <span className="checkout-required">*</span>
                    </label>
                    <input
                      id="email"
                      className={`checkout-input ${errors.email ? 'checkout-input-error' : ''}`}
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="checkout-error">
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="checkout-label" htmlFor="phone">
                      Phone Number <span className="checkout-required">*</span>
                    </label>
                    <input
                      id="phone"
                      className={`checkout-input ${errors.phone ? 'checkout-input-error' : ''}`}
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                    />
                    {errors.phone && (
                      <p className="checkout-error">
                        <AlertCircle size={11} /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {fulfillment === 'delivery' && (
                    <div className="checkout-field-full">
                      <label className="checkout-label" htmlFor="address">
                        Delivery Address <span className="checkout-required">*</span>
                      </label>
                      <input
                        id="address"
                        className={`checkout-input ${errors.address ? 'checkout-input-error' : ''}`}
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="123 Street, Barangay, City, Province"
                      />
                      {errors.address && (
                        <p className="checkout-error">
                          <AlertCircle size={11} /> {errors.address}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="checkout-field-full">
                    <label className="checkout-label" htmlFor="notes">
                      Notes <span className="checkout-muted">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      className="checkout-input checkout-textarea"
                      value={form.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder={
                        fulfillment === 'delivery'
                          ? 'Special delivery instructions, gate code, etc.'
                          : 'Any special requests for your order?'
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              <section className="checkout-card">
                <h2 className="checkout-section-title"><span className="checkout-step-badge">3</span>{' '}<span>Payment Method</span></h2>

                <div className="checkout-payment-list">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const active = paymentMethod === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`checkout-payment-option ${active ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(option.value)}
                      >
                        <span className="checkout-payment-icon"><Icon size={20} /></span>
                        <span className="checkout-payment-content">
                          <span className="checkout-payment-title">{option.label}</span>
                          <span className="checkout-payment-copy">{option.description}</span>
                        </span>
                        <span className="checkout-radio-shell">{active && <span className="checkout-radio-dot" />}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {isGcashPayment && (
                <section className="checkout-card checkout-gcash-card">
                  <h2 className="checkout-section-title">
                    <span className="checkout-step-badge">4</span>
                    <span>Pay with GCash first</span>
                  </h2>
                  <div className="checkout-gcash-content">
                    <div className="checkout-gcash-copy">
                      <p className="checkout-gcash-label">GCash QR Payment</p>
                      <h3 className="checkout-gcash-title">Scan before placing your order</h3>
                      <p className="checkout-gcash-text">
                        Open GCash, scan the QR code below, pay the exact total, then confirm below so we can process your order.
                      </p>
                      <div className="checkout-gcash-note">
                        <strong>Total to pay:</strong> ₱{finalTotal.toFixed(2)}
                      </div>
                    </div>
                    <div className="checkout-gcash-qr-wrap">
                      <img
                        src="/images/gcash-qr.png"
                        alt="GCash QR Code"
                        className="checkout-gcash-qr-image"
                      />
                    </div>
                  </div>

                  <div className="checkout-gcash-confirm">
                    <label className="checkout-gcash-checkbox">
                      <input
                        type="checkbox"
                        checked={gcashPaidConfirmed}
                        onChange={(e) => setGcashPaidConfirmed(e.target.checked)}
                      />
                      <span>I already paid using GCash</span>
                    </label>
                    <div>
                      <label className="checkout-label" htmlFor="gcashReference">
                        GCash reference number <span className="checkout-muted">(optional)</span>
                      </label>
                      <input
                        id="gcashReference"
                        className="checkout-input"
                        value={gcashReference}
                        onChange={(e) => setGcashReference(e.target.value)}
                        placeholder="Enter payment reference"
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>

            <aside className="checkout-summary sticky">
              <h2 className="checkout-section-title"><span className="checkout-step-badge">4</span>{' '}<span>Order Summary</span></h2>

              <div className="checkout-items-list">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="checkout-item-row">
                    <div className="checkout-item-image-wrap">
                      <SummaryImage src={item.image} alt={item.name} />
                    </div>
                    <div className="checkout-item-content">
                      <p className="checkout-item-name">{item.name}</p>
                      <p className="checkout-item-meta">{item.size} x {item.quantity}</p>
                    </div>
                    <p className="checkout-item-price">₱{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-breakdown">
                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <span>₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>{fulfillment === 'delivery' ? 'Delivery Fee' : 'Pick Up'}</span>
                  <span className={fulfillment === 'pickup' ? 'checkout-free' : ''}>
                    {fulfillment === 'pickup' ? 'FREE' : `₱${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {Number(discount) > 0 && (
                  <div className="checkout-summary-row checkout-discount-row">
                    <span>Discount</span>
                    <span>-₱{Number(discount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="checkout-summary-total">
                <span>Total</span>
                <span>₱{finalTotal.toFixed(2)}</span>
              </div>

              {submitError && (
                <p className="checkout-error" role="alert">
                  <AlertCircle size={11} /> {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={!isFormValid() || loading || (isGcashPayment && !gcashPaidConfirmed)}
                className="checkout-submit"
              >
                <Lock size={16} />
                {loading ? 'Processing...' : isGcashPayment ? 'I Paid, Place Order' : 'Place Order'}
              </button>

              <p className="checkout-secure-note">
                <Lock size={11} /> Your information is secure
              </p>

              {isGcashPayment && !gcashPaidConfirmed && (
                <p className="checkout-note">Please pay with GCash first, then confirm the checkbox to continue.</p>
              )}

              {submitted && !loading && (
                <p className="checkout-note">Order submitted. Redirecting to processing page...</p>
              )}
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

SummaryImage.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string,
};

SummaryImage.defaultProps = {
  alt: 'Product image',
  src: '',
};

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
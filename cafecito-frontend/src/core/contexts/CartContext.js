import React, { createContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Cart Item structure with deduplication support
 */
export const CartContext = createContext();
const CART_STORAGE_KEY = 'cafecito_cart_items_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  /**
   * Add item to cart with smart deduplication
   * If identical item (product + size + sugar + milk) exists, increase quantity
   * Otherwise, create new cart entry with unique cartId
   */
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      // Check if identical item already exists in cart
      const existing = prev.find(
        (ci) =>
          ci.productId === item.productId &&
          ci.size === item.size &&
          ci.sugarLevel === item.sugarLevel &&
          ci.milkType === item.milkType
      );

      // If exists, just increase quantity
      if (existing) {
        return prev.map((ci) =>
          ci.cartId === existing.cartId
            ? { ...ci, quantity: ci.quantity + (item.quantity || 1) }
            : ci
        );
      }

      // If new, generate unique cartId and add to cart
      const cartId = `${item.productId}-${item.size}-${item.sugarLevel}-${item.milkType}-${Date.now()}`;
      return [...prev, { ...item, cartId }];
    });
  }, []);

  /**
   * Remove item from cart by cartId
   */
  const removeFromCart = useCallback((cartId) => {
    setCartItems((prev) => prev.filter((ci) => ci.cartId !== cartId));
  }, []);

  /**
   * Update quantity for a specific cart item
   */
  const updateCartQuantity = useCallback((cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.cartId === cartId ? { ...ci, quantity } : ci
      )
    );
  }, [removeFromCart]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Place order and persist a lightweight order snapshot for the processing page
   */
  const placeOrder = useCallback((data) => {
    // 1) Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Number(data?.discount || 0);
    const fulfillment = data?.fulfillment || 'delivery';
    const deliveryFee = fulfillment === 'delivery' ? 1.5 : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);

    // 2) Create complete order object
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `CAF-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      date: new Date().toISOString().split('T')[0],
      items: [...cartItems],
      subtotal,
      deliveryFee,
      discount,
      total,
      fulfillment,
      status: 'Preparing',
      paymentMethod: data?.paymentMethod || 'cash-on-delivery',
      shippingInfo: data?.shippingInfo || {},
    };

    // 3) Update state for confirmation/history flows
    setCurrentOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    clearCart();
    return newOrder;
  }, [cartItems, clearCart]);

  /**
   * Calculate cart count (total items)
   */
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * Calculate cart total (sum of price * quantity)
   */
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    placeOrder,
    currentOrder,
    orders,
    lastOrder,
    cartCount,
    cartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to use cart context
 */
export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

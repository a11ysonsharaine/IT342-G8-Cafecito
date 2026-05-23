import React, { createContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { ApiService } from '../base/apiService';
import { TokenUtil } from '../utils/tokenUtil';

/**
 * Cart Item structure with deduplication support
 */
export const CartContext = createContext();
const CART_STORAGE_KEY = 'cafecito_cart_items_v1';

const mapBackendCartItem = (item) => ({
  cartId: String(item.id),
  productId: item.productId,
  name: item.productName,
  image: item.imageUrl || '',
  size: item.size || 'Regular',
  sugarLevel: item.sugarLevel || 'Normal',
  milkType: item.milkType || 'None',
  quantity: Number(item.quantity || 1),
  price: Number(item.priceCents || 0) / 100,
});

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
      console.warn('Failed to parse cart from storage', error);
      return [];
    }
  });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const guestCartSnapshotRef = useRef(null);

  const loadBackendCart = useCallback(async () => {
    if (!TokenUtil.isAuthenticated()) {
      return false;
    }

    try {
      const { response, data } = await ApiService.getCart();

      if (!response.ok) {
        return false;
      }

      const backendItems = Array.isArray(data) ? data.map(mapBackendCartItem) : [];
      setCartItems(backendItems);
      return true;
    } catch (error) {
      console.warn('Failed to load cart from backend', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (TokenUtil.isAuthenticated()) {
      if (guestCartSnapshotRef.current === null) {
        guestCartSnapshotRef.current = cartItems;
      }
      loadBackendCart().catch((error) => {
        console.warn('Failed to refresh cart after auth change', error);
      });
    }

    const handleAuthChange = () => {
      if (TokenUtil.isAuthenticated()) {
        if (guestCartSnapshotRef.current === null) {
          guestCartSnapshotRef.current = cartItems;
        }
        loadBackendCart().catch((error) => {
          console.warn('Failed to refresh cart after auth token change', error);
        });
      } else {
        const guestSnapshotExists = guestCartSnapshotRef.current !== null;
        if (guestSnapshotExists) {
          setCartItems(guestCartSnapshotRef.current);
        } else {
          setCartItems([]);
        }
      }
    };

    window.addEventListener('cafecito:auth-token-changed', handleAuthChange);

    return () => {
      window.removeEventListener('cafecito:auth-token-changed', handleAuthChange);
    };
  }, [cartItems, loadBackendCart]);

  const applyLocalAddToCart = useCallback((item) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (ci) =>
          ci.productId === item.productId
          && ci.size === item.size
          && ci.sugarLevel === item.sugarLevel
          && ci.milkType === item.milkType
      );

      if (existing) {
        return prev.map((ci) => (
          ci.cartId === existing.cartId
            ? { ...ci, quantity: ci.quantity + (item.quantity || 1) }
            : ci
        ));
      }

      const cartId = `${item.productId}-${item.size}-${item.sugarLevel}-${item.milkType}-${Date.now()}`;
      return [...prev, { ...item, cartId }];
    });
  }, []);

  const applyLocalQuantityUpdate = useCallback((cartId, quantity) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((ci) => ci.cartId !== cartId));
      return;
    }

    setCartItems((prev) => prev.map((ci) => (
      ci.cartId === cartId ? { ...ci, quantity } : ci
    )));
  }, []);

  /**
   * Add item to cart with smart deduplication
   * If identical item (product + size + sugar + milk) exists, increase quantity
   * Otherwise, create new cart entry with unique cartId
   */
  const addToCart = useCallback(async (item) => {
    if (TokenUtil.isAuthenticated()) {
      try {
        const { response, data } = await ApiService.addToCart({
          productId: item.productId,
          quantity: item.quantity || 1,
          size: item.size,
          sugarLevel: item.sugarLevel,
          milkType: item.milkType,
        });

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to add item to cart');
        }

        await loadBackendCart();
        return;
      } catch (error) {
        console.warn('Backend addToCart failed, falling back to local cart', error);
        applyLocalAddToCart(item);
        return;
      }
    }

    applyLocalAddToCart(item);
  }, [applyLocalAddToCart, loadBackendCart]);

  /**
   * Remove item from cart by cartId
   */
  const removeFromCart = useCallback(async (cartId) => {
    if (TokenUtil.isAuthenticated()) {
      try {
        const { response } = await ApiService.removeFromCart(cartId);
        if (!response.ok) {
          throw new Error('Failed to remove item from cart');
        }

        await loadBackendCart();
        return;
      } catch (error) {
        console.warn('Backend removeFromCart failed, falling back to local cart', error);
        setCartItems((prev) => prev.filter((ci) => ci.cartId !== cartId));
        return;
      }
    }

    setCartItems((prev) => prev.filter((ci) => ci.cartId !== cartId));
  }, [loadBackendCart]);

  /**
   * Update quantity for a specific cart item
   */
  const updateCartQuantity = useCallback(async (cartId, quantity) => {
    if (TokenUtil.isAuthenticated()) {
      try {
        const { response } = await ApiService.updateCartQuantity(cartId, quantity);
        if (!response.ok) {
          throw new Error('Failed to update cart quantity');
        }

        await loadBackendCart();
        return;
      } catch (error) {
        console.warn('Backend updateCartQuantity failed, falling back to local cart', error);
        applyLocalQuantityUpdate(cartId, quantity);
        return;
      }
    }

    applyLocalQuantityUpdate(cartId, quantity);
  }, [applyLocalQuantityUpdate, loadBackendCart]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    if (TokenUtil.isAuthenticated()) {
      try {
        const { response } = await ApiService.clearCart();
        if (!response.ok) {
          throw new Error('Failed to clear cart');
        }

        await loadBackendCart();
        return;
      } catch (error) {
        console.warn('Backend clearCart failed, clearing local cart', error);
        setCartItems([]);
        return;
      }
    }

    setCartItems([]);
  }, [loadBackendCart]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Place order and persist a lightweight order snapshot for the processing page
   */
  const placeOrder = useCallback(async (data) => {
    const fulfillment = data?.fulfillment || 'delivery';
    const paymentMethod = data?.paymentMethod || 'cash-on-delivery';
    const discountCents = Math.max(0, Number(data?.discount || 0));

    const payload = {
      fulfillment,
      paymentMethod,
      discountCents,
      shippingInfo: data?.shippingInfo || {},
      items: cartItems.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        size: ci.size,
        sugarLevel: ci.sugarLevel,
        milkType: ci.milkType,
      })),
    };

    const { response, data: apiOrder } = await ApiService.placeOrder(payload);
    if (!response.ok || !apiOrder?.id) {
      const message = apiOrder?.message || apiOrder?.error || `Order failed (${response.status})`;
      throw new Error(message);
    }

    // Map backend response -> existing UI order shape
    const createdAt = apiOrder?.createdAt || new Date().toISOString();
    const date = String(createdAt).split('T')[0];

    const normalizeApiOrderItem = (it) => {
      const productId = it?.productId ?? it?.product_id ?? it?.productID ?? null;
      const unitPriceCents = it?.unitPriceCents ?? it?.unit_price_cents ?? it?.unit_price ?? it?.unitPrice ?? 0;
      const productName = it?.productName ?? it?.product_name ?? it?.name ?? '';
      const productImageUrl = it?.productImageUrl ?? it?.product_image_url ?? it?.imageUrl ?? it?.image ?? '';
      const quantity = it?.quantity ?? it?.qty ?? 0;
      const size = it?.size ?? 'Regular';
      const sugarLevel = it?.sugarLevel ?? it?.sugar_level ?? 'Normal';
      const milkType = it?.milkType ?? it?.milk_type ?? 'None';

      return {
        cartId: it?.id ?? `${productId || 'item'}-${Date.now()}`,
        productId,
        name: productName,
        image: productImageUrl,
        size,
        sugarLevel,
        milkType,
        quantity: Number(quantity ?? 0),
        price: Number(unitPriceCents ?? 0),
      };
    };

    const apiItems = Array.isArray(apiOrder.items) ? apiOrder.items : null;
    const mappedFromApi = apiItems ? apiItems.map(normalizeApiOrderItem) : null;

    const mappedItems = mappedFromApi
      ? mappedFromApi.map((item) => {
        // If the backend response is missing item snapshots (or returns zeros),
        // hydrate from the cart item that produced this order.
        const match = cartItems.find((ci) => {
          const sameOptions =
            String(ci.size || 'Regular') === String(item.size || 'Regular')
            && String(ci.sugarLevel || 'Normal') === String(item.sugarLevel || 'Normal')
            && String(ci.milkType || 'None') === String(item.milkType || 'None');

          if (!sameOptions) return false;

          if (item.productId != null) {
            return String(ci.productId) === String(item.productId);
          }

          // Fallback match when productId is absent
          return (ci.name || '') === (item.name || '');
        });

        const quantity = item.quantity > 0 ? item.quantity : Number(match?.quantity ?? 1);
        const price = item.price > 0 ? item.price : Number(match?.price ?? 0);
        const name = item.name || match?.name || '';
        const image = item.image || match?.image || '';

        return {
          ...item,
          quantity,
          price,
          name,
          image,
        };
      })
      : null;

    const shouldFallbackToCart =
      !mappedItems
      || mappedItems.every((it) => !it.name && (!it.price || it.price <= 0));

    const finalItems = shouldFallbackToCart ? [...cartItems] : mappedItems;

    const newOrder = {
      id: apiOrder.id,
      orderNumber: apiOrder.orderNumber,
      date,
      items: finalItems,
      subtotal: apiOrder.subtotalCents,
      deliveryFee: apiOrder.deliveryFeeCents,
      discount: apiOrder.discountCents,
      total: apiOrder.totalCents,
      fulfillment: apiOrder.fulfillment,
      status: apiOrder.status,
      paymentMethod: apiOrder.paymentMethod,
      shippingInfo: apiOrder.shippingInfo || payload.shippingInfo,
      _api: apiOrder,
    };

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

  const value = useMemo(() => ({
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
  }), [
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
  ]);

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

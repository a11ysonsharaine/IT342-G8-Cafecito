import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  ArrowLeft,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { TokenUtil } from '../../../core/utils/tokenUtil';
import { useCart } from '../../../core/contexts/CartContext';
import './ProductDetailsPage.css';

const defaultSizes = (basePrice) => [
  { label: 'Small', price: Math.max(120, basePrice - 20) },
  { label: 'Regular', price: basePrice },
  { label: 'Large', price: basePrice + 30 },
];

const defaultSugarLevels = ['0%', '25%', '50%', '75%', '100%'];
const defaultMilkTypes = ['Whole Milk', 'Oat Milk', 'Soy Milk'];

function ProductDetailsPage({
  isAuthenticated,
  product,
  onBack,
  onNavigate,
  onAddToCart,
}) {
  const { addToCart } = useCart();

  const normalizedProduct = useMemo(() => {
    if (!product) {
      return null;
    }

    return {
      ...product,
      thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : [product.image],
      tags: Array.isArray(product.tags) ? product.tags : [],
      sizes: Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : defaultSizes(product.price),
      sugarLevels: Array.isArray(product.sugarLevels) && product.sugarLevels.length > 0
        ? product.sugarLevels
        : defaultSugarLevels,
      milkTypes: Array.isArray(product.milkTypes) && product.milkTypes.length > 0
        ? product.milkTypes
        : defaultMilkTypes,
      rating: product.rating || 4.8,
    };
  }, [product]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState('');
  const [selectedMilk, setSelectedMilk] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!TokenUtil.isAuthenticated() || !isAuthenticated) {
      onNavigate('home');
    }
  }, [isAuthenticated, onNavigate]);

  useEffect(() => {
    if (!normalizedProduct) {
      return;
    }
    setSelectedSize(normalizedProduct.sizes[1] || normalizedProduct.sizes[0]);
    setSelectedSugar(normalizedProduct.sugarLevels[2] || normalizedProduct.sugarLevels[0]);
    setSelectedMilk(normalizedProduct.milkTypes[0]);
    setQuantity(1);
    setActiveThumb(0);
  }, [normalizedProduct]);

  if (!normalizedProduct) {
    return (
      <div className="product-details-page product-details-center">
        <div className="product-not-found">
          <h2>Product Not Found</h2>
          <button onClick={onBack} className="product-back-btn">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const allImages = [
    normalizedProduct.image,
    ...normalizedProduct.thumbnails.filter((thumb) => thumb !== normalizedProduct.image),
  ];

  const currentImage = allImages[activeThumb] || normalizedProduct.image;
  const currentPrice = (selectedSize?.price ?? normalizedProduct.price) * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      productId: normalizedProduct.id,
      name: normalizedProduct.name,
      image: normalizedProduct.image,
      size: selectedSize?.label || 'Regular',
      sugarLevel: selectedSugar || 'Normal',
      milkType: selectedMilk || 'None',
      quantity,
      price: selectedSize?.price || normalizedProduct.price,
    };

    // Add to cart context
    addToCart(cartItem);

    // Also call the parent callback if provided (for backward compatibility)
    if (onAddToCart) {
      onAddToCart(cartItem);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="product-details-page">
      <div className="product-details-wrapper">
        <div className="product-details-back">
          <button onClick={onBack} className="product-back-link">
            <ArrowLeft size={16} /> Back to Menu
          </button>
          <span>/</span>
          <span>{normalizedProduct.category}</span>
          <span>/</span>
          <span className="product-current-name">{normalizedProduct.name}</span>
        </div>

        <div className="product-details-grid">
          <section className="product-image-section">
            <div className="product-main-image">
              <img src={currentImage} alt={normalizedProduct.name} />
              {normalizedProduct.featured && (
                <span className="product-featured">Featured</span>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="product-thumbnail-grid">
                {allImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    className={`product-thumbnail ${activeThumb === index ? 'active' : ''}`}
                    onClick={() => setActiveThumb(index)}
                  >
                    <img src={img} alt={`${normalizedProduct.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="product-tags">
              <span className="product-category-badge">{normalizedProduct.category}</span>
              {normalizedProduct.tags.map((tag) => (
                <span key={tag} className="product-tag">{tag}</span>
              ))}
            </div>

            <h1 className="product-title">{normalizedProduct.name}</h1>

            <div className="product-price">
              <span>₱{(selectedSize?.price || normalizedProduct.price).toFixed(2)}</span>
              <small>/ {selectedSize?.label || 'item'}</small>
            </div>

            <p className="product-description">{normalizedProduct.description}</p>

            <div className="product-section">
              <h3 className="product-section-title">Size</h3>
              <div className="product-option-grid product-size-grid">
                {normalizedProduct.sizes.map((size) => (
                  <button
                    key={size.label}
                    className={`product-option-button ${selectedSize?.label === size.label ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size.label}
                    <span className="product-option-button-price">₱{size.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {normalizedProduct.sugarLevels[0] !== 'N/A' && (
              <div className="product-section">
                <h3 className="product-section-title">Sugar Level</h3>
                <div className="product-option-grid product-sugar-grid">
                  {normalizedProduct.sugarLevels.map((level) => (
                    <button
                      key={level}
                      className={`product-option-button ${selectedSugar === level ? 'active' : ''}`}
                      onClick={() => setSelectedSugar(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {normalizedProduct.milkTypes[0] !== 'N/A' && (
              <div className="product-section">
                <h3 className="product-section-title">Milk Type</h3>
                <div className="product-option-grid product-milk-grid">
                  {normalizedProduct.milkTypes.map((milk) => (
                    <button
                      key={milk}
                      className={`product-option-button ${selectedMilk === milk ? 'active' : ''}`}
                      onClick={() => setSelectedMilk(milk)}
                    >
                      {milk}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-quantity-section">
              <h3 className="product-section-title">Quantity</h3>
              <div className="product-quantity-controls">
                <button
                  className="product-quantity-button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} />
                </button>
                <span className="product-quantity-display">{quantity}</span>
                <button
                  className="product-quantity-button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                >
                  <Plus size={16} />
                </button>
                <div className="product-total">Total: ₱{currentPrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="product-actions">
              <button
                onClick={handleAddToCart}
                className={`product-add-to-cart-btn ${addedToCart ? 'added' : ''}`}
              >
                {addedToCart ? (
                  <><Check size={20} /> Added to Cart!</>
                ) : (
                  <><ShoppingCart size={20} /> Add to Cart - ₱{currentPrice.toFixed(2)}</>
                )}
              </button>

              <button
                onClick={() => {
                  handleAddToCart();
                  onNavigate('cart');
                }}
                className="product-buy-now-btn"
              >
                Buy Now
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

ProductDetailsPage.propTypes = {
  isAuthenticated: PropTypes.bool,
  onAddToCart: PropTypes.func,
  onBack: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.number,
    featured: PropTypes.bool,
    rating: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    thumbnails: PropTypes.arrayOf(PropTypes.string),
    sizes: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        price: PropTypes.number,
      })
    ),
    sugarLevels: PropTypes.arrayOf(PropTypes.string),
    milkTypes: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default ProductDetailsPage;

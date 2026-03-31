import React, { useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import PropTypes from 'prop-types';
import './ProductCard.css';

export function ProductCard({ product, onAddToCart, onViewProduct }) {
  const [imageError, setImageError] = useState(false);

  const categoryColors = {
    'Hot Coffee': 'product-category-hot',
    'Iced Coffee': 'product-category-iced',
    Pastries: 'product-category-pastry',
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleViewDetails = () => {
    if (onViewProduct) {
      onViewProduct(product.id);
    }
  };

  const rating = Math.round(product.rating || 0);
  const tags = Array.isArray(product.tags) ? product.tags.slice(0, 2) : [];

  return (
    <article className="product-card">
      <div className="product-card-image">
        {imageError ? (
          <div className="product-card-image-fallback">
            <span>🍵</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
          />
        )}

        {product.featured && (
          <span className="product-featured-badge">Featured</span>
        )}

        <span className={`product-category-badge ${categoryColors[product.category] || 'product-category-hot'}`}>
          {product.category}
        </span>
      </div>

      <div className="product-card-content">
        <div className="product-card-header-row">
          <h3 className="product-card-title">{product.name}</h3>
          <span className="product-card-price">₱{product.price.toFixed(2)}</span>
        </div>

        <div className="product-rating-row">
          <div className="product-rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= rating ? 'product-star-filled' : 'product-star-empty'}
              />
            ))}
          </div>
        </div>

        <p className="product-card-description">{product.description}</p>

        {tags.length > 0 && (
          <div className="product-tags-row">
            {tags.map((tag) => (
              <span key={tag} className="product-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="product-actions-row">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="product-view-btn"
          >
            View Details
          </button>

          {onAddToCart && (
            <button
              className="product-card-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  onAddToCart: PropTypes.func,
  onViewProduct: PropTypes.func,
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.number.isRequired,
    featured: PropTypes.bool,
    rating: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

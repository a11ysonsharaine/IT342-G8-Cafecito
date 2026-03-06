import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import './ProductCard.css';

export function ProductCard({ product, onAddToCart }) {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="product-card">
      <div className="product-card-image">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="product-card-image-fallback">
            <span>🍵</span>
          </div>
        )}
      </div>
      <div className="product-card-content">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-footer">
          <span className="product-card-price">₱{product.price.toFixed(2)}</span>
          <button 
            className="product-card-add-btn"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

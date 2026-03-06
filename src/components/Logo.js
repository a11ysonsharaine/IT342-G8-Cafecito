import React from 'react';
import './Logo.css';
import logo from '../logo.png';

function Logo({ showText = true }) {
  return (
    <div className="logo">
      <img src={logo} alt="Cafecito Logo" className="logo-image-icon" />
      {showText && <h1 className="logo-text">Cafecito</h1>}
    </div>
  );
}

export default Logo;

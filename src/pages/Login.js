import React, { useState } from 'react';
import './Login.css';

function Login({ onSwitchToRegister, onSwitchToDashboard }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store token
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        console.log('Login successful!');
        if (onSwitchToDashboard) {
          onSwitchToDashboard();
        } else {
          alert('Login successful!');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <svg className="coffee-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5C22,3.89 21.1,3 20,3Z" />
          </svg>
          <h1 className="logo-text">Cafecito</h1>
        </div>
        
        <p className="welcome-message">Welcome back! Please login to your account.</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button">
            Login
          </button>
          
          <p className="register-link">
            Don't have an account? <a href="#register" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

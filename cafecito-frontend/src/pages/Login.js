import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Login.css';
import logo from '../logo.png';
import { ApiService } from '../utils/apiService';
import { TokenUtil } from '../utils/tokenUtil';

function Login({ onSwitchToRegister, onSwitchToDashboard, successMessage, onClearSuccessMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      const { response, data } = await ApiService.login(email, password);
      
      if (response.ok && data.token) {
        console.log('Login successful!');
        
        // Fetch and store user profile
        try {
          const userProfile = await ApiService.getProfile();
          if (userProfile) {
            TokenUtil.setUserData(userProfile);
          }
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
        }
        
        setLoading(false);
        if (onSwitchToDashboard) {
          onSwitchToDashboard();
        }
      } else {
        setLoading(false);
        setErrors({ general: data.message || 'Invalid email or password. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      setErrors({ general: 'Invalid email or password.' });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo-wrapper">
              <img src={logo} alt="Cafecito logo" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to continue to Cafecito</p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="login-success-banner">
              <CheckCircle2 size={16} className="shrink-0" />
              {successMessage}
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="login-error-banner">
              <AlertCircle size={16} className="shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="login-field">
              <label className="login-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: undefined, general: undefined });
                  if (onClearSuccessMessage) onClearSuccessMessage();
                }}
                placeholder="you@example.com"
                className={`login-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <p className="login-field-error">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined, general: undefined });
                  }}
                  placeholder="Enter your password"
                  className={`login-input ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-toggle-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="login-field-error">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <>
                  <svg className="login-spinner" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">Don't have an account?</span>
            <div className="login-divider-line" />
          </div>

          {/* Register */}
          <button onClick={onSwitchToRegister} className="login-register-btn">
            Create Account
          </button>
        </div>

        {/* Footer Note */}
        <p className="login-footer-note">
          By signing in, you agree to our{' '}
          <span>Terms of Service</span> and{' '}
          <span>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

export default Login;

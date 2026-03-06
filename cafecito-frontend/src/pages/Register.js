import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Register.css';
import logo from '../logo.png';
import { ApiService } from '../utils/apiService';

function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Please enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.confirm) errs.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    
    try {
      const { response, data } = await ApiService.register({
        email: form.email,
        password: form.password,
        name: form.name.trim(),
        phoneNumber: ''
      });
      
      console.log('Registration response:', { response, data });
      
      if (data && data.success) {
        onSwitchToLogin(data.message || 'Account created successfully!');
      } else {
        setLoading(false);
        const msg = data?.message || 'Registration failed';
        if (msg === 'Email already registered') {
          setErrors({ email: msg });
        } else {
          setErrors({ general: msg });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      setErrors({ general: `Error: ${error.message || 'Unable to connect to server. Make sure backend is running.'}` });
    }
  };

  const inputClass = (field) => `register-input${errors[field] ? ' error' : ''}`;

  const getPasswordStrength = () => {
    if (!form.password) return { label: '', css: '', color: '', width: '0%' };
    if (form.password.length < 8)  return { label: 'Weak',   css: 'weak',   color: '#f87171', width: '25%' };
    if (form.password.length < 10)  return { label: 'Fair',   css: 'fair',   color: '#f59e0b', width: '50%' };
    if (form.password.length < 12) return { label: 'Good',   css: 'good',   color: '#C8A27E', width: '75%' };
    return { label: 'Strong', css: 'strong', color: '#22c55e', width: '100%' };
  };
  const strength = getPasswordStrength();

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Card */}
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <div className="register-logo-wrapper">
              <img src={logo} alt="Cafecito logo" />
            </div>
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join thousands of coffee lovers</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Full Name */}
            <div className="register-field">
              <label className="register-label">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Maria Santos"
                className={inputClass('name')}
              />
              {errors.name && (
                <p className="register-field-error">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="register-field">
              <label className="register-label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className={inputClass('email')}
              />
              {errors.email && (
                <p className="register-field-error">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="register-field">
              <label className="register-label">Password</label>
              <div className="register-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  className={inputClass('password')}
                />
                <button
                  type="button"
                  className="register-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="register-field-error">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="register-field">
              <label className="register-label">Confirm Password</label>
              <div className="register-password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => handleChange('confirm', e.target.value)}
                  placeholder="Re-enter your password"
                  className={inputClass('confirm')}
                />
                <button
                  type="button"
                  className="register-toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && (
                <p className="register-field-error">
                  <AlertCircle size={12} /> {errors.confirm}
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="register-field-error" style={{ marginTop: '8px' }}>
                <AlertCircle size={12} /> {errors.general}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="register-submit-btn">
              {loading ? (
                <>
                  <svg className="register-spinner" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="register-divider">
            <div className="register-divider-line" />
            <span className="register-divider-text">Already have an account?</span>
            <div className="register-divider-line" />
          </div>

          {/* Sign In */}
          <button className="register-login-btn" onClick={onSwitchToLogin}>
            Sign In Instead
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;

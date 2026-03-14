import React, { useEffect, useRef, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Edit3,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera
} from 'lucide-react';
import { ApiService } from '../utils/apiService';
import { API_ENDPOINTS } from '../config/constants';
import './ProfilePage.css';

export default function ProfilePage({ isAuthenticated, user, onNavigate, onUserUpdated }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdSaved, setPwdSaved] = useState(false);

  const [photoUrl, setPhotoUrl] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('home');
      return;
    }
    hydrateFromState();
    loadProfile();
    loadPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    hydrateFromState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  const hydrateFromState = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await ApiService.getProfile();
      if (profile) {
        const nextUser = {
          name: profile.name || '',
          email: profile.email || user?.email || '',
          phone: profile.phoneNumber || ''
        };
        setForm(nextUser);
        onUserUpdated(nextUser);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPhoto = async () => {
    try {
      const url = await ApiService.getPhoto();
      if (url) {
        setPhotoUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
    } catch (error) {
      console.error('Photo fetch error:', error);
    }
  };

  const validateProfile = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validateProfile();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const data = await ApiService.put(API_ENDPOINTS.PROFILE.UPDATE, {
        name: form.name.trim(),
        phoneNumber: form.phone.trim()
      });
      if (data && data.success) {
        const nextUser = {
          name: form.name.trim(),
          email: form.email,
          phone: form.phone
        };
        onUserUpdated(nextUser);
        setEditMode(false);
        setErrors({});
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrors({ form: data?.message || 'Failed to update profile' });
      }
    } catch (error) {
      setErrors({ form: 'Failed to update profile' });
      console.error('Profile update error:', error);
    }
  };

  const handleCancel = () => {
    hydrateFromState();
    setErrors({});
    setEditMode(false);
  };

  const validatePassword = () => {
    const nextErrors = {};
    if (!passwords.current) nextErrors.current = 'Current password is required';
    if (!passwords.next) nextErrors.next = 'New password is required';
    else if (passwords.next.length < 8) nextErrors.next = 'Min. 8 characters';
    if (passwords.next !== passwords.confirm) nextErrors.confirm = 'Passwords do not match';
    return nextErrors;
  };

  const handlePasswordSave = async () => {
    const nextErrors = validatePassword();
    if (Object.keys(nextErrors).length > 0) {
      setPwdErrors(nextErrors);
      return;
    }

    try {
      const data = await ApiService.put(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, {
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      if (data && data.success) {
        setPwdSaved(true);
        setPasswords({ current: '', next: '', confirm: '' });
        setShowPasswordForm(false);
        setPwdErrors({});
        setTimeout(() => setPwdSaved(false), 3000);
      } else {
        setPwdErrors({ form: data?.message || 'Failed to change password' });
      }
    } catch (error) {
      setPwdErrors({ form: 'Failed to change password' });
      console.error('Change password error:', error);
    }
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoBusy(true);
    try {
      const response = await ApiService.uploadPhoto(file);
      if (response?.success) {
        await loadPhoto();
      } else {
        setErrors({ form: response?.message || 'Failed to upload photo' });
      }
    } catch (error) {
      setErrors({ form: 'Failed to upload photo' });
      console.error('Photo upload error:', error);
    } finally {
      setPhotoBusy(false);
      event.target.value = '';
    }
  };

  const initial = (form.name || user?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button onClick={() => onNavigate('dashboard')} className="profile-back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="profile-title">My Profile</h1>

        {(saved || pwdSaved) && (
          <div className="profile-toast success">
            <CheckCircle2 size={16} />
            {saved ? 'Profile updated successfully!' : 'Password changed successfully!'}
          </div>
        )}

        {(errors.form || pwdErrors.form) && (
          <div className="profile-toast error">
            <AlertCircle size={16} />
            {errors.form || pwdErrors.form}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="profile-avatar-img" />
              ) : (
                <span className="profile-avatar-letter">{initial}</span>
              )}
            </div>
            <div className="profile-hero-text">
              <h2>{form.name || 'Guest'}</h2>
              <p>{form.email || 'No email'}</p>
            </div>
            <button className="profile-camera-btn" onClick={handlePhotoClick} disabled={photoBusy}>
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="profile-content">
            <div className="profile-section-head">
              <h3>Personal Information</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="outline-btn small">
                  <Edit3 size={14} /> Edit Profile
                </button>
              ) : (
                <div className="profile-actions-inline">
                  <button onClick={handleCancel} className="muted-btn small">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={handleSave} className="primary-btn small" disabled={loading}>
                    <Check size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            <div className="profile-grid">
              <div>
                <label><User size={13} /> Full Name</label>
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setForm((prev) => ({ ...prev, name: nextValue }));
                        setErrors((prev) => {
                          const nextErrors = { ...prev };
                          delete nextErrors.name;
                          return nextErrors;
                        });
                      }}
                      className={`profile-input ${errors.name ? 'invalid' : ''}`}
                    />
                    {errors.name && <p className="field-error"><AlertCircle size={11} /> {errors.name}</p>}
                  </>
                ) : (
                  <p className="field-value">{form.name || '-'}</p>
                )}
              </div>

              <div>
                <label><Mail size={13} /> Email Address</label>
                <p className="field-value">{form.email || '-'}</p>
              </div>

              <div>
                <label><Phone size={13} /> Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +63 912 345 6789"
                    className="profile-input"
                  />
                ) : (
                  <p className="field-value">{form.phone || <span className="field-empty">Not provided</span>}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card password-card">
          <div className="profile-section-head">
            <div>
              <h3>Security</h3>
              <p className="card-subtitle">Manage your account password</p>
            </div>
          </div>

          {!showPasswordForm ? (
            <button onClick={() => setShowPasswordForm(true)} className="outline-btn">
              <Edit3 size={14} /> Change Password
            </button>
          ) : (
            <div className="password-form">
              {['current', 'next', 'confirm'].map((field) => (
                <div key={field}>
                  <label>
                    {field === 'current' ? 'Current Password' : field === 'next' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <div className="password-input-wrap">
                    <input
                      type={showPwd[field] ? 'text' : 'password'}
                      value={passwords[field]}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setPasswords((prev) => ({ ...prev, [field]: nextValue }));
                        setPwdErrors((prev) => {
                          const nextErrors = { ...prev };
                          delete nextErrors[field];
                          return nextErrors;
                        });
                      }}
                      placeholder="********"
                      className={`profile-input ${pwdErrors[field] ? 'invalid' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }))}
                      className="password-toggle"
                    >
                      {showPwd[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwdErrors[field] && <p className="field-error"><AlertCircle size={11} /> {pwdErrors[field]}</p>}
                </div>
              ))}

              <div className="password-actions">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswords({ current: '', next: '', confirm: '' });
                    setPwdErrors({});
                  }}
                  className="muted-btn"
                >
                  Cancel
                </button>
                <button onClick={handlePasswordSave} className="primary-btn">
                  Save Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

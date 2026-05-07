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
  Camera,
} from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage({
  isAuthenticated,
  user,
  onBack,
  onUpdateProfile,
  onChangePassword,
  onUploadPhoto,
  onLoadPhoto,
}) {
  const fileInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdSaved, setPwdSaved] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && onBack) {
      onBack();
    }
  }, [isAuthenticated, onBack]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
      });
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const loadPhoto = async () => {
      if (!onLoadPhoto || !isAuthenticated) {
        return;
      }

      const result = await onLoadPhoto();
      if (mounted && result?.success) {
        setPhotoUrl(result.url || '');
      }
    };

    loadPhoto();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, onLoadPhoto]);

  const validateProfile = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleSave = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSavingProfile(true);
    try {
      if (onUpdateProfile) {
        const result = await onUpdateProfile(form);
        if (result && !result.success) {
          setErrors({ general: result.message || 'Failed to update profile' });
          return;
        }
      }
      setEditMode(false);
      setErrors({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || user?.phoneNumber || '',
    });
    setErrors({});
    setEditMode(false);
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwords.current) errs.current = 'Current password is required';
    if (!passwords.next) errs.next = 'New password is required';
    else if (passwords.next.length < 6) errs.next = 'Min. 6 characters';
    if (passwords.next !== passwords.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handlePasswordSave = async () => {
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) {
      setPwdErrors(errs);
      return;
    }

    setIsSavingPassword(true);
    try {
      if (onChangePassword) {
        const result = await onChangePassword({
          current: passwords.current,
          next: passwords.next,
          confirm: passwords.confirm,
        });
        if (result && !result.success) {
          setPwdErrors({ general: result.message || 'Failed to change password' });
          return;
        }
      }

      setPwdSaved(true);
      setPasswords({ current: '', next: '', confirm: '' });
      setShowPasswordForm(false);
      setPwdErrors({});
      setTimeout(() => setPwdSaved(false), 3000);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePhotoPick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPhotoError('');

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      event.target.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const uploadResult = onUploadPhoto
        ? await onUploadPhoto(file)
        : { success: false, message: 'Photo upload is not configured.' };

      if (!uploadResult?.success) {
        setPhotoError(uploadResult?.message || 'Failed to upload photo.');
        return;
      }

      if (onLoadPhoto) {
        const photoResult = await onLoadPhoto();
        if (photoResult?.success) {
          setPhotoUrl(photoResult.url || '');
        }
      }

      setPhotoSaved(true);
      setTimeout(() => setPhotoSaved(false), 3000);
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  return (
    <div className="profile-page">
      <button
        onClick={onBack}
        className="profile-back-button profile-back-floating"
        type="button"
        aria-label="Back"
        title="Back"
      >
        <ArrowLeft size={22} />
      </button>
      <div className="profile-shell">
        <h1 className="profile-title">My Profile</h1>

        {(saved || pwdSaved || photoSaved) && (
          <div className="profile-toast profile-toast-success">
            <CheckCircle2 size={16} />
            {saved
              ? 'Profile updated successfully!'
              : pwdSaved
                ? 'Password changed successfully!'
                : 'Photo uploaded successfully!'}
          </div>
        )}

        {(errors.general || photoError) && (
          <div className="profile-toast profile-toast-error">
            <AlertCircle size={16} />
            {errors.general || photoError}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-hero">
            <div className="profile-avatar">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="profile-avatar-image" />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>

            <div className="profile-hero-text">
              <h2>{user?.name || 'User'}</h2>
              <p>{user?.email || ''}</p>
            </div>

            <button
              className="profile-camera"
              type="button"
              aria-label="Change profile photo"
              onClick={handlePhotoPick}
              disabled={isUploadingPhoto}
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handlePhotoSelected}
              className="profile-file-input"
            />
          </div>

          <div className="profile-content">
            <div className="profile-section-head">
              <h3>Personal Information</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="btn btn-outline" type="button">
                  <Edit3 size={14} /> Edit Profile
                </button>
              ) : (
                <div className="inline-actions">
                  <button onClick={handleCancel} className="btn btn-muted" type="button">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-primary" type="button" disabled={isSavingProfile}>
                    <Check size={14} /> {isSavingProfile ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="profile-fields">
              <div className="field-group">
                <label className="field-label" htmlFor="profile-name">
                  <User size={13} /> Full Name
                </label>
                {editMode ? (
                  <>
                    <input
                      id="profile-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, name: e.target.value }));
                        setErrors((p) => {
                          const next = { ...p };
                          delete next.name;
                          return next;
                        });
                      }}
                      className={`field-input ${errors.name ? 'field-input-error' : ''}`}
                    />
                    {errors.name && (
                      <p className="field-error">
                        <AlertCircle size={11} /> {errors.name}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="field-value">{user?.name || ''}</p>
                )}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-email">
                  <Mail size={13} /> Email Address
                </label>
                {editMode ? (
                  <>
                    <input
                      id="profile-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, email: e.target.value }));
                        setErrors((p) => {
                          const next = { ...p };
                          delete next.email;
                          return next;
                        });
                      }}
                      className={`field-input ${errors.email ? 'field-input-error' : ''}`}
                    />
                    {errors.email && (
                      <p className="field-error">
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="field-value">{user?.email || ''}</p>
                )}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-phone">
                  <Phone size={13} /> Phone Number
                </label>
                {editMode ? (
                  <input
                    id="profile-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. +63 912 345 6789"
                    className="field-input"
                  />
                ) : (
                  <p className="field-value">{user?.phone || user?.phoneNumber || <span className="placeholder">Not provided</span>}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card profile-security">
          <div className="profile-section-head profile-security-head">
            <div>
              <h3>Security</h3>
              <p>Manage your account password</p>
            </div>
          </div>

          {!showPasswordForm ? (
            <button onClick={() => setShowPasswordForm(true)} className="btn btn-outline" type="button">
              <Edit3 size={14} /> Change Password
            </button>
          ) : (
            <div className="password-form">
              {['current', 'next', 'confirm'].map((field) => (
                <div key={field} className="field-group">
                  <label className="field-label" htmlFor={`password-${field}`}>
                    {field === 'current'
                      ? 'Current Password'
                      : field === 'next'
                        ? 'New Password'
                        : 'Confirm New Password'}
                  </label>
                  <div className="password-input-wrap">
                    <input
                      id={`password-${field}`}
                      type={showPwd[field] ? 'text' : 'password'}
                      value={passwords[field]}
                      onChange={(e) => {
                        setPasswords((p) => ({ ...p, [field]: e.target.value }));
                        setPwdErrors((p) => {
                          const next = { ...p };
                          delete next[field];
                          return next;
                        });
                      }}
                      placeholder="••••••••"
                      className={`field-input ${pwdErrors[field] ? 'field-input-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((p) => ({ ...p, [field]: !p[field] }))}
                      className="password-toggle"
                      aria-label="Toggle password visibility"
                    >
                      {showPwd[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwdErrors[field] && (
                    <p className="field-error">
                      <AlertCircle size={11} /> {pwdErrors[field]}
                    </p>
                  )}
                </div>
              ))}

              {pwdErrors.general && (
                <p className="field-error">
                  <AlertCircle size={11} /> {pwdErrors.general}
                </p>
              )}

              <div className="password-actions">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswords({ current: '', next: '', confirm: '' });
                    setPwdErrors({});
                  }}
                  className="btn btn-muted block"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSave}
                  className="btn btn-primary block"
                  type="button"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @fileoverview ManagerLoginForm - Form đăng nhập dành cho Chủ sân (Manager)
 */

import { useTranslation } from 'react-i18next';

const ManagerLoginForm = ({
  loginData,
  errors,
  loading,
  showPassword,
  setShowPassword,
  handleLoginChange,
  handleManagerLoginSubmit,
  onForgotPassword,
}) => {
  const { t } = useTranslation();

  return (
    <div className="auth-form-wrapper">
      {/* Header */}
      <div className="auth-header">
        <div className="manager-login-badge">
          <span className="material-symbols-outlined">manage_accounts</span>
          {t('auth.managerPortalBadge')}
        </div>
        <h1 className="auth-title">{t('auth.managerLoginTitle')}</h1>
        <p className="auth-subtitle">
          {t('auth.managerLoginSubtitle')}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleManagerLoginSubmit} className="auth-form">
        {/* Error Message */}
        {errors.submit && (
          <div className="error-alert">
            {errors.submit}
          </div>
        )}

        {/* Email Field */}
        <div className="form-field">
          <label className="form-label">
            <span className="material-icons-outlined form-input-icon">business_center</span>
            {t('auth.managerEmailLabel')}
          </label>
          <div className="form-input-wrapper">
            <input
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              className="form-input"
              placeholder={t('auth.placeholders.managerEmail')}
              type="text"
              required
            />
          </div>
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* Password Field */}
        <div className="form-field">
          <label className="form-label">
            <span className="material-icons-outlined form-input-icon">lock</span>
            {t('auth.password')}
          </label>
          <div className="password-input-container">
            <input
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="form-input password-input"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              required
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password-btn"
              type="button"
              aria-label="Toggle password visibility"
            >
              <span className="material-icons-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
          <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={onForgotPassword}
              className="forgot-password-link"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn manager-submit-btn"
        >
          {loading ? (
            <>
              <span className="auth-btn-spinner" />
              {t('auth.loggingIn')}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                login
              </span>
              {t('auth.login')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ManagerLoginForm;

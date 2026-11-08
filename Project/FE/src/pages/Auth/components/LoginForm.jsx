/**
 * @fileoverview LoginForm - Form đăng nhập
 */

import { useTranslation } from 'react-i18next';

const LoginForm = ({
  loginData,
  errors,
  loading,
  showPassword,
  setShowPassword,
  handleLoginChange,
  handleLoginSubmit,
  switchAuthMode,
}) => {
  const { t } = useTranslation();

  return (
    <div className="auth-form-wrapper">
      {/* Header */}
      <div className="auth-header">
        <h1 className="auth-title">{t('auth.customerLoginTitle')}</h1>
        <p className="auth-subtitle">
          {t('auth.customerLoginSubtitle')}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className="auth-form">
        {/* Error Message */}
        {errors.general && (
          <div className="error-alert">
            {errors.general}
          </div>
        )}
        {errors.submit && (
          <div className="error-alert">
            {errors.submit}
          </div>
        )}

        {/* Email Field */}
        <div className="form-field">
          <label className="form-label">
            <span className="material-icons-outlined form-input-icon">person</span>
            {t('auth.loginWithEmail')}
          </label>
          <div className="form-input-wrapper">
            <input
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              className="form-input"
              placeholder={t('auth.placeholders.email')}
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
        </div>

        {/* Forgot Password Link */}
        <div className="form-footer-link">
          <button
            type="button"
            onClick={() => switchAuthMode('forgot-password')}
            className="forgot-password-link"
          >
            {t('auth.forgotPassword')}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
        >
          {loading ? t('auth.loggingIn') : t('auth.loginNow')}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="auth-switch">
        <p className="auth-switch-text">
          {t('auth.noAccountPrompt')}{' '}
          <button
            type="button"
            onClick={() => switchAuthMode('register')}
            className="auth-switch-link"
          >
            {t('auth.registerNow')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

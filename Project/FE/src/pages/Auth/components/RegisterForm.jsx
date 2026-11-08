/**
 * @fileoverview RegisterForm - Form đăng ký
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RegisterForm = ({
  registerData,
  errors,
  loading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleRegisterChange,
  handleRegisterSubmit,
  switchAuthMode,
}) => {
  const { t } = useTranslation();

  return (
    <div className="auth-form-wrapper">
      {/* Header */}
      <div className="auth-header">
        <h1 className="auth-title">{t('auth.registerTitle')}</h1>
        <p className="auth-subtitle">
          {t('auth.registerSubtitle')}
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleRegisterSubmit} className="auth-form">
        {/* Error Message */}
        {errors.submit && (
          <div className="error-alert">
            {errors.submit}
          </div>
        )}

        {/* Username & Email Row */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              <span className="material-icons-outlined">person</span>
              {t('auth.username')}
            </label>
            <input
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              className="form-input"
              placeholder={t('auth.placeholders.username')}
              type="text"
              required
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">
              <span className="material-icons-outlined">email</span>
              {t('auth.email')}
            </label>
            <input
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              className="form-input"
              placeholder={t('auth.placeholders.email')}
              type="email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
        </div>

        {/* Phone Number */}
        <div className="form-field">
          <label className="form-label">
            <span className="material-icons-outlined">call</span>
            {t('auth.phone')}
          </label>
          <input
            name="phone"
            value={registerData.phone}
            onChange={handleRegisterChange}
            className="form-input"
            placeholder={t('auth.placeholders.phone')}
            type="tel"
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        {/* Password & Confirm Password Row */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              <span className="material-icons-outlined">lock</span>
              {t('auth.password')}
            </label>
            <div className="password-field">
              <input
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="form-input"
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

          <div className="form-field">
            <label className="form-label">
              <span className="material-icons-outlined">check_circle</span>
              {t('auth.confirmPassword')}
            </label>
            <div className="password-field">
              <input
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="form-input"
                placeholder="••••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                required
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password-btn"
                type="button"
                aria-label="Toggle confirm password visibility"
              >
                <span className="material-icons-outlined">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="terms-group">
          <input
            name="agreeToTerms"
            checked={registerData.agreeToTerms}
            onChange={handleRegisterChange}
            className="terms-checkbox"
            id="terms"
            type="checkbox"
          />
          <label className="terms-label" htmlFor="terms">
            {t('auth.agreeTo')}{' '}
            <Link to="/terms" className="terms-link">
              {t('footer.terms')}
            </Link>{' '}
            {t('common.and')}{' '}
            <Link to="/privacy" className="terms-link">
              {t('footer.privacy')}
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
        >
          {loading ? t('auth.processing') : t('auth.createAccount')}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="auth-switch">
        <p className="auth-switch-text">
          {t('auth.hasAccountPrompt')}{' '}
          <button
            type="button"
            onClick={() => switchAuthMode('login')}
            className="auth-switch-link"
          >
            {t('auth.loginNow')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;

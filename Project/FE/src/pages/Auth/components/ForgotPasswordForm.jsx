/**
 * @fileoverview ForgotPasswordForm - Form quên mật khẩu
 */

import { useTranslation } from 'react-i18next';

const ForgotPasswordForm = ({
  forgotPasswordEmail,
  setForgotPasswordEmail,
  forgotPasswordSuccess,
  setForgotPasswordSuccess,
  errors,
  setErrors,
  loading,
  isManager,
  handleForgotPasswordSubmit,
  switchAuthMode,
}) => {
  const { t } = useTranslation();

  // Success state
  if (forgotPasswordSuccess) {
    return (
      <div className="auth-form-wrapper forgot-password-success">
        {/* Success Icon */}
        <div className={`success-icon-wrapper ${isManager ? 'manager-success-icon-wrapper' : ''}`}>
          <span className={`material-icons-outlined success-icon ${isManager ? 'manager-success-icon' : ''}`}>
            check_circle
          </span>
        </div>

        {/* Success Message */}
        <h2 className="success-title">{t('auth.forgot.successTitle')}</h2>
        <p className="success-text">
          {t('auth.forgot.successTextPrefix')}{' '}
          <strong className="email-highlight">{forgotPasswordEmail}</strong>.{' '}
          {t('auth.forgot.successTextSuffix')}
        </p>

        {/* Info Box */}
        <div className="info-box">
          <span className="material-icons-outlined">info</span>
          <span>
            {t('auth.forgot.infoBox')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <button
            type="button"
            onClick={() => switchAuthMode('login')}
            className={`success-btn-primary ${isManager ? 'manager-success-btn-primary' : ''}`}
          >
            <span className="material-icons-outlined">arrow_back</span>
            {t('auth.forgot.backToLogin')}
          </button>
          <button
            type="button"
            onClick={() => {
              setForgotPasswordSuccess(false);
              setForgotPasswordEmail('');
            }}
            className="success-btn-secondary"
          >
            {t('auth.forgot.resendEmail')}
          </button>
        </div>
      </div>
    );
  }

  // Initial state - email input form
  return (
    <div className={`auth-form-wrapper ${isManager ? 'manager-auth-form' : ''}`}>
      {/* Header with Icon */}
      <div className={`auth-header forgot-password-header ${isManager ? 'manager-forgot-password-header' : ''}`}>
        <div className={`forgot-password-icon-wrapper ${isManager ? 'manager-forgot-password-icon-wrapper' : ''}`}>
          <span className={`material-icons-outlined forgot-password-icon ${isManager ? 'manager-forgot-password-icon' : ''}`}>
            lock_reset
          </span>
        </div>
        <h1 className="auth-title">{t('auth.forgot.title')}</h1>
        <p className="auth-subtitle">
          {t('auth.forgot.subtitle')}
        </p>
      </div>

      {/* Forgot Password Form */}
      <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
        {/* Error Message */}
        {errors.email && (
          <div className="error-alert">
            <span className="material-icons-outlined">error</span>
            {errors.email}
          </div>
        )}

        {/* Email Field */}
        <div className="form-field">
          <label className="form-label">
            <span className="material-icons-outlined form-input-icon">mail</span>
            {t('auth.email')}
          </label>
          <input
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => {
              setForgotPasswordEmail(e.target.value);
              setErrors({});
            }}
            placeholder={t('auth.placeholders.email')}
            className="form-input"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`auth-submit-btn ${isManager ? 'manager-submit-btn' : ''}`}
        >
          {loading ? (
            <>
              <span className="material-icons-outlined animate-spin">refresh</span>
              {t('auth.processing')}
            </>
          ) : (
            t('auth.forgot.submit')
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="auth-footer">
        <button
          type="button"
          onClick={() => switchAuthMode('login')}
          className="auth-back-link"
        >
          <span className="material-icons-outlined">arrow_back</span>
          {t('auth.forgot.backToLoginPage')}
        </button>
        <p className="auth-support-text">
          {t('auth.support.prompt')}{' '}
          <a href="#" className="auth-support-link">
            {t('auth.support.contact')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

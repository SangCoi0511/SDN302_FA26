import '../../styles/AuthPage.css';
import useAuthPage from './useAuthPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ManagerLoginForm from './components/ManagerLoginForm';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * AuthPage Component - Unified Authentication Interface
 * Handles Login, Register, and Forgot Password flows in a single component with tab switching
 */
const AuthPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    authMode,
    loginRole,
    setLoginRole,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    errors,
    setErrors,
    loginData,
    registerData,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordSuccess,
    setForgotPasswordSuccess,
    handleLoginChange,
    handleRegisterChange,
    switchAuthMode,
    handleLoginSubmit,
    handleManagerLoginSubmit,
    handleRegisterSubmit,
    handleForgotPasswordSubmit,
    handleManagerForgotPasswordSubmit,
  } = useAuthPage();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const banned = params.get('banned');
    const message = params.get('message');
    if (banned === '1' && message) {
      // Surface the message as a form-level error so user sees it immediately.
      setErrors((prev) => ({ ...prev, general: decodeURIComponent(message) }));
    }
  }, [location.search, setErrors]);

  return (
    <div className="auth-page">
      <main className="auth-main">
        {/* Main Container */}
        <div className="auth-container">
          {/* Auth Mode Tabs - Main Navigation */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              onClick={() => { switchAuthMode('login', 'customer'); setLoginRole('customer'); }}
              className={`auth-mode-tab ${authMode === 'login' && loginRole === 'customer' ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>person</span>
              {t('auth.tabs.user')}
            </button>
            <button
              type="button"
              onClick={() => { switchAuthMode('register'); }}
              className={`auth-mode-tab ${authMode === 'register' ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>person_add</span>
              {t('auth.tabs.register')}
            </button>
            <button
              type="button"
              onClick={() => { switchAuthMode('login', 'manager'); setLoginRole('manager'); setErrors({}); }}
              className={`auth-mode-tab manager-tab ${authMode === 'login' && loginRole === 'manager' ? 'active manager-tab-active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>manage_accounts</span>
              {t('auth.tabs.manager')}
            </button>
          </div>

          {/* Auth Card */}
          <div className="auth-card">
            {authMode === 'login' && loginRole === 'customer' && (
              <LoginForm
                loginData={loginData}
                errors={errors}
                loading={loading}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleLoginChange={handleLoginChange}
                handleLoginSubmit={handleLoginSubmit}
                switchAuthMode={switchAuthMode}
              />
            )}
            {authMode === 'login' && loginRole === 'manager' && (
              <ManagerLoginForm
                loginData={loginData}
                errors={errors}
                loading={loading}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleLoginChange={handleLoginChange}
                handleManagerLoginSubmit={handleManagerLoginSubmit}
                onForgotPassword={() => {
                  setLoginRole('manager');
                  switchAuthMode('forgot-password');
                }}
              />
            )}
            {authMode === 'register' && (
              <RegisterForm
                registerData={registerData}
                errors={errors}
                loading={loading}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                handleRegisterChange={handleRegisterChange}
                handleRegisterSubmit={handleRegisterSubmit}
                switchAuthMode={switchAuthMode}
              />
            )}
            {authMode === 'forgot-password' && (
              <ForgotPasswordForm
                forgotPasswordEmail={forgotPasswordEmail}
                setForgotPasswordEmail={setForgotPasswordEmail}
                forgotPasswordSuccess={forgotPasswordSuccess}
                setForgotPasswordSuccess={setForgotPasswordSuccess}
                errors={errors}
                setErrors={setErrors}
                loading={loading}
                isManager={loginRole === 'manager'}
                handleForgotPasswordSubmit={
                  loginRole === 'manager'
                    ? handleManagerForgotPasswordSubmit
                    : handleForgotPasswordSubmit
                }
                switchAuthMode={switchAuthMode}
              />
            )}
          </div>
        </div>
      </main>

      {/* Decorative Background Elements */}
      <div className="auth-decorative-bg">
        <div className="auth-decorative-circle-1" />
        <div className="auth-decorative-circle-2" />
      </div>
    </div>
  );
};

export default AuthPage;

/**
 * @fileoverview Custom hook cho AuthPage
 * 
 * Quản lý state, validation, và submit handlers cho Login, Register, Forgot Password
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import authService from '../../services/authService';

const getRedirectTarget = (location, fallback, role = null) => {
  const fromState = typeof location?.state?.from === 'string' ? location.state.from : '';
  const searchParams = new URLSearchParams(location?.search || '');
  const fromQuery = searchParams.get('redirect') || '';

  const candidate = (fromState || fromQuery || '').trim();
  if (!candidate) return fallback;

  // Chỉ cho phép internal path để tránh open-redirect.
  if (!candidate.startsWith('/')) return fallback;

  // Tránh loop quay lại chính trang auth.
  if (candidate === '/login' || candidate === '/register' || candidate === '/forgot-password' || candidate === '/manager/login' || candidate === '/manager/forgot-password') {
    return fallback;
  }

  // Role-aware redirect safety:
  // - Customer không được redirect vào khu vực admin (sẽ bị ManagerLayout đá về /login -> nhìn như login không chạy)
  // - Manager/admin không được redirect ra ngoài /admin
  if (role === 'customer' && candidate.startsWith('/admin')) {
    return fallback;
  }
  if ((role === 'manager' || role === 'admin') && !candidate.startsWith('/admin')) {
    return fallback;
  }

  return candidate;
};

const useAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuth();
  const notification = useNotification();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const getInitialAuthMode = () => {
    const path = location.pathname;
    if (path.includes('register')) return 'register';
    if (path.includes('forgot-password')) return 'forgot-password';
    return 'login';
  };

  const [authMode, setAuthMode] = useState(getInitialAuthMode());
  const [loginRole, setLoginRole] = useState(
    location.pathname.includes('/manager') ? 'manager' : 'customer'
  ); // 'customer' | 'manager'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('register')) {
      setAuthMode('register');
    } else if (path.includes('forgot-password')) {
      setAuthMode('forgot-password');
    } else {
      setAuthMode('login');
    }
    // Cập nhật role dựa trên route (manager vs customer)
    if (path.includes('/manager')) {
      setLoginRole('manager');
    } else {
      // Chỉ reset về customer nếu KHÔNG phải path login chung hoặc register
      // Tránh việc nhấp nháy khi đang ở manager mà path chưa cập nhật kịp
      if (!path.includes('register') && path !== '/forgot-password' && path !== '/login') {
         setLoginRole('customer');
      } else if (path === '/login' || path === '/register' || path === '/forgot-password') {
         setLoginRole('customer');
      }
    }
  }, [location.pathname]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const switchAuthMode = (mode, targetRole = null) => {
    const role = targetRole || loginRole;
    setAuthMode(mode);
    setErrors({});
    setForgotPasswordSuccess(false);

    if (mode === 'register') {
      navigate('/register', { replace: true });
    } else if (mode === 'forgot-password') {
      // Điều hướng khác nhau cho customer vs manager
      if (role === 'manager') {
        navigate('/manager/forgot-password', { replace: true });
      } else {
        navigate('/forgot-password', { replace: true });
      }
    } else {
      if (role === 'manager') {
        navigate('/manager/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  };

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!registerData.username.trim()) {
      newErrors.username = t('auth.errors.usernameRequired');
    } else if (registerData.username.length < 3) {
      newErrors.username = t('auth.errors.usernameMinLength');
    }

    if (!registerData.email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

    if (!registerData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (registerData.password.length < 8) {
      newErrors.password = t('auth.errors.passwordMinLength');
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(registerData.password)) {
      newErrors.password = t('auth.errors.passwordComplexity');
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.confirmPasswordMismatch');
    }

    if (!registerData.phone.trim()) {
      newErrors.phone = t('auth.errors.phoneRequired');
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(registerData.phone)) {
      newErrors.phone = t('auth.errors.phoneInvalid');
    }

    if (!registerData.agreeToTerms) {
      newErrors.agreeToTerms = t('auth.errors.mustAgreeTerms');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = (email) => {
    if (!email) {
      setErrors({ email: t('auth.errors.emailEnter') });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: t('auth.errors.emailInvalid') });
      return false;
    }
    return true;
  };

  // ============================================================================
  // SUBMIT HANDLERS
  // ============================================================================

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = t('auth.errors.emailEnter');
    if (!loginData.password) newErrors.password = t('auth.errors.passwordEnter');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({
        email: loginData.email.trim(),
        password: loginData.password,
      });

      if (!response.success) {
        setErrors({ submit: response.message || t('auth.errors.loginFailed') });
        setLoading(false);
        return;
      }

      const { customer, token, accessToken } = response.data;
      const userData = {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        image: customer.image || 'https://via.placeholder.com/100',
        role: 'customer',
      };

      login(userData, token || accessToken);
      notification.success(t('auth.notifications.loginSuccess'));
      navigate(getRedirectTarget(location, '/', 'customer'), { replace: true });
    } catch (error) {
      setErrors({ submit: error.message || t('auth.errors.loginFailedTryAgain') });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = t('auth.errors.emailEnter');
    if (!loginData.password) newErrors.password = t('auth.errors.passwordEnter');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.loginManager({
        email: loginData.email.trim(),
        password: loginData.password,
      });

      if (!response.success) {
        setErrors({ submit: response.message || t('auth.errors.loginFailed') });
        setLoading(false);
        return;
      }

      const { manager, token, accessToken } = response.data;
      const userData = {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone || '',
        image: manager.image || '',
        imageQR: manager.imageQR || null,
        role: 'manager',          // luôn đặt cứng — BE không trả về role
      };

      login(userData, token || accessToken);
      notification.success(t('auth.notifications.managerLoginSuccess'));
      navigate(getRedirectTarget(location, '/admin/dashboard', 'manager'), { replace: true });
    } catch (error) {
      setErrors({ submit: error.message || t('auth.errors.loginFailedTryAgain') });
      console.error('Manager login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setLoading(true);
    try {
      const response = await authService.register({
        name: registerData.username.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
        phone: registerData.phone.trim(),
      });

      if (!response.success) {
        setErrors({ submit: response.message || t('auth.errors.registerFailed') });
        setLoading(false);
        return;
      }

      const { customer, token } = response.data;
      const userData = {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        image: customer.image || 'https://via.placeholder.com/100',
        role: 'customer',
      };

      login(userData, token);
      notification.success(t('auth.notifications.registerSuccess'));
      navigate(getRedirectTarget(location, '/', 'customer'), { replace: true });
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ submit: error.message || t('auth.errors.registerFailedTryAgain') });
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotPasswordEmail)) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.resetPassword(forgotPasswordEmail.trim());
      if (!response.success) {
        setErrors({ email: response.message || t('auth.errors.genericError') });
        setLoading(false);
        return;
      }
      setForgotPasswordSuccess(true);
    } catch (error) {
      setErrors({ email: error.message || t('auth.errors.genericErrorTryAgain') });
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotPasswordEmail)) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.resetManagerPassword(forgotPasswordEmail.trim());
      if (!response.success) {
        setErrors({ email: response.message || t('auth.errors.genericError') });
        setLoading(false);
        return;
      }
      setForgotPasswordSuccess(true);
    } catch (error) {
      setErrors({ email: error.message || t('auth.errors.genericErrorTryAgain') });
      console.error('Manager password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};

export default useAuthPage;

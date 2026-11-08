import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserAvatar } from '../../utils/defaultAvatar';
import logo from '../../assets/images/logo.png';
import '../../styles/Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [hidden, setHidden] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const lastScrollY = useRef(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

  const handleNavClick = (to) => {
    scrollToTop();
    navigate(to);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    setShowDropdown(false);
    handleNavClick('/login');
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`header-nav ${hidden ? 'header-hidden' : ''}`}>
      <div className="header-container">
        <div className="header-inner">
          {/* Logo */}
          <div className="header-logo-section">
            <button className="header-logo-link" onClick={() => handleNavClick('/')}>
              <img
                alt="Sân Siêu Tốc Logo"
                className="header-logo-image"
                src={logo}
              />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="header-nav-links">
            <button className="header-nav-link" onClick={() => handleNavClick('/')}>
              {t('nav.home')}
            </button>
            <button className="header-nav-link" onClick={() => handleNavClick('/fields')}>
              {t('nav.fields')}
            </button>
            <button className="header-nav-link" onClick={() => handleNavClick('/terms')}>
              {t('footer.terms')}
            </button>
            <button className="header-nav-link" onClick={() => handleNavClick('/about')}>
              {t('nav.about')}
            </button>
          </div>

          {/* Actions */}
          <div className="header-actions">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="header-icon-btn"
              aria-label="Toggle theme"
            >
              <span className="material-icons-outlined">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Language Switch (guest/customer only) */}
            {!(user?.role === 'manager' || user?.role === 'admin') && (
              <div className="header-lang-wrapper" aria-label={t('settings.language')}>
                <span className="material-icons-outlined header-lang-icon">language</span>
                <select
                  value={i18n.resolvedLanguage || i18n.language}
                  onChange={handleLanguageChange}
                  className="header-lang-select"
                >
                  <option value="vi">VI</option>
                  <option value="en">EN</option>
                </select>
              </div>
            )}

            <div className="header-divider" />

            {isAuthenticated ? (
              <div className="header-avatar-wrapper" ref={dropdownRef}>
                <button
                  className="header-avatar"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    src={getUserAvatar(user?.image, user?.name)}
                    alt={user?.name || 'User Avatar'}
                    className="header-avatar-image"
                  />
                </button>

                {showDropdown && (
                  <div className="header-dropdown">
                    <div className="header-dropdown-header">
                      <p className="header-dropdown-name">{user?.name || 'User'}</p>
                      <p className="header-dropdown-email">{user?.email || ''}</p>
                      {(user?.role === 'manager' || user?.role === 'admin') && (
                        <span className="header-dropdown-role-badge">Quản lý</span>
                      )}
                    </div>
                    <div className="header-dropdown-divider" />

                    {/* Manager: chỉ hiện Dashboard + Cài đặt */}
                    {(user?.role === 'manager' || user?.role === 'admin') ? (
                      <>
                        <button
                          className="header-dropdown-item"
                          onClick={() => { setShowDropdown(false); handleNavClick('/admin/dashboard'); }}
                        >
                          <span className="material-icons-outlined">dashboard</span>
                          Dashboard quản lý
                        </button>
                        <button
                          className="header-dropdown-item"
                          onClick={() => { setShowDropdown(false); handleNavClick('/admin/settings'); }}
                        >
                          <span className="material-icons-outlined">settings</span>
                          Cài đặt
                        </button>
                      </>
                    ) : (
                      /* Customer: chỉ hiện Hồ sơ */
                      <button
                        className="header-dropdown-item"
                        onClick={() => { setShowDropdown(false); handleNavClick('/customer/profile'); }}
                      >
                        <span className="material-icons-outlined">person</span>
                        {t('nav.profile')}
                      </button>
                    )}

                    <div className="header-dropdown-divider" />
                    <button
                      className="header-dropdown-item logout"
                      onClick={() => { setShowDropdown(false); setShowLogoutModal(true); }}
                    >
                      <span className="material-icons-outlined">logout</span>
                      {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="header-login-btn" onClick={() => { scrollToTop(); navigate('/login', { state: { from: `${location.pathname}${location.search || ''}` } }); }}>
                <span className="material-icons-outlined text-sm">login</span>
                {t('auth.login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
        onClick={() => setShowLogoutModal(false)}
      >
        <div
          className="bg-white dark:bg-[#14532d] rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-1">
            <span className="material-icons-outlined text-red-500 text-3xl">logout</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            {t('auth.logoutConfirmTitle')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center leading-relaxed">
            {t('auth.logoutConfirmDesc')}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full mt-2">
            <button
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-green-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-green-900/30 transition-colors"
              onClick={() => setShowLogoutModal(false)}
            >
              {t('common.cancel')}
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
              onClick={handleLogoutConfirm}
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;

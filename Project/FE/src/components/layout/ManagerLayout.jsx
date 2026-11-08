import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserAvatar } from '../../utils/defaultAvatar';
import logo from '../../assets/images/logo.png';
import '../../styles/ManagerLayout.css';

const ManagerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  // Redirect non-manager users — chờ loading xong mới kiểm tra
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite', color: '#16a34a' }}>progress_activity</span>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Đang xác thực...</p>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'manager')) {
    const from = `${location.pathname}${location.search || ''}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  const menuItems = [
    { path: '/admin/dashboard',  icon: 'dashboard',     label: 'Dashboard' },
    { path: '/admin/fields',     icon: 'stadium',       label: 'Quản lý Sân' },
    { path: '/admin/bookings',   icon: 'calendar_month',label: 'Quản lý Đặt sân' },
    { path: '/admin/customers',  icon: 'group',         label: 'Quản lý Khách hàng' },
    { path: '/admin/feedback',   icon: 'chat_bubble',   label: 'Quản lý Đánh giá' },
    { path: '/admin/settings',   icon: 'settings',      label: 'Cài đặt' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="manager-layout">
      {/* Sidebar */}
      <aside className="manager-sidebar">
        {/* Logo */}
        <div className="manager-sidebar-logo">
          <img src={logo} alt="Sân Siêu Tốc" className="manager-logo-img" />
          <div>
            <h1 className="manager-logo-title">Sân Siêu Tốc</h1>
            <p className="manager-logo-subtitle">Manager Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="manager-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`manager-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="manager-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="manager-main">
        {/* Top Header */}
        <header className="manager-header">
          <div className="manager-header-left">
            <h2 className="manager-header-title">
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h2>
            <p className="manager-header-subtitle">Chào mừng trở lại, {user?.name || 'Quản lý'}</p>
          </div>
          <div className="manager-header-right">
            <button
              className="manager-notification-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span className="material-symbols-outlined">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            {/* <button className="manager-notification-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="manager-notification-dot" />
            </button> */}
            <div className="manager-header-divider" />
            <div className="manager-avatar-wrapper" ref={dropdownRef}>
              <button
                className="manager-avatar-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={getUserAvatar(user?.image, user?.name)}
                  alt={user?.name || 'Manager'}
                  className="manager-avatar-img"
                />
              </button>

              {showDropdown && (
                <div className="manager-dropdown">
                  <div className="manager-dropdown-header">
                    <p className="manager-dropdown-name">{user?.name || 'Manager'}</p>
                    <p className="manager-dropdown-email">{user?.email || ''}</p>
                  </div>
                  <div className="manager-dropdown-divider" />
                  <Link
                    to="/admin/dashboard"
                    className="manager-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="manager-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="material-symbols-outlined">settings</span>
                    Cài đặt
                  </Link>
                  <div className="manager-dropdown-divider" />
                  <Link
                    to="/"
                    className="manager-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="material-symbols-outlined">home</span>
                    Về trang chủ
                  </Link>
                  <div className="manager-dropdown-divider" />
                  <button
                    className="manager-dropdown-item logout"
                    onClick={() => { logout(); setShowDropdown(false); navigate('/login'); }}
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="manager-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
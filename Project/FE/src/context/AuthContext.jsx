import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import tokenManager from '../utils/tokenManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [bannedMessage, setBannedMessage] = useState('');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = tokenManager.getToken();

        // Also check legacy key 'token' and migrate if needed
        const legacyToken = localStorage.getItem('token');
        if (!token && legacyToken) {
          tokenManager.setToken(legacyToken);
          localStorage.removeItem('token');
        }

        const activeToken = token || legacyToken;

        if (storedUser && activeToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        tokenManager.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for account-banned event from axios interceptor
  useEffect(() => {
    const handleBanned = (e) => {
      setBannedMessage(e.detail?.message || 'Tài khoản của bạn đã bị khóa.');
      setIsBanned(true);
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('account-banned', handleBanned);
    return () => window.removeEventListener('account-banned', handleBanned);
  }, []);

  const login = (userData, token) => {
    tokenManager.setUser(userData);
    tokenManager.setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenManager.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    tokenManager.setUser(userData);
    setUser(userData);
  };

  const dismissBanned = () => {
    setIsBanned(false);
    setBannedMessage('');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    isBanned,
    bannedMessage,
    login,
    logout,
    updateUser,
    dismissBanned,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

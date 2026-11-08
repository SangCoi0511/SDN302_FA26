/**
 * @fileoverview NotificationContext - Centralized Toast/Alert Notification System
 *
 * Provides a global notification system across the entire app.
 * Supports four notification types: success, error, warning, info.
 * Notifications auto-dismiss after a configurable duration and can be
 * manually dismissed by the user.
 *
 * Usage:
 *   import { useNotification } from '../context/NotificationContext';
 *
 *   const { success, error, warning, info, notify } = useNotification();
 *
 *   success('Đặt sân thành công!');
 *   error('Đã xảy ra lỗi, vui lòng thử lại.');
 *   warning('Phiên đăng nhập sắp hết hạn.');
 *   info('Có cập nhật mới.');
 *   notify({ type: 'success', message: '...', duration: 5000 });
 *
 * @author San Sieu Toc Team
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_DURATION = 4000; // ms
const MAX_NOTIFICATIONS = 5;

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * NotificationProvider
 * Wrap this around your app (inside Router, alongside other providers).
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const idCounter = useRef(0);

  /**
   * Remove a notification by id.
   */
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Core notify function.
   * @param {Object} options
   * @param {'success'|'error'|'warning'|'info'} options.type
   * @param {string} options.message
   * @param {number} [options.duration] - auto-dismiss ms (0 = persistent)
   * @returns {number} notification id
   */
  const notify = useCallback(
    ({ type = 'info', message, duration = DEFAULT_DURATION }) => {
      const id = ++idCounter.current;

      const notification = { id, type, message, createdAt: Date.now() };

      setNotifications((prev) => {
        // Keep max notifications; drop oldest if exceeding
        const next = [...prev, notification];
        return next.length > MAX_NOTIFICATIONS ? next.slice(-MAX_NOTIFICATIONS) : next;
      });

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration);
      }

      return id;
    },
    [removeNotification]
  );

  // ---- convenience helpers ----

  const success = useCallback(
    (message, duration) => notify({ type: 'success', message, duration }),
    [notify]
  );

  const error = useCallback(
    (message, duration) => notify({ type: 'error', message, duration }),
    [notify]
  );

  const warning = useCallback(
    (message, duration) => notify({ type: 'warning', message, duration }),
    [notify]
  );

  const info = useCallback(
    (message, duration) => notify({ type: 'info', message, duration }),
    [notify]
  );

  /**
   * Clear all notifications.
   */
  const clearAll = useCallback(() => setNotifications([]), []);

  const value = {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* ---- Notification Toast Container ---- */}
      {notifications.length > 0 && (
        <div className="notification-container" aria-live="polite">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-toast notification-${n.type}`}
              role="alert"
            >
              <span className="notification-icon material-symbols-outlined">
                {n.type === 'success' && 'check_circle'}
                {n.type === 'error' && 'error'}
                {n.type === 'warning' && 'warning'}
                {n.type === 'info' && 'info'}
              </span>
              <span className="notification-message">{n.message}</span>
              <button
                className="notification-close"
                onClick={() => removeNotification(n.id)}
                aria-label="Đóng thông báo"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useNotification — access the notification API anywhere in the tree.
 * @returns {{ notify, success, error, warning, info, removeNotification, clearAll, notifications }}
 */
export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within <NotificationProvider>');
  }
  return ctx;
};

export default NotificationContext;

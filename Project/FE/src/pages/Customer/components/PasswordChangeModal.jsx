/**
 * PasswordChangeModal Component
 * Modal đổi mật khẩu
 */
import { useState } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import authService from '../../../services/authService';

const PasswordChangeModal = ({ onClose }) => {
  const notification = useNotification();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordFormChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(passwordForm.newPassword)) {
      setPasswordError('Mật khẩu mới phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&#)');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setIsSubmitting(true);
    setPasswordError('');

    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmPassword,
      });

      if (!response.success) {
        const message = response.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
        setPasswordError(message);
        notification.error(message);
        return;
      }

      notification.success(response.message || 'Đổi mật khẩu thành công!');
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      setPasswordError(message);
      notification.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessContinue = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {passwordSuccess ? (
          <div className="modal-success-popup">
            <div className="modal-success-icon">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h3 className="modal-success-title">Đổi mật khẩu thành công!</h3>
            <p className="modal-success-desc">
              Mật khẩu của bạn đã được cập nhật an toàn. Vui lòng sử dụng mật khẩu mới cho
              lần đăng nhập tiếp theo.
            </p>
            <button className="modal-success-btn" onClick={handleSuccessContinue}>
              Tiếp tục
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3 className="modal-title">
                <span className="material-symbols-outlined">lock</span>
                Đổi mật khẩu
              </h3>
              <button className="modal-close-btn" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="modal-body">
              {passwordError && (
                <div className="modal-error">
                  <span className="material-symbols-outlined">error</span>
                  {passwordError}
                </div>
              )}

              <div className="modal-field">
                <label className="modal-label">Mật khẩu hiện tại</label>
                <div className="modal-input-wrapper">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      handlePasswordFormChange('currentPassword', e.target.value)
                    }
                    className="modal-input"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    className="modal-toggle-password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showCurrentPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Mật khẩu mới</label>
                <div className="modal-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                    className="modal-input"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    className="modal-toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Xác nhận mật khẩu mới</label>
                <div className="modal-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordFormChange('confirmPassword', e.target.value)
                    }
                    className="modal-input"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="modal-toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={onClose}>
                  Hủy
                </button>
                <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordChangeModal;

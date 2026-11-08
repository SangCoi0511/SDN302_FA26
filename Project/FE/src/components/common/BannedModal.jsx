/**
 * BannedModal — Popup hiển thị khi tài khoản customer bị khóa bởi manager
 * Tự động đăng xuất và redirect về trang chủ sau khi bấm OK.
 */
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './BannedModal.css';

const BannedModal = () => {
  const { isBanned, bannedMessage, dismissBanned } = useAuth();
  const navigate = useNavigate();

  if (!isBanned) return null;

  const handleDismiss = () => {
    dismissBanned();
    navigate('/');
  };

  return (
    <div className="banned-modal-overlay">
      <div className="banned-modal-content">
        <div className="banned-modal-icon">
          <span className="material-symbols-outlined">lock</span>
        </div>
        <h2 className="banned-modal-title">Tài khoản đã bị khóa</h2>
        <p className="banned-modal-message">
          {bannedMessage || 'Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ để được hỗ trợ.'}
        </p>
        <button className="banned-modal-btn" onClick={handleDismiss}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
};

export default BannedModal;

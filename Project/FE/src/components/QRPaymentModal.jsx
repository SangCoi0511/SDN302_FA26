/**
 * QRPaymentModal — Reusable QR-based payment modal
 *
 * Shows:
 *   - Manager's QR code image (imageQR from BE)
 *   - Manager info (name, phone)
 *   - Deposit amount & payment instructions
 *
 * Used in: FieldDetailPage (after booking) & BookingDetailPage (for pending bookings)
 *
 * Props:
 *   @param {boolean}  isOpen         - Whether modal is visible
 *   @param {Function} onClose        - Close handler
 *   @param {string}   qrCodeUrl      - Manager's QR code image URL
 *   @param {Object}   managerInfo    - { name, phone }
 *   @param {number}   depositAmount  - Deposit to pay
 *   @param {number}   totalPrice     - Total booking price
 *   @param {string}   [bookingId]    - Booking ID for reference
 *   @param {string}   [fieldName]    - Field name for context
 */

import { useEffect, useRef } from 'react';
import '../styles/QRPaymentModal.css';

const QRPaymentModal = ({
  isOpen,
  onClose,
  qrCodeUrl,
  managerInfo,
  depositAmount,
  totalPrice,
  bookingId,
  fieldName,
}) => {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) onClose();
  };

  return (
    <div className="qr-modal-overlay" ref={modalRef} onClick={handleOverlayClick}>
      <div className="qr-modal-content">
        {/* Header */}
        <div className="qr-modal-header">
          <div className="qr-modal-header-left">
            <span className="material-symbols-outlined qr-modal-icon">qr_code_2</span>
            <h2 className="qr-modal-title">Thanh toán tiền cọc</h2>
          </div>
          <button className="qr-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Booking reference */}
        {(bookingId || fieldName) && (
          <div className="qr-modal-ref">
            {fieldName && <span className="qr-modal-field-name">{fieldName}</span>}
            {bookingId && <span className="qr-modal-booking-id">Mã đặt: #{typeof bookingId === 'string' ? bookingId.slice(-8).toUpperCase() : bookingId}</span>}
          </div>
        )}

        {/* Price info */}
        <div className="qr-modal-price-section">
          <div className="qr-modal-price-row">
            <span>Tổng tiền:</span>
            <span className="qr-modal-price-value">{totalPrice?.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="qr-modal-price-row deposit">
            <span>Tiền cọc cần trả (30%):</span>
            <span className="qr-modal-deposit-value">{depositAmount?.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="qr-modal-qr-section">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="QR Code thanh toán"
              className="qr-modal-qr-image"
            />
          ) : (
            <div className="qr-modal-no-qr">
              <span className="material-symbols-outlined">qr_code_2</span>
              <p>Chưa có mã QR thanh toán</p>
              <p className="qr-modal-no-qr-hint">Vui lòng liên hệ chủ sân để chuyển khoản</p>
            </div>
          )}
        </div>

        {/* Manager info */}
        {managerInfo && (
          <div className="qr-modal-manager-section">
            <h4 className="qr-modal-section-title">
              <span className="material-symbols-outlined">person</span>
              Thông tin chủ sân
            </h4>
            <div className="qr-modal-manager-details">
              <div className="qr-modal-manager-row">
                <span className="material-symbols-outlined">badge</span>
                <span>{managerInfo.name || 'Chưa cập nhật'}</span>
              </div>
              <div className="qr-modal-manager-row">
                <span className="material-symbols-outlined">phone</span>
                <a href={`tel:${managerInfo.phone}`} className="qr-modal-phone-link">
                  {managerInfo.phone || 'Chưa cập nhật'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="qr-modal-instructions">
          <h4 className="qr-modal-section-title">
            <span className="material-symbols-outlined">info</span>
            Hướng dẫn thanh toán
          </h4>
          <ol className="qr-modal-steps">
            <li>Mở ứng dụng ngân hàng và quét mã QR ở trên</li>
            <li>Chuyển khoản số tiền <strong>{depositAmount?.toLocaleString('vi-VN')}đ</strong></li>
            <li>Nội dung chuyển khoản: <strong>COC {bookingId ? (typeof bookingId === 'string' ? bookingId.slice(-8).toUpperCase() : bookingId) : ''}</strong></li>
            <li>Chủ sân sẽ xác nhận và kích hoạt lịch đặt của bạn</li>
          </ol>
        </div>

        {/* Warning */}
        <div className="qr-modal-warning">
          <span className="material-symbols-outlined">warning</span>
          <p>Vui lòng thanh toán cọc trong vòng <strong>24 giờ</strong>. Booking sẽ bị hủy nếu không nhận được thanh toán.</p>
        </div>

        {/* Footer */}
        <div className="qr-modal-footer">
          <button className="qr-modal-btn-close" onClick={onClose}>
            Đã hiểu, đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRPaymentModal;

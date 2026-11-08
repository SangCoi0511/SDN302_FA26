import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../context/NotificationContext';
import bookingService from '../../services/bookingService';
import feedbackService from '../../services/feedbackService';
import MapModal from '../../components/Map/MapModal';
import QRPaymentModal from '../../components/QRPaymentModal';
import {
  UTILITY_LABELS,
  FIELD_RULES_BY_CATEGORY,
} from '../../data/mockData';
import '../../styles/BookingDetailPage.css';

/** Status display config — từ ngữ phù hợp với đặt sân thể thao */
const BOOKING_STATUS_CONFIG = {
  Pending: {
    icon: 'hourglass_top',
    label: 'Chờ thanh toán',
    bannerClass: 'pending',
    badgeClass: 'status-pending',
  },
  Confirmed: {
    icon: 'check_circle',
    label: 'Đã đặt sân',
    bannerClass: 'confirmed',
    badgeClass: 'status-confirmed',
  },
  Completed: {
    icon: 'task_alt',
    label: 'Đã hoàn thành',
    bannerClass: 'completed',
    badgeClass: 'status-completed',
  },
  Cancelled: {
    icon: 'cancel',
    label: 'Đã hủy',
    bannerClass: 'cancelled',
    badgeClass: 'status-cancelled',
  },
  Expired: {
    icon: 'timer_off',
    label: 'Hết hạn thanh toán',
    bannerClass: 'cancelled',
    badgeClass: 'status-expired',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date string (YYYY-MM-DD) to DD/MM/YYYY
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

/**
 * Format date with day name
 */
const formatDateWithDay = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return `${days[date.getDay()]}, ${formatDate(dateStr)}`;
};

/**
 * Format ISO date to DD/MM/YYYY
 */
const formatOrderDate = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Calculate duration in minutes between two time strings
 */
const calcDuration = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

/**
 * Get utility labels in Vietnamese
 */
const getUtilityLabels = (utilities) => {
  if (!utilities || !Array.isArray(utilities)) return [];
  return utilities.map((u) => UTILITY_LABELS[u] || u);
};

/**
 * Get field rules by category
 */
const getFieldRules = (categoryName) => {
  return FIELD_RULES_BY_CATEGORY[categoryName] || FIELD_RULES_BY_CATEGORY.Football;
};

// ============================================================================
// FEEDBACK SUB-COMPONENTS
// ============================================================================

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="bd-star-rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`material-symbols-outlined bd-star ${value >= star ? 'filled' : ''} ${!readonly ? 'interactive' : ''}`}
        onClick={() => !readonly && onChange && onChange(star)}
      >
        star
      </span>
    ))}
  </div>
);

const FeedbackSection = ({ detail, bookingId }) => {
  const notification = useNotification();
  const [feedback, setFeedback] = useState(detail.feedback || null);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rating, setRating] = useState(feedback?.rating || feedback?.rate || 5);
  const [comment, setComment] = useState(feedback?.comment || feedback?.content || '');
  const [saving, setSaving] = useState(false);

  const detailId = detail.id || detail._id;

  const handleSubmit = async () => {
    if (!comment.trim()) { notification.error('Vui lòng nhập nội dung đánh giá.'); return; }
    if (comment.trim().length > 500) { notification.error('Nội dung đánh giá tối đa 500 ký tự.'); return; }
    setSaving(true);
    try {
      const result = await feedbackService.createFeedback({ bookingDetailId: detailId, rating, comment: comment.trim() });
      if (result.success) {
        setFeedback(result.data?.feedback || result.data || { rate: rating, content: comment.trim() });
        setIsWriting(false);
        notification.success('Đã gửi đánh giá thành công!');
      } else { notification.error(result.error || 'Gửi đánh giá thất bại.'); }
    } catch { notification.error('Có lỗi xảy ra. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!comment.trim()) { notification.error('Vui lòng nhập nội dung đánh giá.'); return; }
    if (comment.trim().length > 500) { notification.error('Nội dung đánh giá tối đa 500 ký tự.'); return; }
    setSaving(true);
    try {
      const feedbackId = feedback?._id || feedback?.id;
      const result = await feedbackService.updateFeedback(feedbackId, { rating, comment: comment.trim() });
      if (result.success) {
        setFeedback((prev) => ({ ...prev, rate: rating, content: comment.trim() }));
        setIsEditing(false);
        notification.success('Đã cập nhật đánh giá!');
      } else { notification.error(result.error || 'Cập nhật thất bại.'); }
    } catch { notification.error('Có lỗi xảy ra. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const feedbackId = feedback?._id || feedback?.id;
      const result = await feedbackService.deleteFeedback(feedbackId);
      if (result.success) {
        setFeedback(null); setShowDeleteConfirm(false); setRating(5); setComment('');
        notification.success('Đã xóa đánh giá.');
      } else { notification.error(result.error || 'Xóa thất bại.'); }
    } catch { notification.error('Có lỗi xảy ra. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const openEdit = () => { setRating(feedback?.rate || feedback?.rating || 5); setComment(feedback?.content || feedback?.comment || ''); setIsEditing(true); };
  const cancelForm = () => { setIsWriting(false); setIsEditing(false); setRating(feedback?.rate || feedback?.rating || 5); setComment(feedback?.content || feedback?.comment || ''); };

  if (feedback && !isEditing) {
    return (
      <div className="bd-feedback-existing">
        <div className="bd-feedback-header">
          <span className="material-symbols-outlined bd-feedback-icon">rate_review</span>
          <span className="bd-feedback-label">Đánh giá của bạn</span>
          <div className="bd-feedback-actions-small">
            <button className="bd-feedback-btn-icon" onClick={openEdit} title="Sửa đánh giá"><span className="material-symbols-outlined">edit</span></button>
            <button className="bd-feedback-btn-icon danger" onClick={() => setShowDeleteConfirm(true)} title="Xóa đánh giá"><span className="material-symbols-outlined">delete</span></button>
          </div>
        </div>
        <StarRating value={feedback.rate || feedback.rating} readonly />
        <p className="bd-feedback-comment">"{feedback.content || feedback.comment}"</p>
        {showDeleteConfirm && (
          <div className="bd-feedback-delete-confirm">
            <p>Xác nhận xóa đánh giá này?</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="bd-feedback-btn secondary" onClick={() => setShowDeleteConfirm(false)} disabled={saving}>Hủy</button>
              <button className="bd-feedback-btn danger" onClick={handleDelete} disabled={saving}>{saving ? 'Đang xóa...' : 'Xóa'}</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bd-feedback-form">
        <p className="bd-feedback-form-title">Chỉnh sửa đánh giá</p>
        <StarRating value={rating} onChange={setRating} />
        <textarea className="bd-feedback-textarea" placeholder="Chia sẻ trải nghiệm của bạn..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
        <div className="bd-feedback-form-actions">
          <button className="bd-feedback-btn secondary" onClick={cancelForm} disabled={saving}>Hủy</button>
          <button className="bd-feedback-btn primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
        </div>
      </div>
    );
  }

  if (!isWriting) {
    return (
      <button className="bd-feedback-write-btn" onClick={() => setIsWriting(true)}>
        <span className="material-symbols-outlined">rate_review</span>
        Viết đánh giá
      </button>
    );
  }

  return (
    <div className="bd-feedback-form">
      <p className="bd-feedback-form-title">Đánh giá slot này</p>
      <StarRating value={rating} onChange={setRating} />
      <textarea className="bd-feedback-textarea" placeholder="Chia sẻ trải nghiệm của bạn về sân..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
      <div className="bd-feedback-form-actions">
        <button className="bd-feedback-btn secondary" onClick={cancelForm} disabled={saving}>Hủy</button>
        <button className="bd-feedback-btn primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT
// ============================================================================

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const notification = useNotification();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // ========== API Data State ==========
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========== Fetch booking from API ==========
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await bookingService.getMyBookings();
        // BE: { success, data: [...] }, bookingService unwrap axios → { success, data: [...] }
        let bookings = [];
        if (Array.isArray(response)) {
          bookings = response;
        } else if (response?.data && Array.isArray(response.data)) {
          bookings = response.data;
        }
        // Find the booking by ID from the list
        const found = bookings.find((b) => b.id === id || b._id === id) || null;
        setBooking(found || null);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="booking-history-page">
        <div className="booking-history-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ width: 48, height: 48, margin: '0 auto 1rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin đặt sân...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!booking) {
    return (
      <div className="booking-history-page">
        <div className="booking-history-container">
          <div className="bh-not-found">
            <span className="material-symbols-outlined bh-not-found-icon">search_off</span>
            <h2>Không tìm thấy đơn đặt sân</h2>
            <p>Đơn đặt sân không tồn tại hoặc đã bị xóa.</p>
            <Link to="/booking-history" className="bh-btn-back">
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại lịch sử đặt sân
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Derived data from API response
  const status = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.Pending;
  const bookingId = booking.id || booking._id;
  
  // Extract field info from first booking detail
  const firstDetail = booking.bookingDetails?.[0] || {};
  const fieldName = firstDetail.fieldName || '';
  const fieldAddress = firstDetail.fieldAddress || '';
  
  // Manager info from API
  const managerPhone = booking.managerInfo?.phone || '';
  
  // Format booking details time ranges
  const bookingDetailsList = booking.bookingDetails || [];
  const firstSlotStart = bookingDetailsList.length > 0 
    ? new Date(bookingDetailsList[0].startTime) : null;
  const lastSlotEnd = bookingDetailsList.length > 0 
    ? new Date(bookingDetailsList[bookingDetailsList.length - 1].endTime) : null;
  
  const startTimeStr = firstSlotStart 
    ? `${String(firstSlotStart.getHours()).padStart(2, '0')}:${String(firstSlotStart.getMinutes()).padStart(2, '0')}` 
    : '';
  const endTimeStr = lastSlotEnd 
    ? `${String(lastSlotEnd.getHours()).padStart(2, '0')}:${String(lastSlotEnd.getMinutes()).padStart(2, '0')}` 
    : '';
  
  const bookingDate = firstSlotStart ? firstSlotStart.toISOString().split('T')[0] : '';
  const duration = calcDuration(startTimeStr, endTimeStr);

  // Price info from API
  const totalDisplay = booking.totalPrice || 0;
  const depositDisplay = booking.depositAmount || 0;
  const paymentMessage = booking.paymentInfo?.paymentMessage || '';

  // Cancel is only allowed when status is Pending (from API flag)
  const isCancellable = booking.canCancel === true;

  // QR payment available for Pending bookings
  const hasQrPayment = booking.status === 'Pending' && (booking.qrCode || booking.managerInfo);

  // Handlers
  const handleCancelBooking = async () => {
    setShowCancelConfirm(false);
    setCancelLoading(true);
    try {
      const response = await bookingService.cancelBooking(bookingId);
      const data = response.data || response;
      notification.success(data.message || 'Hủy đặt sân thành công!');
      // Update local state
      setBooking(prev => prev ? { ...prev, status: 'Cancelled', canCancel: false, qrCode: null, managerInfo: null } : null);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Hủy đặt sân thất bại.';
      notification.error(errMsg);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    notification.info('Tính năng tải hóa đơn đang được phát triển.');
  };

  const handleOpenDirections = () => {
    setIsMapModalOpen(true);
  };

  const handleShowQR = () => {
    setQrModalOpen(true);
  };

  return (
    <div className="booking-history-page">
      <div className="booking-history-container">
        {/* Breadcrumbs */}
        <nav className="bh-breadcrumbs">
          <Link to="/customer/profile" className="bh-breadcrumb-link">Hồ sơ</Link>
          <span className="material-symbols-outlined bh-breadcrumb-sep">chevron_right</span>
          <Link to="/booking-history" className="bh-breadcrumb-link">Lịch sử đặt sân</Link>
          <span className="material-symbols-outlined bh-breadcrumb-sep">chevron_right</span>
          <span className="bh-breadcrumb-current">Chi tiết đơn đặt #{typeof bookingId === 'string' ? bookingId.slice(-8).toUpperCase() : bookingId}</span>
        </nav>

        {/* Status Banner */}
        <div className={`bh-status-banner ${status.bannerClass}`}>
          <div className="bh-status-info">
            <div className="bh-status-icon-wrapper">
              <span className="material-symbols-outlined bh-status-icon">{status.icon}</span>
            </div>
            <div>
              <h1 className="bh-status-title">{status.label}</h1>
              <p className="bh-status-meta">
                Mã đặt sân: <span className="bh-code">#{typeof bookingId === 'string' ? bookingId.slice(-8).toUpperCase() : bookingId}</span> • Ngày đặt: {formatOrderDate(booking.createdAt)}
              </p>
            </div>
          </div>
          <div className="bh-status-actions">
            {hasQrPayment && (
              <button className="bh-btn-download" onClick={handleShowQR} style={{ background: '#2563eb', color: '#fff' }}>
                <span className="material-symbols-outlined">qr_code_2</span>
                Thanh toán QR
              </button>
            )}
            <button className="bh-btn-download" onClick={handleDownloadInvoice}>
              <span className="material-symbols-outlined">download</span>
              Tải hóa đơn
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="bh-grid">
          {/* Left Column */}
          <div className="bh-left-col">
            {/* Field Info Card */}
            <div className="bh-field-card">
              <div className="bh-field-info" style={{ padding: '1.5rem' }}>
                <h2 className="bh-field-name clickable" onClick={() => {
                  const detailFieldId = bookingDetailsList[0]?.fieldId || bookingDetailsList[0]?.id;
                  if (detailFieldId) navigate(`/fields/${detailFieldId}`);
                }}>
                  {fieldName}
                </h2>
                {fieldAddress && (
                  <div className="bh-field-address">
                    <span className="material-symbols-outlined">location_on</span>
                    <p>{fieldAddress}</p>
                  </div>
                )}
                <div className="bh-field-contact">
                  {managerPhone && (
                    <div className="bh-contact-phone">
                      <span className="material-symbols-outlined">phone</span>
                      <div>
                        <p className="bh-contact-label">Liên hệ quản lý</p>
                        <p className="bh-contact-value">{managerPhone}</p>
                      </div>
                    </div>
                  )}
                  <button className="bh-btn-directions" onClick={handleOpenDirections}>
                    <span className="material-symbols-outlined">directions</span>
                    Chỉ đường ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Details List */}
            {bookingDetailsList.length > 0 && (
              <div className="bh-detail-card">
                <h3 className="bh-detail-title">
                  <span className="material-symbols-outlined">calendar_month</span>
                  Chi tiết các slot ({bookingDetailsList.length} slot)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookingDetailsList.map((detail, idx) => {
                    const detailStart = new Date(detail.startTime);
                    const detailEnd = new Date(detail.endTime);
                    const dateStr = detailStart.toLocaleDateString('vi-VN');
                    const timeStr = `${String(detailStart.getHours()).padStart(2, '0')}:${String(detailStart.getMinutes()).padStart(2, '0')} - ${String(detailEnd.getHours()).padStart(2, '0')}:${String(detailEnd.getMinutes()).padStart(2, '0')}`;
                    const canFeedback = detail.status === 'Completed';
                    return (
                      <div key={detail.id || idx} style={{
                        padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem',
                        fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 500 }}>{dateStr}</span>
                            <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>•</span>
                            <span>{timeStr}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{detail.price?.toLocaleString('vi-VN')}đ</span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500,
                              background: detail.status === 'Active' ? '#dcfce7' : detail.status === 'Completed' ? '#dbeafe' : '#fee2e2',
                              color: detail.status === 'Active' ? '#16a34a' : detail.status === 'Completed' ? '#2563eb' : '#dc2626'
                            }}>
                              {detail.status}
                            </span>
                          </div>
                        </div>
                        {canFeedback && (
                          <FeedbackSection
                            detail={detail}
                            bookingId={bookingId}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Booking Summary */}
          <div className="bh-right-col">
            <div className="bh-summary-card">
              <h3 className="bh-summary-title">Tổng quan đặt sân</h3>

              <div className="bh-summary-details">
                {bookingDate && (
                  <div className="bh-summary-row">
                    <span>Ngày chơi</span>
                    <span className="bh-summary-value">{formatDateWithDay(bookingDate)}</span>
                  </div>
                )}
                {startTimeStr && endTimeStr && (
                  <div className="bh-summary-row">
                    <span>Khung giờ</span>
                    <span className="bh-summary-value">{startTimeStr} - {endTimeStr}</span>
                  </div>
                )}
                {duration > 0 && (
                  <div className="bh-summary-row">
                    <span>Thời lượng</span>
                    <span className="bh-summary-value">{duration} phút</span>
                  </div>
                )}
                <div className="bh-summary-row">
                  <span>Số slot</span>
                  <span className="bh-summary-value">{bookingDetailsList.length}</span>
                </div>
              </div>

              <div className="bh-price-section">
                {depositDisplay > 0 && (
                  <div className="bh-price-row">
                    <span>Tiền cọc (30%)</span>
                    <span>{depositDisplay.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="bh-total-row">
                  <span>Tổng cộng</span>
                  <span className="bh-total-value">{totalDisplay.toLocaleString('vi-VN')}đ</span>
                </div>
                {paymentMessage && (
                  <p className="bh-payment-note">{paymentMessage}</p>
                )}
              </div>

              {/* QR Payment button for Pending bookings */}
              {hasQrPayment && (
                <div style={{ padding: '0 1rem 1rem' }}>
                  <button 
                    className="bh-btn-rebook" 
                    onClick={handleShowQR}
                    style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <span className="material-symbols-outlined">qr_code_2</span>
                    Xem QR thanh toán cọc
                  </button>
                </div>
              )}

              {isCancellable && (
                <div className="bh-cancel-section">
                  <button 
                    className="bh-btn-cancel" 
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? 'Đang hủy...' : 'Hủy đặt sân'}
                  </button>
                  <p className="bh-cancel-note">
                    * Lưu ý: Booking chỉ có thể hủy khi trạng thái là Pending (chưa thanh toán cọc).
                  </p>
                </div>
              )}

              {booking.status === 'Completed' && (
                <div className="bh-cancel-section">
                  <button
                    className="bh-btn-rebook"
                    onClick={() => {
                      const detailFieldId = bookingDetailsList[0]?.fieldId || bookingDetailsList[0]?.id;
                      if (detailFieldId) navigate(`/fields/${detailFieldId}`);
                    }}
                  >
                    Đặt lại sân này
                  </button>
                </div>
              )}
            </div>

            {/* Support Card */}
            <div className="bh-support-card">
              <div className="bh-support-header">
                <span className="material-symbols-outlined">support_agent</span>
                <span className="bh-support-title">Cần hỗ trợ?</span>
              </div>
              <p className="bh-support-text">
                Nếu bạn gặp bất kỳ vấn đề gì về đơn đặt sân này, vui lòng liên hệ với chúng tôi.
              </p>
              <a href="tel:19001234" className="bh-support-phone">
                <span className="material-symbols-outlined">call</span>
                1900 1234
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        address={fieldAddress}
        fieldName={fieldName}
      />

      {/* QR Payment Modal */}
      {hasQrPayment && (
        <QRPaymentModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          qrCodeUrl={booking.qrCode}
          managerInfo={booking.managerInfo}
          depositAmount={depositDisplay}
          totalPrice={totalDisplay}
          bookingId={bookingId}
          fieldName={fieldName}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger">
              <span className="material-symbols-outlined">cancel</span>
            </div>
            <h3 className="modal-title">Xác nhận hủy đặt sân</h3>
            <p className="modal-description">
              Bạn có chắc chắn muốn hủy đơn đặt sân <strong>#{typeof bookingId === 'string' ? bookingId.slice(-8).toUpperCase() : bookingId}</strong>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowCancelConfirm(false)}>
                Quay lại
              </button>
              <button className="modal-btn confirm-ban" onClick={handleCancelBooking}>
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailPage;

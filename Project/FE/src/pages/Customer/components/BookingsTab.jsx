/**
 * BookingsTab Component
 * Tab hiển thị lịch sử đặt sân với filter và pagination
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import bookingService from '../../../services/bookingService';

const ITEMS_PER_PAGE = 5;

const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

const getStatusInfo = (status) => {
  switch (status) {
    case BOOKING_STATUS.PENDING:
      return { className: 'status-pending', label: 'Chờ thanh toán', icon: 'hourglass_top' };
    case BOOKING_STATUS.CONFIRMED:
      return { className: 'status-confirmed', label: 'Đã đặt sân', icon: 'check_circle' };
    case BOOKING_STATUS.COMPLETED:
      return { className: 'status-completed', label: 'Đã hoàn thành', icon: 'task_alt' };
    case BOOKING_STATUS.CANCELLED:
      return { className: 'status-cancelled', label: 'Đã hủy', icon: 'cancel' };
    case BOOKING_STATUS.EXPIRED:
      return { className: 'status-expired', label: 'Quá hạn thời gian nhận sân', icon: 'timer_off' };
    default:
      return { className: '', label: status, icon: 'info' };
  }
};

const extractBookingDisplay = (booking) => {
  const details = booking.bookingDetails || [];
  const firstDetail = details[0] || {};
  const fieldName = firstDetail.fieldName || 'Không rõ sân';
  const fieldAddress = firstDetail.fieldAddress || '';
  const fieldImage = firstDetail.fieldImage || null;
  const fieldId = firstDetail.fieldId || null;

  let dateStr = '';
  let startTimeStr = '';
  let endTimeStr = '';

  if (firstDetail.startTime) {
    const start = new Date(firstDetail.startTime);
    dateStr = start.toISOString().split('T')[0];
    startTimeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
  }
  if (details.length > 0) {
    const lastDetail = details[details.length - 1];
    if (lastDetail.endTime) {
      const end = new Date(lastDetail.endTime);
      endTimeStr = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    }
  }
  return { fieldName, fieldAddress, fieldImage, fieldId, dateStr, startTimeStr, endTimeStr, slotCount: details.length };
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const formatCreatedDate = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const formatDetailTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** BookingsTab — main component */
const BookingsTab = ({ allBookings, stats, loading, onRefresh }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [bookingTab, setBookingTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [renewDurationById, setRenewDurationById] = useState({});
  const [renewLoadingById, setRenewLoadingById] = useState({});

  const bookingTabs = [
    { key: 'all',       label: `Tất cả (${stats.total})` },
    { key: 'pending',   label: `Chờ thanh toán (${stats.pending})` },
    { key: 'confirmed', label: `Đã đặt sân (${stats.confirmed})` },
    { key: 'completed', label: `Hoàn thành (${stats.completed})` },
    { key: 'expired',   label: `Hết hạn (${stats.expired || 0})` },
    { key: 'cancelled', label: `Đã hủy (${stats.cancelled})` },
  ];

  const filteredBookings = useMemo(() => {
    if (bookingTab === 'pending')   return allBookings.filter((b) => b.displayStatus === BOOKING_STATUS.PENDING);
    if (bookingTab === 'confirmed') return allBookings.filter((b) => b.displayStatus === BOOKING_STATUS.CONFIRMED);
    if (bookingTab === 'completed') return allBookings.filter((b) => b.displayStatus === BOOKING_STATUS.COMPLETED);
    if (bookingTab === 'expired')   return allBookings.filter((b) => b.displayStatus === BOOKING_STATUS.EXPIRED);
    if (bookingTab === 'cancelled') return allBookings.filter((b) => b.displayStatus === BOOKING_STATUS.CANCELLED);
    return allBookings;
  }, [allBookings, bookingTab]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleBookingTabChange = (tabKey) => {
    setBookingTab(tabKey);
    setCurrentPage(1);
  };

  const getRenewDuration = (bookingId) => {
    const v = renewDurationById[bookingId];
    const n = Number(v);
    return [1, 2, 3].includes(n) ? n : 3;
  };

  const setRenewDuration = (bookingId, duration) => {
    setRenewDurationById((prev) => ({ ...prev, [bookingId]: duration }));
  };

  const isRenewEligible = (booking) => {
    const repeatType = booking.repeatType;
    const durationMonths = Number(booking.durationMonths);
    const hasContractDates = Boolean(booking.contractStartAt && booking.contractEndAt);
    const isConfirmed = (booking.displayStatus || booking.status) === BOOKING_STATUS.CONFIRMED;
    const notCancelledOrExpired = ![BOOKING_STATUS.CANCELLED, BOOKING_STATUS.EXPIRED].includes(booking.displayStatus || booking.status);

    return repeatType === 'recurring' && durationMonths === 3 && hasContractDates && isConfirmed && notCancelledOrExpired;
  };

  const handleRenew = async (booking) => {
    const bookingId = booking.id || booking._id;
    if (!bookingId) return;

    setRenewLoadingById((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const duration = getRenewDuration(bookingId);
      const result = await bookingService.renewBooking(bookingId, duration);

      if (!result?.success) {
        notification.error(result?.message || 'Gia hạn thất bại.');
        return;
      }

      const newBookingId = result?.data?.bookingId || result?.data?.id || result?.data?._id;
      notification.success(result?.message || 'Đã tạo booking gia hạn. Vui lòng thanh toán tiền cọc.');
      if (typeof onRefresh === 'function') await onRefresh();
      if (newBookingId) navigate(`/booking-history/${newBookingId}`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gia hạn.';
      notification.error(msg);
      console.error('Renew booking error:', err);
    } finally {
      setRenewLoadingById((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ width: 48, height: 48, margin: '0 auto 1rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử đặt sân...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Summary */}
      <div className="user-dashboard-stats-row">
        <div className="user-dashboard-stat-card">
          <span className="material-symbols-outlined user-dashboard-stat-icon">confirmation_number</span>
          <div>
            <p className="user-dashboard-stat-value">{stats.total}</p>
            <p className="user-dashboard-stat-label">Tổng đơn</p>
          </div>
        </div>
        <div className="user-dashboard-stat-card">
          <span className="material-symbols-outlined user-dashboard-stat-icon completed">check_circle</span>
          <div>
            <p className="user-dashboard-stat-value">{stats.completed}</p>
            <p className="user-dashboard-stat-label">Hoàn thành</p>
          </div>
        </div>
        <div className="user-dashboard-stat-card">
          <span className="material-symbols-outlined user-dashboard-stat-icon pending">hourglass_top</span>
          <div>
            <p className="user-dashboard-stat-value">{stats.pending}</p>
            <p className="user-dashboard-stat-label">Chờ thanh toán</p>
          </div>
        </div>
        <div className="user-dashboard-stat-card">
          <span className="material-symbols-outlined user-dashboard-stat-icon cancelled">cancel</span>
          <div>
            <p className="user-dashboard-stat-value">{stats.cancelled}</p>
            <p className="user-dashboard-stat-label">Đã hủy</p>
          </div>
        </div>
      </div>

      <section className="user-dashboard-content-card">
        <div className="user-dashboard-content-header">
          <h2 className="user-dashboard-content-title">Lịch sử đặt sân</h2>
          <div className="user-dashboard-tabs">
            {bookingTabs.map((tab) => (
              <button
                key={tab.key}
                className={`user-dashboard-tab ${bookingTab === tab.key ? 'active' : ''}`}
                onClick={() => handleBookingTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="user-dashboard-booking-list">
          {paginatedBookings.length === 0 ? (
            <div className="user-dashboard-empty">
              <span className="material-symbols-outlined user-dashboard-empty-icon">event_busy</span>
              <p>Không có đơn đặt sân nào</p>
            </div>
          ) : (
            paginatedBookings.map((booking) => {
              const displayStatus = booking.displayStatus || booking.status;
              const statusInfo = getStatusInfo(displayStatus);
              const isCancelled = displayStatus === BOOKING_STATUS.CANCELLED;
              const isExpired = displayStatus === BOOKING_STATUS.EXPIRED;
              const display = extractBookingDisplay(booking);
              const bookingId = booking.id || booking._id;
              const canRenew = isRenewEligible(booking);
              const renewDuration = bookingId ? getRenewDuration(bookingId) : 3;
              const renewing = Boolean(bookingId && renewLoadingById[bookingId]);

              return (
                <div
                  key={bookingId}
                  className={`user-dashboard-booking-card-full ${isCancelled || isExpired ? 'cancelled' : ''}`}
                >
                  {display.fieldImage && (
                    <div
                      className={`user-dashboard-booking-img ${isCancelled || isExpired ? 'grayscale' : ''}`}
                      style={{ backgroundImage: `url(${display.fieldImage})` }}
                    />
                  )}
                  <div className={`user-dashboard-booking-info ${isCancelled || isExpired ? 'dimmed' : ''}`}>
                    <div className="user-dashboard-booking-badges">
                      <span className={`user-dashboard-booking-status ${statusInfo.className}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px', verticalAlign: 'middle' }}>
                          {statusInfo.icon}
                        </span>
                        {statusInfo.label}
                      </span>
                      <span className="user-dashboard-booking-code">
                        Ngày đặt: {formatCreatedDate(booking.createdAt)}
                      </span>
                    </div>
                    <h4
                      className="user-dashboard-booking-name"
                      style={{ cursor: display.fieldId ? 'pointer' : 'default' }}
                      onClick={() => { if (display.fieldId) navigate(`/fields/${display.fieldId}`); }}
                    >
                      {display.fieldName}
                    </h4>
                    {display.fieldAddress && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>location_on</span>
                        {display.fieldAddress}
                      </p>
                    )}
                    <div className="user-dashboard-booking-meta">
                      {display.dateStr && (
                        <div className="user-dashboard-meta-item">
                          <span className="material-symbols-outlined">calendar_today</span>
                          <span>{formatDate(display.dateStr)}</span>
                        </div>
                      )}
                      {display.startTimeStr && (
                        <div className="user-dashboard-meta-item">
                          <span className="material-symbols-outlined">schedule</span>
                          <span>
                            {display.startTimeStr}{display.endTimeStr ? ` - ${display.endTimeStr}` : ''}
                            {display.slotCount > 1 ? ` (${display.slotCount} slot)` : ''}
                          </span>
                        </div>
                      )}
                      <div className="user-dashboard-meta-item user-dashboard-meta-price">
                        <span className="material-symbols-outlined">payments</span>
                        <span>{(booking.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                    {isExpired && (() => {
                      const hasCancelledSlot = (booking.bookingDetails || []).some((d) => d.status === 'Cancelled');
                      return (
                        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', fontStyle: 'italic' }}>
                          ⚠ {hasCancelledSlot ? 'Khách hàng không đến sân.' : 'Đơn này đã quá thời gian mà chưa được thanh toán cọc.'}
                        </p>
                      );
                    })()}
                    {!isExpired && booking.paymentInfo?.paymentMessage && (
                      <p style={{ fontSize: '0.8rem', color: booking.needPayment ? 'var(--warning-color, #e67e22)' : 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        {booking.paymentInfo.paymentMessage}
                      </p>
                    )}
                  </div>
                  <div className="user-dashboard-booking-actions">
                    {!isCancelled && !isExpired && (
                      <button
                        className="user-dashboard-btn-detail"
                        onClick={() => navigate(`/booking-history/${bookingId}`)}
                      >
                        {displayStatus === BOOKING_STATUS.COMPLETED ? 'Chi tiết & Đánh giá' : 'Chi tiết'}
                      </button>
                    )}

                    {canRenew && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <select
                          value={renewDuration}
                          onChange={(e) => setRenewDuration(bookingId, Number(e.target.value))}
                          disabled={renewing}
                          style={{ padding: '0.55rem 0.7rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)' }}
                        >
                          <option value={1}>Gia hạn 1 tháng</option>
                          <option value={2}>Gia hạn 2 tháng</option>
                          <option value={3}>Gia hạn 3 tháng</option>
                        </select>
                        <button
                          className="user-dashboard-btn-detail"
                          onClick={() => handleRenew(booking)}
                          disabled={renewing}
                        >
                          {renewing ? 'Đang tạo...' : 'Gia hạn'}
                        </button>
                      </div>
                    )}

                    {(displayStatus === BOOKING_STATUS.COMPLETED || isCancelled || isExpired) && (
                      <button
                        className="user-dashboard-btn-rebook"
                        onClick={() => {
                          if (display.fieldId) navigate(`/fields/${display.fieldId}`);
                          else navigate('/fields');
                        }}
                      >
                        Đặt lại
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="user-dashboard-pagination">
            <button
              className="user-dashboard-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`user-dashboard-page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="user-dashboard-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default BookingsTab;
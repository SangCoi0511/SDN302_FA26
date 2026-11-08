import { useState, useEffect, useMemo } from 'react';
import {
  getManagerBookings,
  confirmDeposit,
  cancelManagerBooking,
  confirmPayment,
  updateBookingDetailStatus,
} from '../../../services/managerService';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/ManagerFieldsPage.css';
import '../../../styles/ManagerBookingsPage.css';

// ─── helpers ────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatCurrency = (amount) =>
  (amount || 0).toLocaleString('vi-VN') + 'đ';

// ─── config ──────────────────────────────────────────────────────────────────

const BOOKING_STATUS_CONFIG = {
  Pending: { label: 'Chờ xác nhận', className: 'status-pending' },
  Confirmed: { label: 'Đã xác nhận', className: 'status-confirmed' },
  Cancelled: { label: 'Đã hủy', className: 'status-cancelled' },
};

const PAYMENT_STATUS_CONFIG = {
  Unpaid: { label: 'Chưa thanh toán', className: 'payment-unpaid' },
  Paid: { label: 'Đã thanh toán', className: 'payment-paid' },
};

const DETAIL_STATUS_CONFIG = {
  Active: { label: 'Đang hoạt động', className: 'detail-active' },
  Cancelled: { label: 'Đã hủy', className: 'detail-cancelled' },
  Completed: { label: 'Hoàn thành', className: 'detail-completed' },
};

const BOOKING_FILTERS = [
  { key: '', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ xác nhận' },
  { key: 'Confirmed', label: 'Đã xác nhận' },
  { key: 'Cancelled', label: 'Đã hủy' },
];

const ITEMS_PER_PAGE = 5;

// ─── component ───────────────────────────────────────────────────────────────

const ManagerBookingsPage = () => {
  const notification = useNotification();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // bookingId or detailId being processed
  const [confirmModal, setConfirmModal] = useState(null); // { type, bookingId?, detailId?, message, onConfirm }

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    const res = await getManagerBookings();
    if (res.success) {
      setBookings(Array.isArray(res.data) ? res.data : []);
    } else {
      setError(res.error || 'Lỗi tải danh sách đặt sân');
    }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  // ── filter / pagination ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = bookings;

    if (statusFilter) {
      list = list.filter((b) => b.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.customer?.name?.toLowerCase().includes(q) ||
          b.customer?.email?.toLowerCase().includes(q) ||
          b.customer?.phone?.toLowerCase().includes(q) ||
          b.id?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [bookings, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = safePage - 1;
    let end = safePage + 2;
    if (start < 1) {
      start = 1;
      end = 4;
    } else if (end > totalPages) {
      end = totalPages;
      start = totalPages - 3;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleFilterChange = (key) => { setStatusFilter(key); setCurrentPage(1); };

  // ── stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'Pending').length,
    confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
  }), [bookings]);

  // ── actions ───────────────────────────────────────────────────────────────

  const handleConfirmDeposit = (bookingId) => {
    setConfirmModal({
      type: 'confirm-deposit',
      bookingId,
      message: 'Xác nhận đã nhận được tiền cọc từ khách hàng?\nBooking sẽ chuyển sang trạng thái "Đã xác nhận".',
      confirmLabel: 'Xác nhận cọc',
      confirmClass: 'btn-success',
      onConfirm: async () => {
        setActionLoading(bookingId);
        const res = await confirmDeposit(bookingId);
        setActionLoading(null);
        if (res.success) {
          notification.success('Xác nhận tiền cọc thành công');
          fetchBookings();
        } else {
          notification.error(res.error || 'Lỗi xác nhận tiền cọc');
        }
      },
    });
  };

  const handleCancelBooking = (bookingId) => {
    setConfirmModal({
      type: 'cancel-booking',
      bookingId,
      message: 'Xác nhận hủy booking do không nhận được tiền cọc?\nHành động này không thể hoàn tác.',
      confirmLabel: 'Hủy booking',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        setActionLoading(bookingId);
        const res = await cancelManagerBooking(bookingId);
        setActionLoading(null);
        if (res.success) {
          notification.success('Đã hủy booking');
          fetchBookings();
        } else {
          notification.error(res.error || 'Lỗi hủy booking');
        }
      },
    });
  };

  const handleConfirmPayment = (bookingId) => {
    setConfirmModal({
      type: 'confirm-payment',
      bookingId,
      message: 'Xác nhận khách hàng đã thanh toán toàn bộ tiền sân?\nBooking sẽ chuyển sang trạng thái "Đã thanh toán".',
      confirmLabel: 'Xác nhận thanh toán',
      confirmClass: 'btn-success',
      onConfirm: async () => {
        setActionLoading(bookingId);
        const res = await confirmPayment(bookingId);
        setActionLoading(null);
        if (res.success) {
          notification.success('Xác nhận thanh toán thành công');
          fetchBookings();
        } else {
          notification.error(res.error || 'Lỗi xác nhận thanh toán');
        }
      },
    });
  };

  const handleUpdateDetailStatus = (detailId, newStatus, slotLabel) => {
    const actionText = newStatus === 'Cancelled'
      ? `hủy slot này (khách không đến)`
      : `đánh dấu slot này là hoàn thành`;
    setConfirmModal({
      type: 'update-detail',
      detailId,
      message: `Bạn muốn ${actionText}?\n${slotLabel}`,
      confirmLabel: newStatus === 'Cancelled' ? 'Hủy slot' : 'Hoàn thành slot',
      confirmClass: newStatus === 'Cancelled' ? 'btn-danger' : 'btn-success',
      onConfirm: async () => {
        setActionLoading(detailId);
        const res = await updateBookingDetailStatus(detailId, newStatus);
        setActionLoading(null);
        if (res.success) {
          notification.success('Cập nhật trạng thái slot thành công');
          fetchBookings();
        } else {
          notification.error(res.error || 'Lỗi cập nhật trạng thái slot');
        }
      },
    });
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="manager-page">
      {/* Page title
      <div className="bookings-page-header">
        <h1 className="bookings-page-title">

          Quản lý đặt sân
        </h1>
        <p className="bookings-page-subtitle">
          Xác nhận tiền cọc, thanh toán và theo dõi trạng thái các slot
        </p>
      </div> */}
      {/* Stats bar */}
      <div className="fields-stats">
        <div className="field-stat-card">
          <div className="field-stat-icon total"><span className="material-symbols-outlined">calendar_month</span></div>
          <div><div className="field-stat-value">{stats.total}</div><div className="field-stat-label">Tổng đặt sân</div></div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon maintenance"><span className="material-symbols-outlined">schedule</span></div>
          <div><div className="field-stat-value">{stats.pending}</div><div className="field-stat-label">Chờ xác nhận</div></div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon active"><span className="material-symbols-outlined">check_circle</span></div>
          <div><div className="field-stat-value">{stats.confirmed}</div><div className="field-stat-label">Đã xác nhận</div></div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon closed"><span className="material-symbols-outlined">cancel</span></div>
          <div><div className="field-stat-value">{stats.cancelled}</div><div className="field-stat-label">Đã hủy</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="manager-toolbar">
        <div className="manager-search-box">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="manager-filter-tabs">
          {BOOKING_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-tab ${statusFilter === f.key ? 'active' : ''}`}
              onClick={() => handleFilterChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button className="btn-icon" onClick={fetchBookings} title="Làm mới">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="manager-loading">
          <span className="material-symbols-outlined spin">progress_activity</span>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="manager-error">
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
          <button className="btn-secondary" onClick={fetchBookings}>Thử lại</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="manager-empty">
          <span className="material-symbols-outlined">inbox</span>
          <p>Không có đặt sân nào{searchTerm || statusFilter ? ' phù hợp' : ''}</p>
        </div>
      ) : (
        <>
          {/* Booking list */}
          <div className="bookings-list">
            {paginated.map((booking) => {
              const bookingStatus = BOOKING_STATUS_CONFIG[booking.status] || { label: booking.status, className: '' };
              const paymentStatus = PAYMENT_STATUS_CONFIG[booking.statusPayment] || { label: booking.statusPayment, className: '' };
              const isExpanded = expandedId === booking.id;
              const isActing = actionLoading === booking.id;

              return (
                <div key={booking.id} className={`booking-card ${isExpanded ? 'expanded' : ''}`}>
                  {/* Card header */}
                  <div
                    className="booking-card-header"
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    {/* Customer info + badges */}
                    <div className="booking-customer">
                      <div className="customer-avatar">
                        {booking.customer?.image
                          ? <img src={booking.customer.image} alt={booking.customer.name} />
                          : <span className="material-symbols-outlined">person</span>}
                      </div>
                      <div className="customer-info">
                        <p className="customer-name">{booking.customer?.name || 'N/A'}</p>
                        <p className="customer-contact">{booking.customer?.email}</p>
                        <p className="customer-contact">{booking.customer?.phone}</p>
                        <div className="booking-badges">
                          <span className={`status-badge ${bookingStatus.className}`}>{bookingStatus.label}</span>
                          <span className={`payment-badge ${paymentStatus.className}`}>{paymentStatus.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price + date */}
                    <div className="booking-price">
                      <p className="price-total">{formatCurrency(booking.totalPrice)}</p>
                      <p className="price-deposit">Cọc: {formatCurrency(booking.depositAmount)}</p>
                      <p className="booking-date">Tạo lúc: {booking.createdAt ? formatDateTime(booking.createdAt) : 'N/A'}</p>
                    </div>

                    {/* Slot count */}
                    <div className="booking-slots-info">
                      <span className="slots-pill">
                        <span className="material-symbols-outlined">event_available</span>
                        {booking.bookingDetails?.length || 0} slot
                      </span>
                    </div>

                    {/* Expand icon */}
                    <span className={`material-symbols-outlined expand-icon ${isExpanded ? 'rotated' : ''}`}>
                      expand_more
                    </span>
                  </div>

                  {/* Booking actions — chỉ hiện khi có action cần thực hiện */}
                  {(booking.status === 'Pending' ||
                    (booking.status === 'Confirmed' && booking.statusPayment === 'Unpaid') ||
                    isActing) && (
                      <div className="booking-actions">
                        {booking.status === 'Pending' && (
                          <>
                            <button
                              className="btn-action btn-success"
                              disabled={isActing}
                              onClick={(e) => { e.stopPropagation(); handleConfirmDeposit(booking.id); }}
                              title="Đã nhận tiền cọc → Xác nhận booking"
                            >
                              <span className="material-symbols-outlined">check_circle</span>
                              Xác nhận cọc
                            </button>
                            <button
                              className="btn-action btn-danger"
                              disabled={isActing}
                              onClick={(e) => { e.stopPropagation(); handleCancelBooking(booking.id); }}
                              title="Không nhận được cọc → Hủy booking"
                            >
                              <span className="material-symbols-outlined">cancel</span>
                              Hủy booking
                            </button>
                          </>
                        )}
                        {booking.status === 'Confirmed' && booking.statusPayment === 'Unpaid' && (
                          <button
                            className="btn-action btn-success"
                            disabled={isActing}
                            onClick={(e) => { e.stopPropagation(); handleConfirmPayment(booking.id); }}
                            title="Khách đã thanh toán đủ tiền sân"
                          >
                            <span className="material-symbols-outlined">paid</span>
                            Xác nhận thanh toán
                          </button>
                        )}
                        {isActing && (
                          <span className="material-symbols-outlined spin action-spinner">progress_activity</span>
                        )}
                      </div>
                    )}

                  {/* Expanded: booking detail slots */}
                  {isExpanded && (
                    <div className="booking-details-panel">
                      <p className="details-heading">
                        <span className="material-symbols-outlined">event</span>
                        Chi tiết các slot đặt sân
                      </p>
                      <div className="details-table-wrapper">
                        <table className="details-table">
                          <thead>
                            <tr>
                              <th>Sân</th>
                              <th>Bắt đầu</th>
                              <th>Kết thúc</th>
                              <th>Giá</th>
                              <th>Trạng thái</th>
                              {booking.status === 'Confirmed' && <th>Hành động</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {booking.bookingDetails?.map((detail) => {
                              const detailStatus = DETAIL_STATUS_CONFIG[detail.status] || { label: detail.status, className: '' };
                              const isDetailActing = actionLoading === detail.id;
                              const slotLabel = `${detail.fieldName} | ${formatDateTime(detail.startTime)} → ${formatDateTime(detail.endTime)}`;

                              return (
                                <tr key={detail.id}>
                                  <td>
                                    <p className="detail-field-name">{detail.fieldName}</p>
                                    <p className="detail-field-addr">{detail.fieldAddress}</p>
                                  </td>
                                  <td>{formatDateTime(detail.startTime)}</td>
                                  <td>{formatDateTime(detail.endTime)}</td>
                                  <td>{formatCurrency(detail.price)}</td>
                                  <td>
                                    <span className={`detail-badge ${detailStatus.className}`}>
                                      {detailStatus.label}
                                    </span>
                                  </td>
                                  {booking.status === 'Confirmed' && (
                                    <td>
                                      {detail.status === 'Active' ? (
                                        <div className="detail-actions">
                                          <button
                                            className="btn-detail btn-danger"
                                            disabled={isDetailActing}
                                            onClick={() => handleUpdateDetailStatus(detail.id, 'Cancelled', slotLabel)}
                                            title="Khách không đến"
                                          >
                                            <span className="material-symbols-outlined">person_off</span>
                                            Không đến
                                          </button>
                                          <button
                                            className="btn-detail btn-success"
                                            disabled={isDetailActing}
                                            onClick={() => handleUpdateDetailStatus(detail.id, 'Completed', slotLabel)}
                                            title="Slot đã hoàn thành"
                                          >
                                            <span className="material-symbols-outlined">sports_score</span>
                                            Hoàn thành
                                          </button>
                                          {isDetailActing && (
                                            <span className="material-symbols-outlined spin">progress_activity</span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="detail-no-action">—</span>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="manager-pagination-centered">
              <button
                className="page-btn"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === safePage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined modal-icon">
              {confirmModal.confirmClass === 'btn-danger' ? 'warning' : 'help'}
            </span>
            <div className="modal-message">
              {confirmModal.message.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setConfirmModal(null)}>Huỷ</button>
              <button
                className={`btn-action ${confirmModal.confirmClass}`}
                onClick={async () => {
                  const fn = confirmModal.onConfirm;
                  setConfirmModal(null);
                  await fn();
                }}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerBookingsPage;

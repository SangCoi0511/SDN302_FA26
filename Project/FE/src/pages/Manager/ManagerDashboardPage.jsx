import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardSummary,
  getRecentBookings,
  getTopFields,
  getTopCustomers,
  confirmDeposit,
  confirmPayment,
} from '../../services/managerService';
import '../../styles/ManagerDashboard.css';
import '../../styles/ManagerFieldsPage.css';

// ============================================================================
// HELPERS
// ============================================================================

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${time} - ${date}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusInfo = (status) => {
  switch (status) {
    case 'Confirmed': case 'confirmed': return { key: 'confirmed', label: 'Đã xác nhận' };
    case 'Pending':   case 'pending':   return { key: 'pending',   label: 'Chờ xác nhận' };
    case 'Cancelled': case 'cancelled': return { key: 'cancelled', label: 'Đã hủy' };
    case 'Completed': case 'completed': return { key: 'completed', label: 'Hoàn thành' };
    default: return { key: 'pending', label: status || 'Chờ xác nhận' };
  }
};

const getPaymentStatusInfo = (status) => {
  switch (status) {
    case 'Paid':   return { key: 'confirmed', label: 'Đã thanh toán' };
    case 'Unpaid': return { key: 'pending',   label: 'Chưa thanh toán' };
    default:       return { key: 'pending',   label: status || 'N/A' };
  }
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
};

const SHORTCUTS = [
  { icon: 'stadium',       title: 'Quản lý sân',        desc: 'Cập nhật thông tin & trạng thái sân', link: '/admin/fields',    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80' },
  { icon: 'calendar_month',title: 'Quản lý đặt sân',    desc: 'Theo dõi, xác nhận & xử lý đơn đặt sân',     link: '/admin/bookings',  image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
  { icon: 'people_alt',    title: 'Quản lý khách hàng', desc: 'Quản lý người dùng & lịch sử đặt',   link: '/admin/customers', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80' },
  { icon: 'rate_review',   title: 'Xem Feedback',       desc: 'Xem và xử lý góp ý từ khách hàng',   link: '/admin/feedback',  image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80' },
];

// ============================================================================
// COMPONENT
// ============================================================================

const ManagerDashboardPage = () => {
  const [summary, setSummary]             = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [topFields, setTopFields]         = useState([]);
  const [topCustomers, setTopCustomers]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // Pagination for Recent Bookings
  const [bookingPage, setBookingPage] = useState(1);
  const BOOKINGS_PER_PAGE = 8;

  // Booking detail modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const handleConfirmDeposit = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    setActionMsg(null);
    const res = await confirmDeposit(selectedBooking._id);
    if (res.success) {
      setRecentBookings(prev => prev.map(b =>
        b._id === selectedBooking._id ? { ...b, status: 'Confirmed' } : b
      ));
      setSelectedBooking(prev => ({ ...prev, status: 'Confirmed' }));
      setActionMsg({ type: 'success', text: 'Xác nhận tiền cọc thành công!' });
    } else {
      setActionMsg({ type: 'error', text: res.error || 'Xác nhận thất bại.' });
    }
    setActionLoading(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    setActionMsg(null);
    const res = await confirmPayment(selectedBooking._id);
    if (res.success) {
      setRecentBookings(prev => prev.map(b =>
        b._id === selectedBooking._id ? { ...b, statusPayment: 'Paid' } : b
      ));
      setSelectedBooking(prev => ({ ...prev, statusPayment: 'Paid' }));
      setActionMsg({ type: 'success', text: 'Xác nhận thanh toán thành công!' });
    } else {
      setActionMsg({ type: 'error', text: res.error || 'Xác nhận thất bại.' });
    }
    setActionLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const [summaryRes, bookingsRes, topFieldsRes, topCustomersRes] = await Promise.all([
        getDashboardSummary(),
        getRecentBookings(1000),
        getTopFields(5),
        getTopCustomers(5),
      ]);

      if (summaryRes.success)      setSummary(summaryRes.data);
      else                         setError(summaryRes.error);

      if (bookingsRes.success) {
        const sorted = (bookingsRes.data || []).slice().sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentBookings(sorted);
      }
      if (topFieldsRes.success)    setTopFields(topFieldsRes.data || []);
      if (topCustomersRes.success) setTopCustomers(topCustomersRes.data || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  // Build stat cards from summary data
  const revenueStats = summary?.revenueStats || {};
  const stats = summary
    ? [
        {
          icon: 'stadium', iconBg: 'green', label: 'Tổng số sân',
          value: summary.totalFields ?? 0,
          note: 'Sân đang hoạt động trong hệ thống',
          dotColor: 'green',
        },
        {
          icon: 'person', iconBg: 'blue', label: 'Tổng khách hàng',
          value: summary.totalCustomers ?? 0,
          note: 'Khách hàng đã đăng ký',
          dotColor: 'green',
        },
        {
          icon: 'calendar_month', iconBg: 'amber', label: 'Tổng đặt sân',
          value: summary.totalBookings ?? 0,
          note: 'Tổng số lượt đặt sân',
          dotColor: 'green',
        },
        {
          icon: 'reviews', iconBg: 'purple', label: 'Tổng feedback',
          value: summary.totalFeedbacks ?? 0,
          note: 'Đánh giá từ khách hàng',
          dotColor: 'green',
        },
        {
          icon: 'payments', iconBg: 'teal', label: 'Doanh thu (đã thu)',
          value: revenueStats.totalPaidRevenue ?? 0,
          isCurrency: true,
          note: `Tổng: ${formatCurrency(revenueStats.totalRevenue ?? 0)}`,
          dotColor: 'green',
        },
        {
          icon: 'savings', iconBg: 'orange', label: 'Đã đặt cọc',
          value: revenueStats.totalDeposit ?? 0,
          isCurrency: true,
          note: 'Tổng tiền cọc thu được',
          dotColor: 'green',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="manager-dashboard">
        <div className="dashboard-loading">
          <span className="material-symbols-outlined loading-spin">progress_activity</span>
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-dashboard">
      {error && (
        <div className="dashboard-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="dashboard-stats dashboard-stats-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="field-stat-card">
              <div className={`field-stat-icon ${stat.iconBg}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <div className="field-stat-value">
                  {stat.isCurrency
                    ? formatCurrency(stat.value)
                    : stat.value.toLocaleString('vi-VN')}
                </div>
                <div className="field-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shortcuts */}
      <div className="dashboard-shortcuts">
        <h2 className="dashboard-section-title">
          <span className="material-symbols-outlined">bolt</span>
          Truy cập nhanh
        </h2>
        <div className="shortcuts-grid">
          {SHORTCUTS.map((sc, idx) => (
            <Link key={idx} to={sc.link} className="shortcut-card">
              <div className="shortcut-overlay" />
              <div className="shortcut-bg" style={{ backgroundImage: `url("${sc.image}")` }} />
              <div className="shortcut-content">
                <div className="shortcut-icon-wrapper">
                  <span className="material-symbols-outlined">{sc.icon}</span>
                </div>
                <p className="shortcut-title">{sc.title}</p>
                <p className="shortcut-desc">{sc.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Fields & Top Customers */}
      <div className="dashboard-top-grid">
        {/* Top Fields */}
        <div className="dashboard-table-card">
          <div className="table-header">
            <h3 className="table-title">
              <span className="material-symbols-outlined">emoji_events</span>
              Top sân doanh thu cao
            </h3>
            
          </div>
          <div className="table-wrapper">
            {topFields.length === 0 ? (
              <div className="dashboard-empty">
                <span className="material-symbols-outlined">stadium</span>
                <p>Chưa có dữ liệu sân.</p>
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên sân</th>
                    <th>Lượt đặt</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topFields.map((field, idx) => (
                    <tr key={field._id || idx}>
                      <td className="rank-cell">
                        <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                      </td>
                      <td className="field-cell">{field.fieldName || 'N/A'}</td>
                      <td className="count-cell">{field.bookingCount ?? 0}</td>
                      <td className="price-cell">{formatCurrency(field.totalRevenue ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="dashboard-table-card">
          <div className="table-header">
            <h3 className="table-title">
              <span className="material-symbols-outlined">workspace_premium</span>
              Top khách hàng chi tiêu nhiều
            </h3>
            
          </div>
          <div className="table-wrapper">
            {topCustomers.length === 0 ? (
              <div className="dashboard-empty">
                <span className="material-symbols-outlined">person</span>
                <p>Chưa có dữ liệu khách hàng.</p>
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Khách hàng</th>
                    <th>Lượt đặt</th>
                    <th>Chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer, idx) => {
                    const name = customer.customerName || customer.name || 'Khách hàng';
                    return (
                      <tr key={customer._id || idx}>
                        <td className="rank-cell">
                          <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-initials">
                              {customer.image ? (
                                <img src={customer.image} alt={name} className="customer-avatar-img" />
                              ) : (
                                getInitials(name)
                              )}
                            </div>
                            <div>
                              <span className="customer-name">{name}</span>
                              {customer.email && (
                                <p className="customer-email">{customer.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="count-cell">{customer.bookingCount ?? 0}</td>
                        <td className="price-cell">{formatCurrency(customer.totalSpent ?? 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      {/* <div className="dashboard-table-card">
        <div className="table-header">
          <h3 className="table-title">Đặt sân gần đây</h3>
        </div>
        <div className="table-wrapper">
          {recentBookings.length === 0 ? (
            <div className="dashboard-empty">
              <span className="material-symbols-outlined">calendar_today</span>
              <p>Chưa có đặt sân nào gần đây.</p>
            </div>
          ) : (() => {
            const totalPages = Math.ceil(recentBookings.length / BOOKINGS_PER_PAGE);
            const paginated  = recentBookings.slice(
              (bookingPage - 1) * BOOKINGS_PER_PAGE,
              bookingPage * BOOKINGS_PER_PAGE
            );
            return (
              <>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Số lượt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thanh toán</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((booking, idx) => {
                      const customerName =
                        booking.customerName || booking.customer?.name ||
                        booking.customerID?.name || 'Khách hàng';
                      const timeStr    = formatDateTime(booking.createdAt);
                      const statusInfo = getStatusInfo(booking.status);
                      const payInfo    = getPaymentStatusInfo(booking.statusPayment);
                      return (
                        <tr key={booking._id || idx}
                          className="db-row-clickable"
                          onClick={() => { setSelectedBooking(booking); setActionMsg(null); }}
                        >
                          <td>
                            <div className="customer-cell">
                              <div className="customer-initials">
                                {booking.image ? (
                                  <img src={booking.image} alt={customerName} className="customer-avatar-img" />
                                ) : (
                                  getInitials(customerName)
                                )}
                              </div>
                              <div>
                                <span className="customer-name">{customerName}</span>
                                {booking.email && (
                                  <p className="customer-email">{booking.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="count-cell">{booking.bookingCount ?? 1}</td>
                          <td className="price-cell">{formatCurrency(booking.totalPrice ?? 0)}</td>
                          <td>
                            <span className={`status-badge ${statusInfo.key}`}>{statusInfo.label}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${payInfo.key}`}>{payInfo.label}</span>
                          </td>
                          <td className="time-cell">{timeStr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table> */}

                {/* Pagination */}
                {/* {totalPages > 1 && (
                  <div className="fields-pagination">
                    <div className="fields-pagination-info">
                      Hiển thị{' '}
                      <span className="fields-pagination-bold">
                        {(bookingPage - 1) * BOOKINGS_PER_PAGE + 1}–{Math.min(bookingPage * BOOKINGS_PER_PAGE, recentBookings.length)}
                      </span>{' '}
                      của{' '}
                      <span className="fields-pagination-bold">{recentBookings.length}</span> đơn đặt sân
                    </div>
                    <div className="fields-pagination-buttons">
                      <button
                        className="fields-page-btn"
                        disabled={bookingPage === 1}
                        onClick={() => setBookingPage(p => p - 1)}
                      >Trước</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`fields-page-btn ${bookingPage === page ? 'active' : ''}`}
                          onClick={() => setBookingPage(page)}
                        >{page}</button>
                      ))}
                      <button
                        className="fields-page-btn"
                        disabled={bookingPage === totalPages}
                        onClick={() => setBookingPage(p => p + 1)}
                      >Sau</button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div> */}

      {/* ===== Booking Detail Modal ===== */}
      {selectedBooking && (() => {
        const b = selectedBooking;
        const customerName = b.customerName || b.customer?.name || 'Khách hàng';
        const statusInfo = getStatusInfo(b.status);
        const payInfo    = getPaymentStatusInfo(b.statusPayment);
        const canConfirmDeposit  = b.status === 'Pending';
        const canConfirmPayment  = b.status === 'Confirmed' && b.statusPayment === 'Unpaid';
        return (
          <div className="db-modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="db-modal" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="db-modal-header">
                <h3 className="db-modal-title">
                  <span className="material-symbols-outlined">receipt_long</span>
                  Chi tiết đơn đặt sân
                </h3>
                <button className="db-modal-close" onClick={() => setSelectedBooking(null)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="db-modal-body">
                {/* Customer Info */}
                <div className="db-modal-section">
                  <div className="db-modal-section-title">
                    <span className="material-symbols-outlined">person</span>
                    Thông tin khách hàng
                  </div>
                  <div className="db-modal-customer">
                    <div className="db-modal-avatar">
                      {b.image
                        ? <img src={b.image} alt={customerName} />
                        : <span>{getInitials(customerName)}</span>
                      }
                    </div>
                    <div className="db-modal-customer-info">
                      <div className="db-modal-customer-name">{customerName}</div>
                      <div className="db-modal-customer-meta">
                        <span className="material-symbols-outlined">email</span>
                        {b.email || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="db-modal-section">
                  <div className="db-modal-section-title">
                    <span className="material-symbols-outlined">event_note</span>
                    Thông tin đặt sân
                  </div>
                  <div className="db-modal-grid">
                    <div className="db-modal-field db-modal-field-full">
                      <span className="db-modal-label">Sân đã đặt</span>
                      <span className="db-modal-value">
                        {(b.fieldNames && b.fieldNames.length > 0)
                          ? b.fieldNames.join(', ')
                          : '—'}
                      </span>
                    </div>
                    <div className="db-modal-field">
                      <span className="db-modal-label">Ngày đặt</span>
                      <span className="db-modal-value">{formatDate(b.bookingDate)}</span>
                    </div>
                    <div className="db-modal-field">
                      <span className="db-modal-label">Ngày tạo đơn</span>
                      <span className="db-modal-value">{formatDateTime(b.createdAt)}</span>
                    </div>
                    <div className="db-modal-field">
                      <span className="db-modal-label">Tổng tiền</span>
                      <span className="db-modal-value db-modal-price">{formatCurrency(b.totalPrice ?? 0)}</span>
                    </div>
                    <div className="db-modal-field">
                      <span className="db-modal-label">Số lượt</span>
                      <span className="db-modal-value">{b.bookingCount ?? 1} lượt</span>
                    </div>
                    <div className="db-modal-field">
                      <span className="db-modal-label">Trạng thái</span>
                      <span className={`status-badge ${statusInfo.key}`}>{statusInfo.label}</span>
                    </div>
                    <div className="db-modal-field">
                      <span className="db-modal-label">Thanh toán</span>
                      <span className={`status-badge ${payInfo.key}`}>{payInfo.label}</span>
                    </div>
                  </div>
                </div>

                {/* Action Message */}
                {actionMsg && (
                  <div className={`db-modal-msg ${actionMsg.type}`}>
                    <span className="material-symbols-outlined">
                      {actionMsg.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {actionMsg.text}
                  </div>
                )}

                {/* Actions */}
                {(canConfirmDeposit || canConfirmPayment) && (
                  <div className="db-modal-section">
                    <div className="db-modal-section-title">
                      <span className="material-symbols-outlined">manage_accounts</span>
                      Thay đổi trạng thái
                    </div>
                    <div className="db-modal-actions">
                      {canConfirmDeposit && (
                        <button
                          className="db-modal-btn confirm-deposit"
                          disabled={actionLoading}
                          onClick={handleConfirmDeposit}
                        >
                          <span className="material-symbols-outlined">payments</span>
                          {actionLoading ? 'Đang xử lý...' : 'Xác nhận đã nhận cọc'}
                        </button>
                      )}
                      {canConfirmPayment && (
                        <button
                          className="db-modal-btn confirm-payment"
                          disabled={actionLoading}
                          onClick={handleConfirmPayment}
                        >
                          <span className="material-symbols-outlined">paid</span>
                          {actionLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán đầy đủ'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ManagerDashboardPage;
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, getCustomerStats, updateCustomerStatus } from '../../../services/managerService';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/ManagerCustomersPage.css';
import '../../../styles/ManagerFieldsPage.css';

/**
 * Format date string to dd/MM/yyyy
 */
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Customer status options for filter dropdown
 * BE chỉ hỗ trợ Active và Banned
 */
const CUSTOMER_STATUSES = [
  { key: '', label: 'Tất cả trạng thái' },
  { key: 'Active', label: 'Đang hoạt động' },
  { key: 'Banned', label: 'Đã bị khóa' },
];

/**
 * Status display config — key khớp với BE (capitalized)
 */
const STATUS_CONFIG = {
  Active: { label: 'Đang hoạt động', className: 'active' },
  Banned: { label: 'Đã bị khóa', className: 'closed' },
};

const ManagerCustomersPage = () => {
  const notification = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState(null);

  // API state
  const [rawCustomers, setRawCustomers] = useState([]);
  const [apiStats, setApiStats] = useState(null);
  const [loading, setLoading] = useState(true);  // eslint-disable-line no-unused-vars
  const [error, setError] = useState(null);

  const customersPerPage = 8;

  // Fetch data on mount — dùng server-side params thay vì load tất cả rồi filter FE
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const [custRes, statsRes] = await Promise.all([
        getCustomers({ limit: 1000 }),   // tải đủ để search/filter phía FE
        getCustomerStats(),
      ]);
      // BE trả về { success, data: [...], pagination }
      if (custRes.success) setRawCustomers(Array.isArray(custRes.data) ? custRes.data : []);
      else setError(custRes.error);
      if (statsRes.success) setApiStats(statsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Normalise API customers — giữ nguyên status từ BE (capitalized: Active/Banned)
  const allCustomers = useMemo(() => rawCustomers.map((user) => {
    // BE trả về status: 'Active' hoặc 'Banned'
    const status = user.status || 'Active';

    return {
      id: user._id,
      name: user.name || user.fullName || 'N/A',
      email: user.email,
      phone: user.phone || 'N/A',
      image: user.image || user.avatar,
      status,
      createdAt: user.createdAt,
      completedCount: Number.isFinite(user.completedCount) ? user.completedCount : 0,
      cancelledCount: Number.isFinite(user.cancelledCount) ? user.cancelledCount : 0,
    };
  }), [rawCustomers]);

  // Filter logic
  const filteredCustomers = useMemo(() => allCustomers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.phone.includes(term);
    const matchStatus = !statusFilter || customer.status === statusFilter;
    return matchSearch && matchStatus;
  }), [allCustomers, searchTerm, statusFilter]);

  // Stats từ API hoặc derive từ data
  const stats = useMemo(() => {
    if (apiStats) {
      return {
        total: apiStats.totalCustomers ?? allCustomers.length,
        active: apiStats.activeCustomers ?? allCustomers.filter((c) => c.status === 'Active').length,
        banned: apiStats.bannedCustomers ?? allCustomers.filter((c) => c.status === 'Banned').length,
      };
    }
    return {
      total: allCustomers.length,
      active: allCustomers.filter((c) => c.status === 'Active').length,
      banned: allCustomers.filter((c) => c.status === 'Banned').length,
    };
  }, [apiStats, allCustomers]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / customersPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCustomers = filteredCustomers.slice(
    (safePage - 1) * customersPerPage,
    safePage * customersPerPage
  );

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

  const handleToggleStatus = (customer) => setConfirmModal({ type: 'toggle', customer });
  const handleBan = (customer) => setConfirmModal({ type: 'ban', customer });

  const handleConfirm = async () => {
    if (!confirmModal) return;
    const { type, customer } = confirmModal;

    // BE chỉ hỗ trợ 'Active' và 'Banned' (capitalized)
    let newStatus;
    if (type === 'ban') {
      newStatus = 'Banned';
    } else {
      // toggle: Active ↔ Banned
      newStatus = customer.status === 'Active' ? 'Banned' : 'Active';
    }

    const res = await updateCustomerStatus(customer.id, newStatus);
    if (res.success) {
      // Cập nhật local state ngay không cần refetch
      setRawCustomers((prev) =>
        prev.map((u) => u._id === customer.id ? { ...u, status: newStatus } : u)
      );
      // Cập nhật stats
      setApiStats((prev) => {
        if (!prev) return prev;
        const wasActive = customer.status === 'Active';
        const wasBanned = customer.status === 'Banned';
        return {
          ...prev,
          activeCustomers: prev.activeCustomers + (newStatus === 'Active' ? 1 : wasActive ? -1 : 0),
          bannedCustomers: prev.bannedCustomers + (newStatus === 'Banned' ? 1 : wasBanned ? -1 : 0),
        };
      });
      notification.success('Trạng thái tài khoản đã được cập nhật.');
    } else {
      notification.error(res.error || 'Cập nhật thất bại.');
    }
    setConfirmModal(null);
  };

  return (
    <div className="manager-customers-page">
      {/* Top Bar */}
      {/* <div className="customers-top-bar">
        <div>
          <h2 className="customers-page-title">Quản lý khách hàng</h2>
          <p className="customers-page-subtitle">Danh sách tài khoản người dùng trên hệ thống</p>
        </div>
      </div> */}

      {error && (
        <div className="customers-error-banner">
          <span className="material-symbols-outlined">error</span> {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="customers-stats">
        <div className="field-stat-card">
          <div className="field-stat-icon total">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <div className="field-stat-value">{stats.total}</div>
            <div className="field-stat-label">Tổng khách hàng</div>
          </div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon active">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <div className="field-stat-value">{stats.active}</div>
            <div className="field-stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon closed">
            <span className="material-symbols-outlined">block</span>
          </div>
          <div>
            <div className="field-stat-value">{stats.banned}</div>
            <div className="field-stat-label">Đã bị khóa</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filters */}
      <div className="customers-toolbar">
        <div className="customers-search">
          <span className="material-symbols-outlined customers-search-icon">search</span>
          <input
            type="text"
            className="customers-search-input"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="customers-filters">
          <select
            className="customers-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {CUSTOMER_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="customers-table-card">
        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Ngày tạo</th>
                <th className="customers-th-center">Hoàn thành</th>
                <th className="customers-th-center">Đã hủy</th>
                <th>Trạng thái</th>
                <th className="customers-th-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => {
                const statusCfg = STATUS_CONFIG[customer.status];
                return (
                  <tr key={customer.id} className="customers-row">
                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.image ? (
                            <img src={customer.image} alt={customer.name} />
                          ) : (
                            <div className="customer-avatar-placeholder">
                              <span className="material-symbols-outlined">person</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="customer-name">{customer.name}</div>
                          <div className="customer-id">
                            ID: #{customer.id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="customer-email">{customer.email}</td>
                    <td className="customer-phone">{customer.phone}</td>
                    <td className="customer-date">{formatDate(customer.createdAt)}</td>
                    <td className="customer-count">{customer.completedCount}</td>
                    <td className="customer-count">{customer.cancelledCount}</td>
                    <td>
                      <span className={`status-badge-field ${statusCfg.className}`}>
                        <span className="status-dot" />{statusCfg.label}
                      </span>
                    </td>
                    <td>
                      <div className="customer-actions">
                        <Link
                          to={`/admin/customers/${customer.id}`}
                          className="customer-action-btn view"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </Link>
                        {customer.status !== 'Banned' ? (
                          <>
                            <button
                              className="customer-action-btn ban"
                              title="Khóa tài khoản"
                              onClick={() => handleBan(customer)}
                            >
                              <span className="material-symbols-outlined">block</span>
                            </button>
                          </>
                        ) : (
                          <button
                            className="customer-action-btn unban"
                            title="Mở khóa tài khoản"
                            onClick={() => handleToggleStatus(customer)}
                          >
                            <span className="material-symbols-outlined">lock_open</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan="8" className="customers-empty">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {confirmModal.type === 'ban' ? (
              <>
                <div className="modal-icon danger">
                  <span className="material-symbols-outlined">block</span>
                </div>
                <h3 className="modal-title">Khóa tài khoản</h3>
                <p className="modal-description">
                  Bạn có chắc muốn khóa tài khoản của{' '}
                  <strong>{confirmModal.customer.name}</strong>? Người dùng sẽ không thể đăng
                  nhập và sử dụng dịch vụ.
                </p>
                <div className="modal-actions">
                  <button className="modal-btn cancel" onClick={() => setConfirmModal(null)}>
                    Hủy bỏ
                  </button>
                  <button className="modal-btn confirm-ban" onClick={handleConfirm}>
                    Khóa tài khoản
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-icon warning">
                  <span className="material-symbols-outlined">lock_open</span>
                </div>
                <h3 className="modal-title">Mở khóa tài khoản</h3>
                <p className="modal-description">
                  Bạn có chắc muốn mở khóa tài khoản của{' '}
                  <strong>{confirmModal.customer.name}</strong>? Người dùng sẽ có thể đăng nhập
                  và sử dụng dịch vụ trở lại.
                </p>
                <div className="modal-actions">
                  <button className="modal-btn cancel" onClick={() => setConfirmModal(null)}>
                    Hủy bỏ
                  </button>
                  <button className="modal-btn confirm-toggle" onClick={handleConfirm}>
                    Mở khóa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCustomersPage;
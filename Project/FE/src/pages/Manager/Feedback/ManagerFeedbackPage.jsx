import { useState, useEffect, useMemo } from 'react';
import { getAllFeedbacks } from '../../../services/managerService';
import '../../../styles/ManagerFeedbackPage.css';
import '../../../styles/ManagerFieldsPage.css';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`material-symbols-outlined star-icon ${i <= rating ? 'star-filled' : 'star-empty'}`}
        style={i <= rating ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        star
      </span>
    );
  }
  return stars;
};

const getAddressParts = (address) => {
  const raw = typeof address === 'string' ? address.trim() : '';
  if (!raw) return [];
  return raw.split(',').map((p) => p.trim()).filter(Boolean);
};

const getProvinceLabel = (address) => {
  const parts = getAddressParts(address);
  return parts.length >= 1 ? parts[parts.length - 1] : '';
};

const getDistrictLabel = (address) => {
  const parts = getAddressParts(address);
  return parts.length >= 2 ? parts[parts.length - 2] : '';
};

const ManagerFeedbackPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // API state
  const [rawFeedbacks, setRawFeedbacks] = useState([]);
  const [apiAvgRating, setApiAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const feedbacksPerPage = 10;

  // Tải tất cả feedback — BE đã populate bookingDetailID → fieldID, bookingID.customerID
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      const first = await getAllFeedbacks({ page: 1, limit: 50 });
      if (!first.success) {
        setError(first.error);
        setLoading(false);
        return;
      }

      const pagination = first.rawPagination;
      const totalPages = pagination?.totalPages || 1;
      let all = [...(first.data || [])];

      if (totalPages > 1) {
        const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
        const results = await Promise.all(pages.map((p) => getAllFeedbacks({ page: p, limit: 50 })));
        results.forEach((r) => { if (r.success) all = [...all, ...(r.data || [])]; });
      }

      setRawFeedbacks(all);
      if (first.avgRating != null) setApiAvgRating(first.avgRating);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Normalise — BE populate: bookingDetailID.fieldID.fieldName, bookingDetailID.bookingID.customerID.{name,image}
  const allFeedbacks = useMemo(() =>
    rawFeedbacks.map((fb) => {
      const detail = fb.bookingDetailID;
      const customer = detail?.bookingID?.customerID;
      const fieldAddress = detail?.fieldID?.address || '';
      const provinceLabel = getProvinceLabel(fieldAddress);
      const districtLabel = getDistrictLabel(fieldAddress);
      return {
        _id: fb._id,
        rating: fb.rate || 0,
        comment: fb.content || '',
        createdAt: fb.createdAt,
        customerName: customer?.name || '—',
        customerImage: customer?.image || null,
        fieldName: detail?.fieldID?.fieldName || '—',
        fieldAddress,
        provinceLabel,
        districtLabel,
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [rawFeedbacks]);

  const provinceOptions = useMemo(() => {
    const set = new Set();
    allFeedbacks.forEach((fb) => {
      if (fb.provinceLabel) set.add(fb.provinceLabel);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allFeedbacks]);

  const districtOptions = useMemo(() => {
    if (!provinceFilter) return [];
    const set = new Set();
    allFeedbacks.forEach((fb) => {
      if (fb.provinceLabel !== provinceFilter) return;
      if (fb.districtLabel) set.add(fb.districtLabel);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allFeedbacks, provinceFilter]);

  // Filter
  const filteredFeedbacks = useMemo(() => allFeedbacks.filter((fb) => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term ||
      fb.comment.toLowerCase().includes(term) ||
      fb.customerName.toLowerCase().includes(term) ||
      fb.fieldName.toLowerCase().includes(term) ||
      (fb.fieldAddress || '').toLowerCase().includes(term) ||
      (fb.districtLabel || '').toLowerCase().includes(term) ||
      (fb.provinceLabel || '').toLowerCase().includes(term);

    const matchProvince = !provinceFilter || fb.provinceLabel === provinceFilter;
    const matchDistrict = !districtFilter || fb.districtLabel === districtFilter;
    const matchRating = !ratingFilter || fb.rating === Number(ratingFilter);
    let matchDate = true;
    if (dateFrom) matchDate = matchDate && new Date(fb.createdAt) >= new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      matchDate = matchDate && new Date(fb.createdAt) <= to;
    }
    return matchSearch && matchProvince && matchDistrict && matchRating && matchDate;
  }), [allFeedbacks, searchTerm, provinceFilter, districtFilter, ratingFilter, dateFrom, dateTo]);

  // Stats
  const stats = useMemo(() => {
    const total = allFeedbacks.length;
    const avgRating = apiAvgRating != null
      ? apiAvgRating
      : total > 0
        ? Math.round((allFeedbacks.reduce((s, fb) => s + fb.rating, 0) / total) * 10) / 10
        : 0;
    const lowRating = allFeedbacks.filter((fb) => fb.rating <= 2).length;
    const highRating = allFeedbacks.filter((fb) => fb.rating >= 4).length;
    return { total, avgRating, lowRating, highRating };
  }, [allFeedbacks, apiAvgRating]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / feedbacksPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (safePage - 1) * feedbacksPerPage,
    safePage * feedbacksPerPage
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

  const handleSearch = (v) => { setSearchTerm(v); setCurrentPage(1); };
  const handleDateFromChange = (v) => { setDateFrom(v); setCurrentPage(1); };
  const handleDateToChange = (v) => { setDateTo(v); setCurrentPage(1); };

  return (
    <div className="manager-feedback-page">
      {/* Header */}
      {/* <div className="feedback-top-bar">
        <div>
          <h2 className="feedback-page-title">Quản lý Feedback</h2>
          <p className="feedback-page-subtitle">
            Xem các ý kiến phản hồi từ người dùng hệ thống
          </p>
        </div>
      </div> */}

      {error && (
        <div className="feedback-error-banner">
          <span className="material-symbols-outlined">error</span> {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="feedback-stats">
        <div className="field-stat-card">
          <div className="field-stat-icon total">
            <span className="material-symbols-outlined">reviews</span>
          </div>
          <div>
            <div className="field-stat-value">{stats.total.toLocaleString('vi-VN')}</div>
            <div className="field-stat-label">Tổng feedback</div>
          </div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon active">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
          </div>
          <div>
            <div className="field-stat-value">{stats.avgRating} / 5.0</div>
            <div className="field-stat-label">Đánh giá trung bình</div>
          </div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon maintenance">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
          </div>
          <div>
            <div className="field-stat-value">{stats.highRating}</div>
            <div className="field-stat-label">Đánh giá tốt (≥4 sao)</div>
          </div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon closed">
            <span className="material-symbols-outlined">report</span>
          </div>
          <div>
            <div className="field-stat-value">{stats.lowRating}</div>
            <div className="field-stat-label">Cần chú ý (≤2 sao)</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="feedback-toolbar">
        <div className="feedback-search">
          <span className="material-symbols-outlined feedback-search-icon">search</span>
          <input
            type="text"
            className="feedback-search-input"
            placeholder="Tìm theo tên KH, tên sân, nội dung..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="feedback-date-filters">
          <select
            className="feedback-select"
            value={provinceFilter}
            onChange={(e) => {
              const next = e.target.value;
              setProvinceFilter(next);
              setDistrictFilter('');
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả tỉnh/thành</option>
            {provinceOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            className="feedback-select"
            value={districtFilter}
            disabled={!provinceFilter}
            onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tất cả quận/huyện</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            className="feedback-select"
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tất cả đánh giá</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} sao</option>
            ))}
          </select>
          <div className="feedback-date-field">
            <span className="material-symbols-outlined feedback-date-icon">calendar_month</span>
            <input
              type="date"
              className="feedback-date-input"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
            />
          </div>
          <span className="feedback-date-separator">—</span>
          <div className="feedback-date-field">
            <span className="material-symbols-outlined feedback-date-icon">calendar_month</span>
            <input
              type="date"
              className="feedback-date-input"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="feedback-table-card">
        {loading ? (
          <div className="feedback-loading">
            <span className="material-symbols-outlined loading-spin">progress_activity</span>
            <p>Đang tải danh sách feedback...</p>
          </div>
        ) : (
          <div className="feedback-table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Sân</th>
                  <th>Nội dung</th>
                  <th>Đánh giá</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="feedback-empty-row">
                      <span className="material-symbols-outlined">search_off</span>
                      Không tìm thấy phản hồi nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedFeedbacks.map((fb) => (
                    <tr key={fb._id}>
                      <td>
                        <div className="feedback-user-cell">
                          {fb.customerImage ? (
                            <img
                              src={fb.customerImage}
                              alt={fb.customerName}
                              className="feedback-user-avatar"
                            />
                          ) : (
                            <div className="feedback-user-avatar feedback-user-avatar--placeholder">
                              <span className="material-symbols-outlined">person</span>
                            </div>
                          )}
                          <span className="feedback-customer-name">{fb.customerName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="feedback-field-badge">
                          <span className="material-symbols-outlined">stadium</span>
                          {fb.fieldName}
                        </span>
                      </td>
                      <td>
                        <p className="feedback-comment">{fb.comment}</p>
                      </td>
                      <td>
                        <div className="feedback-stars">{renderStars(fb.rating)}</div>
                      </td>
                      <td className="feedback-date">{formatDate(fb.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
};

export default ManagerFeedbackPage;
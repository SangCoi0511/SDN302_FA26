import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getFieldById } from '../../../services/fieldService';
import { getManagerBookings } from '../../../services/managerService';
import '../../../styles/ManagerFieldDetailPage.css';

// Utility key → { icon, label }
const utilityMap = {
  'Wifi': { icon: 'wifi', label: 'Free Wifi' },
  'Parking': { icon: 'local_parking', label: 'Bãi giữ xe' },
  'Shower': { icon: 'shower', label: 'Phòng tắm' },
  'Changing Room': { icon: 'checkroom', label: 'Phòng thay đồ' },
  'Water': { icon: 'local_drink', label: 'Nước uống miễn phí' },
  'First Aid': { icon: 'medical_services', label: 'Y tế sơ cứu' },
  'Equipment Rental': { icon: 'sports', label: 'Cho thuê dụng cụ' },
  'Coaching': { icon: 'school', label: 'Huấn luyện viên' },
  'Cafe': { icon: 'local_cafe', label: 'Quán cà phê' },
  'Air Conditioning': { icon: 'ac_unit', label: 'Điều hòa' },
  'Snack Bar': { icon: 'restaurant', label: 'Canteen' },
  'Scoreboard': { icon: 'scoreboard', label: 'Bảng điểm' },
};

const getStatusInfo = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'available': return { label: 'Đang hoạt động', className: 'active' };
    case 'maintenance': return { label: 'Bảo trì', className: 'maintenance' };
    default: return { label: 'Ngưng hoạt động', className: 'closed' };
  }
};

const ManagerFieldDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    const fetchField = async () => {
      setLoading(true);
      setError(null);
      // Dùng public API để xem được bất kỳ sân nào (không bị giới hạn ownership)
      const res = await getFieldById(id);
      if (res.success) {
        // getFieldById trả về { field, availability }
        setField(res.data?.field || res.data);
      } else {
        setError(res.error || 'Không thể tải thông tin sân');
      }
      setLoading(false);
    };
    fetchField();
  }, [id]);

  // Fetch bookings for this field
  useEffect(() => {
    const fetchBookings = async () => {
      setBookingsLoading(true);
      const res = await getManagerBookings();
      if (res.success) {
        // Chỉ giữ booking có ít nhất 1 bookingDetail thuộc đúng sân này
        const filtered = res.data.filter((b) =>
          b.bookingDetails?.some(
            (d) => d.fieldId?.toString() === id
          )
        );
        // Chỉ hiển thị Pending (chờ xác nhận) và Confirmed/Completed (đã hoàn thành)
        const relevant = filtered.filter((b) =>
          ['Pending', 'Confirmed', 'Completed'].includes(b.status)
        );
        // Sắp xếp theo startTime của detail sân này (mới nhất lên đầu)
        relevant.sort((a, b) => {
          const aDetail = a.bookingDetails?.find((d) => d.fieldId?.toString() === id);
          const bDetail = b.bookingDetails?.find((d) => d.fieldId?.toString() === id);
          return new Date(bDetail?.startTime || 0) - new Date(aDetail?.startTime || 0);
        });
        setBookings(relevant);
      }
      setBookingsLoading(false);
    };
    if (id) fetchBookings();
  }, [id]);

  if (loading) {
    return (
      <div className="afd-page">
        <div className="afd-not-found">
          <span className="material-symbols-outlined afd-not-found-icon" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
          <p>Đang tải thông tin sân...</p>
        </div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="afd-page">
        <div className="afd-not-found">
          <span className="material-symbols-outlined afd-not-found-icon">search_off</span>
          <h2>Không tìm thấy sân</h2>
          <p>{error || 'Sân không tồn tại hoặc đã bị xóa.'}</p>
          <Link to="/admin/fields" className="afd-btn-back">
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại danh sách sân
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusInfo(field.status);
  // Hỗ trợ cả public API (normaliseFieldDetail) và manager API (populate fieldTypeID)
  const typeName =
    field.fieldType?.typeName ||
    field.fieldTypeID?.typeName || '';
  const categoryName =
    field.category?.categoryName ||
    field.fieldType?.category?.categoryName ||
    field.fieldTypeID?.categoryID?.categoryName || '';
  const managerName = field.manager?.name || field.managerID?.name || '';
  const managerPhone = field.manager?.phone || field.managerID?.phone || '';
  const managerImage = field.manager?.image || field.managerID?.image || null;
  const images = Array.isArray(field.images) ? field.images
    : Array.isArray(field.image) ? field.image
    : field.image ? [field.image] : [];
  const amenities = (field.utilities || []).map(
    (u) => utilityMap[u] || { icon: 'check_circle', label: u }
  );

  const formatPrice = (price) => Number(price || 0).toLocaleString('vi-VN') + 'đ';

  const specs = [
    { icon: 'sports_soccer', title: 'Loại sân', value: typeName || '—' },
    { icon: 'category', title: 'Môn thể thao', value: categoryName || '—' },
    { icon: 'schedule', title: 'Thời gian mở cửa', value: `${field.openingTime} - ${field.closingTime}` },
    { icon: 'timer', title: 'Thời lượng slot', value: `${field.slotDuration} phút` },
  ];

  return (
    <div className="afd-page">
      {/* Breadcrumbs */}
      <nav className="afd-breadcrumbs">
        <Link to="/admin/fields" className="afd-breadcrumb-link">
          <span className="material-symbols-outlined">grid_view</span>
          Quản lý sân
        </Link>
        <span className="material-symbols-outlined afd-breadcrumb-sep">chevron_right</span>
        <span className="afd-breadcrumb-current">Chi tiết sân</span>
      </nav>

      {/* Header */}
      <div className="afd-header">
        <div className="afd-header-info">
          <h1 className="afd-title">{field.fieldName}</h1>
          <div className="afd-subtitle">
            <span className="afd-location">
              <span className="material-symbols-outlined">location_on</span>
              {field.address}
            </span>
            <span className={`afd-status-badge ${status.className}`}>
              <span className="afd-status-dot" />
              {status.label}
            </span>
          </div>
        </div>
        <div className="afd-header-actions">
          <button className="afd-btn-secondary" onClick={() => navigate('/admin/fields')}>
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại
          </button>
          <Link to={`/admin/fields/${id}/edit`} className="afd-btn-primary">
            <span className="material-symbols-outlined">edit</span>
            Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <div className="afd-gallery">
        <div className="afd-gallery-main">
          {images[0] ? (
            <img src={images[0]} alt={field.fieldName} className="afd-gallery-img" />
          ) : (
            <div className="afd-gallery-placeholder">
              <span className="material-symbols-outlined">image</span>
              <p>Chưa có hình ảnh</p>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="afd-gallery-side">
            {images.slice(1, 4).map((img, idx) => (
              <div key={idx} className="afd-gallery-thumb">
                <img src={img} alt={`${field.fieldName} ${idx + 2}`} className="afd-gallery-img" />
              </div>
            ))}
            {images.length > 4 && (
              <div className="afd-gallery-thumb afd-gallery-more">
                <img src={images[4]} alt="" className="afd-gallery-img" />
                <div className="afd-gallery-overlay">
                  <span>+{images.length - 4} ảnh</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="afd-content-grid">
        {/* Left Column */}
        <div className="afd-left-col">
          <section className="afd-section">
            <h2 className="afd-section-title">Thông tin chi tiết</h2>
            <p className="afd-description">{field.description || 'Chưa có mô tả.'}</p>
          </section>

          <hr className="afd-divider" />

          <section className="afd-section">
            <h3 className="afd-section-title">Thông số kỹ thuật</h3>
            <div className="afd-specs-grid">
              {specs.map((spec, idx) => (
                <div key={idx} className="afd-spec-card">
                  <div className="afd-spec-icon">
                    <span className="material-symbols-outlined">{spec.icon}</span>
                  </div>
                  <div>
                    <h4 className="afd-spec-label">{spec.title}</h4>
                    <p className="afd-spec-value">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Manager Info — only if populated */}
          {managerName && (
            <>
              <hr className="afd-divider" />
              <section className="afd-section">
                <h3 className="afd-section-title">Quản lý sân</h3>
                <div className="afd-manager-card">
                  <div className="afd-manager-avatar">
                    {managerImage ? (
                      <img src={managerImage} alt={managerName} />
                    ) : (
                      <span className="material-symbols-outlined">person</span>
                    )}
                  </div>
                  <div>
                    <h4 className="afd-manager-name">{managerName}</h4>
                    <p className="afd-manager-phone">
                      <span className="material-symbols-outlined">phone</span>
                      {managerPhone}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <>
              <hr className="afd-divider" />
              <section className="afd-section">
                <h3 className="afd-section-title">Tiện ích đi kèm</h3>
                <div className="afd-amenities">
                  {amenities.map((a, idx) => (
                    <span key={idx} className="afd-amenity-tag">
                      <span className="material-symbols-outlined">{a.icon}</span>
                      {a.label}
                    </span>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="afd-right-col">
          <div className="afd-price-card">
            <div className="afd-price-header">
              <div>
                <p className="afd-price-label">Giá thuê</p>
                <div className="afd-price-amount">
                  <span className="afd-price-value">{formatPrice(field.hourlyPrice)}</span>
                  <span className="afd-price-unit">/ slot</span>
                </div>
              </div>
              <div className="afd-price-icon">
                <span className="material-symbols-outlined">payments</span>
              </div>
            </div>

            <div className="afd-rules">
              <h4 className="afd-rules-title">Quy định đặt sân</h4>
              <ul className="afd-rules-list">
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Đặt cọc tối thiểu 30% giá trị giờ thuê.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Có mặt trước 10 phút để nhận sân.</span>
                </li>
              </ul>
            </div>

            <div className="afd-card-actions">
              <Link to={`/admin/fields/${id}/edit`} className="afd-btn-primary full">
                <span className="material-symbols-outlined">edit</span>
                Chỉnh sửa sân
              </Link>
              <button className="afd-btn-secondary full" onClick={() => navigate('/admin/fields')}>
                <span className="material-symbols-outlined">list</span>
                Danh sách sân
              </button>
            </div>
          </div>
        </div>
      </div>{/* end afd-content-grid */}

      {/* ===== Bookings Section ===== */}
      <div className="afd-bookings-section">
        <div className="afd-bookings-header">
          <span className="material-symbols-outlined">event_available</span>
          <h2 className="afd-bookings-title">Lịch sử đặt sân</h2>
          <span className="afd-bookings-subtitle">Đơn đang chờ xác nhận &amp; đã hoàn thành</span>
        </div>

        {bookingsLoading ? (
          <div className="afd-bookings-loading">
            <span className="material-symbols-outlined afd-spin">progress_activity</span>
            <span>Đang tải danh sách đặt sân...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="afd-bookings-empty">
            <span className="material-symbols-outlined">inbox</span>
            <p>Chưa có đơn đặt sân nào cho sân này.</p>
          </div>
        ) : (
          <div className="afd-bookings-table-wrapper">
            <table className="afd-bookings-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Thời gian đặt</th>
                  <th>Khung giờ</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  // Lấy bookingDetail của đúng sân này
                  const detail = b.bookingDetails?.find(
                    (d) => d.fieldId?.toString() === id
                  ) || b.bookingDetails?.[0];

                  const bookingStatusMap = {
                    Pending:   { label: 'Chờ xác nhận', cls: 'afd-bs-pending' },
                    Confirmed: { label: 'Đã xác nhận',  cls: 'afd-bs-confirmed' },
                    Completed: { label: 'Hoàn thành',   cls: 'afd-bs-completed' },
                    Cancelled: { label: 'Đã hủy',       cls: 'afd-bs-cancelled' },
                  };
                  const paymentStatusMap = {
                    Unpaid:  { label: 'Chưa thanh toán', cls: 'afd-ps-unpaid' },
                    Paid:    { label: 'Đã thanh toán',   cls: 'afd-ps-paid' },
                    Refunded:{ label: 'Đã hoàn tiền',    cls: 'afd-ps-refunded' },
                  };
                  const bStatus = bookingStatusMap[b.status] || { label: b.status, cls: '' };
                  const pStatus = paymentStatusMap[b.statusPayment] || { label: b.statusPayment || '—', cls: '' };

                  const formatDT = (dt) => {
                    if (!dt) return '—';
                    const d = new Date(dt);
                    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  };
                  const formatDate = (dt) => {
                    if (!dt) return '—';
                    return new Date(dt).toLocaleDateString('vi-VN');
                  };

                  return (
                    <tr key={b.id}>
                      <td>
                        <div className="afd-booking-customer">
                          <div className="afd-booking-avatar">
                            {b.customer?.image ? (
                              <img src={b.customer.image} alt={b.customer.name} className="afd-booking-avatar-img" />
                            ) : (
                              <span className="afd-booking-avatar-initials">
                                {(b.customer?.name || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="afd-booking-name">{b.customer?.name || '—'}</div>
                            <div className="afd-booking-email">{b.customer?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="afd-booking-phone">
                          <span className="material-symbols-outlined">phone</span>
                          {b.customer?.phone || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="afd-booking-date">{formatDate(b.createdAt)}</div>
                      </td>
                      <td>
                        {detail ? (
                          <div className="afd-booking-slot">
                            <div>{formatDT(detail.startTime)}</div>
                            <div className="afd-booking-slot-sep">→</div>
                            <div>{formatDT(detail.endTime)}</div>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        <div className="afd-booking-price">
                          {Number(b.totalPrice || 0).toLocaleString('vi-VN')}đ
                        </div>
                      </td>
                      <td>
                        <span className={`afd-booking-badge ${bStatus.cls}`}>{bStatus.label}</span>
                      </td>
                      <td>
                        <span className={`afd-booking-badge ${pStatus.cls}`}>{pStatus.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManagerFieldDetailPage;
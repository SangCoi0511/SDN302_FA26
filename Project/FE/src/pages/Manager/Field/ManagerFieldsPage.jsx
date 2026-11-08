import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { searchFields } from '../../../services/fieldService';
import { deleteField, getManagerCategories } from '../../../services/managerService';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/ManagerFieldsPage.css';

/**
 * Format price in VND
 */
const formatPrice = (price) => {
  return price.toLocaleString('vi-VN') + 'đ';
};

/**
 * Map mockData status to display status
 */
const mapStatus = (status) => {
  switch (status) {
    case 'Available': return { key: 'active', label: 'Đang hoạt động' };
    case 'Maintenance': return { key: 'maintenance', label: 'Bảo trì' };
    default: return { key: 'closed', label: 'Ngưng hoạt động' };
  }
};

/**
 * Map field type to badge variant
 */
const getTypeBadgeVariant = (typeName) => {
  if (typeName.includes('5')) return 'blue';
  if (typeName.includes('7')) return 'purple';
  if (typeName.includes('11')) return 'orange';
  return 'teal';
};

/**
 * Map category name to Material icon
 */
const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case 'Football': return 'sports_soccer';
    case 'Tennis': return 'sports_tennis';
    case 'Badminton': return 'sports_tennis'; // closest icon
    case 'Basketball': return 'sports_basketball';
    case 'Volleyball': return 'sports_volleyball';
    default: return 'sports';
  }
};

/**
 * Map category name to icon color class
 */
const getCategoryIconClass = (categoryName) => {
  switch (categoryName) {
    case 'Football': return 'icon-football';
    case 'Tennis': return 'icon-tennis';
    case 'Badminton': return 'icon-badminton';
    case 'Basketball': return 'icon-basketball';
    case 'Volleyball': return 'icon-volleyball';
    default: return 'icon-default';
  }
};

const ManagerFieldsPage = () => {
  const notification = useNotification();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // API state
  const [rawFields, setRawFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fieldsPerPage = 6;

  // Fetch fields + categories on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const [fieldsRes, catRes] = await Promise.all([
        searchFields({ status: 'all', page: 1, limit: 10000 }),
        getManagerCategories(),
      ]);
      if (fieldsRes.success) {
        // Lọc chỉ sân thuộc manager đang đăng nhập
        // Sau normaliseField: managerID populated → f.manager._id, nhưng f.managerID vẫn còn trong ...f spread
        const all = fieldsRes.data?.fields || [];
        const myFields = user?._id
          ? all.filter(f => {
              // Thử field.manager._id (sau normalise) rồi field.managerID._id (raw populate) rồi string
              const mid =
                f.manager?._id ||
                f.managerID?._id ||
                f.managerID;
              return mid?.toString() === user._id?.toString();
            })
          : all;
        setRawFields(myFields);
      } else {
        setError(fieldsRes.error);
      }
      if (catRes.success) setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.categories || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Transform API fields for table display
  const allFields = useMemo(() => rawFields.map((field) => {
    const status = mapStatus(field.status);
    // Sau normaliseField: fieldType.category._id, fieldType.category.categoryName
    const ft = field.fieldType || field.fieldTypeID;
    const cat = ft?.category || (typeof ft?.categoryID === 'object' ? ft.categoryID : null);
    const categoryId = (cat?._id || ft?.categoryID || '').toString();
    const categoryName = cat?.categoryName || '';
    const typeName = ft?.typeName || '';
    const imgArr = Array.isArray(field.images) ? field.images : Array.isArray(field.image) ? field.image : [];
    return {
      id: field._id,
      name: field.fieldName || '',
      address: field.address || '',
      district: field.district || '',
      categoryId,
      categoryName,
      typeName,
      price: field.hourlyPrice,
      priceFormatted: formatPrice(field.hourlyPrice || 0),
      statusKey: status.key,
      statusLabel: status.label,
      image: imgArr[0] || null,
    };
  }), [rawFields]);

  // Stats
  const stats = useMemo(() => ({
    total: allFields.length,
    active: allFields.filter((f) => f.statusKey === 'active').length,
    maintenance: allFields.filter((f) => f.statusKey === 'maintenance').length,
    closed: allFields.filter((f) => f.statusKey === 'closed').length,
  }), [allFields]);

  // Filter logic
  const filteredFields = useMemo(() => allFields.filter((field) => {
    const matchSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !categoryFilter || field.categoryId === categoryFilter.toString();
    const matchStatus = !statusFilter || field.statusKey === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  }), [allFields, searchTerm, categoryFilter, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredFields.length / fieldsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFields = filteredFields.slice(
    (safePage - 1) * fieldsPerPage,
    safePage * fieldsPerPage
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

  // Delete handler
  const handleDeleteClick = (field) => setDeleteConfirm(field);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const res = await deleteField(deleteConfirm.id);
    if (res.success) {
      setRawFields((prev) => prev.filter((f) => f._id !== deleteConfirm.id));
      notification.success(`Đã xóa sân "${deleteConfirm.name}" thành công.`);
    } else {
      notification.error(res.error || 'Xóa sân thất bại.');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="manager-fields-page">
      {/* Top Bar: Title + Create Button */}
      <div className="fields-top-bar">
        <div>
          <h2 className="fields-page-title">Danh sách sân</h2>
          <p className="fields-page-subtitle">Quản lý tất cả {allFields.length} sân trong hệ thống</p>
        </div>
        <Link to="/admin/fields/create" className="fields-btn-create">
          <span className="material-symbols-outlined">add</span>
          Tạo sân mới
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="fields-error-banner">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="fields-stats">
        <div className="field-stat-card">
          <div className="field-stat-icon total"><span className="material-symbols-outlined">sports_soccer</span></div>
          <div><div className="field-stat-value">{loading ? '…' : stats.total}</div><div className="field-stat-label">Tổng số sân</div></div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon active"><span className="material-symbols-outlined">check_circle</span></div>
          <div><div className="field-stat-value">{loading ? '…' : stats.active}</div><div className="field-stat-label">Đang hoạt động</div></div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon maintenance"><span className="material-symbols-outlined">build</span></div>
          <div><div className="field-stat-value">{loading ? '…' : stats.maintenance}</div><div className="field-stat-label">Đang bảo trì</div></div>
        </div>
        <div className="field-stat-card">
          <div className="field-stat-icon closed"><span className="material-symbols-outlined">cancel</span></div>
          <div><div className="field-stat-value">{loading ? '…' : stats.closed}</div><div className="field-stat-label">Ngưng hoạt động</div></div>
        </div>
      </div>

      {/* Toolbar: Search + Filters */}
      <div className="fields-toolbar">
        <div className="fields-search">
          <span className="material-symbols-outlined fields-search-icon">search</span>
          <input
            type="text" className="fields-search-input" placeholder="Tìm kiếm tên sân..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="fields-filters">
          <select className="fields-select" value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">Tất cả môn thể thao</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
            ))}
          </select>
          <select className="fields-select" value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="maintenance">Bảo trì</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="fields-table-card">
        {loading ? (
          <div className="fields-loading">
            <span className="material-symbols-outlined loading-spin">progress_activity</span>
            <p>Đang tải danh sách sân...</p>
          </div>
        ) : (
          <div className="fields-table-wrapper">
            <table className="fields-table">
              <thead>
                <tr>
                  <th className="fields-th-icon"></th>
                  <th>Tên sân</th>
                  <th>Thể loại</th>
                  <th>Giá / Giờ</th>
                  <th>Trạng thái</th>
                  <th className="fields-th-actions">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFields.map((field) => (
                  <tr key={field.id} className="fields-row">
                    <td className="fields-td-icon">
                      <span className={`field-sport-icon ${getCategoryIconClass(field.categoryName)}`}>
                        <span className="material-symbols-outlined">{getCategoryIcon(field.categoryName)}</span>
                      </span>
                    </td>
                    <td>
                      <div className="field-name-cell">
                        <div className="field-thumb">
                          {field.image ? (
                            <img src={field.image} alt={field.name} className="field-thumb-img" />
                          ) : (
                            <div className="field-thumb-placeholder">
                              <span className="material-symbols-outlined">image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="field-name">{field.name}</div>
                          <div className="field-area">{field.address}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${getTypeBadgeVariant(field.typeName)}`}>
                        {field.typeName || field.categoryName || 'N/A'}
                      </span>
                    </td>
                    <td><div className="field-price">{field.priceFormatted}</div></td>
                    <td>
                      <span className={`status-badge-field ${field.statusKey}`}>
                        <span className="status-dot" />{field.statusLabel}
                      </span>
                    </td>
                    <td>
                      <div className="field-actions">
                        <Link to={`/admin/fields/${field.id}`} className="field-action-btn view" title="Xem chi tiết">
                          <span className="material-symbols-outlined">visibility</span>
                        </Link>
                        <Link to={`/admin/fields/${field.id}/edit`} className="field-action-btn edit" title="Chỉnh sửa">
                          <span className="material-symbols-outlined">edit</span>
                        </Link>
                        <button className="field-action-btn delete" title="Xóa"
                          onClick={() => handleDeleteClick(field)}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedFields.length === 0 && (
                  <tr><td colSpan="6" className="fields-empty">Không tìm thấy sân nào phù hợp.</td></tr>
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

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger">
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
            <h3 className="modal-title">Xóa sân?</h3>
            <p className="modal-description">
              Bạn có chắc muốn xóa sân <strong>{deleteConfirm.name}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setDeleteConfirm(null)}>Hủy bỏ</button>
              <button className="modal-btn confirm-ban" onClick={handleDeleteConfirm}>Xóa sân</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerFieldsPage;
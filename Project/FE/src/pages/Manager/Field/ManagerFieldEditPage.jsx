import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import { getFieldById } from '../../../services/fieldService';
import { getFieldCreateForm, updateField } from '../../../services/managerService';
import '../../../styles/ManagerFieldEditPage.css';

const ManagerFieldEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();

  /* ---------- Loading & error state ---------- */
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- Form data from API ---------- */
  const [categories, setCategories] = useState([]);
  const [allFieldTypes, setAllFieldTypes] = useState([]);

  /* ---------- Form fields ---------- */
  const [fieldName, setFieldName] = useState('');
  const [street, setStreet] = useState('');
  const [ward, setWard] = useState('');
  const [province, setProvince] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyPrice, setHourlyPrice] = useState(0);
  const [slotDuration, setSlotDuration] = useState(60);
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedFieldTypeId, setSelectedFieldTypeId] = useState('');
  const [status, setStatus] = useState(true); // true = Available
  const [utilities, setUtilities] = useState(['']);
  const [images, setImages] = useState([]); // string URLs (existing) or File objects (new)
  const [fieldIdReal, setFieldIdReal] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setPageLoading(true);
      setPageError(null);

      const [fieldRes, formRes] = await Promise.all([
        getFieldById(id),         // public API — load được bất kỳ sân nào
        getFieldCreateForm(),     // danh sách category + fieldType để populate dropdown
      ]);

      if (!fieldRes.success) {
        setPageError(fieldRes.error || 'Không tìm thấy sân');
        setPageLoading(false);
        return;
      }

      // getFieldById trả về { field, availability } — lấy field
      const f = fieldRes.data?.field || fieldRes.data;
      setFieldIdReal(f._id);
      setFieldName(f.fieldName || '');
      // Parse address back into 3 parts (stored as "street, ward, province")
      const addressParts = (f.address || '').split(',').map((s) => s.trim());
      setStreet(addressParts[0] || '');
      setWard(addressParts[1] || '');
      setProvince(addressParts[2] || '');
      setDescription(f.description || '');
      setHourlyPrice(f.hourlyPrice || 0);
      setSlotDuration(f.slotDuration || 60);
      setOpeningTime(f.openingTime || '06:00');
      setClosingTime(f.closingTime || '23:00');
      setStatus((f.status || '').toLowerCase() !== 'maintenance');
      setUtilities(f.utilities && f.utilities.length > 0 ? f.utilities : ['']);
      // public API trả về f.images; manager API trả về f.image — đều là array URL
      setImages(
        Array.isArray(f.images) ? f.images
          : Array.isArray(f.image) ? f.image
          : f.image ? [f.image] : []
      );

      // Resolve IDs — public API: f.fieldType._id, f.category._id
      //              manager API: f.fieldTypeID._id, f.fieldTypeID.categoryID._id
      const currentTypeId = (
        f.fieldType?._id ||
        f.fieldTypeID?._id ||
        f.fieldTypeID ||
        ''
      ).toString();
      const currentCatId = (
        f.category?._id ||
        f.fieldType?.category?._id ||
        f.fieldTypeID?.categoryID?._id ||
        f.fieldTypeID?.categoryID ||
        ''
      ).toString();

      if (formRes.success && formRes.data) {
        // BE trả về { categories: [{ _id, categoryName, fieldTypes: [...] }] }
        // Mỗi category đã có fieldTypes lồng bên trong — cần tách ra flat array
        const cats = formRes.data.categories || [];
        const types = cats.flatMap((cat) =>
          (cat.fieldTypes || []).map((ft) => ({
            ...ft,
            categoryID: { _id: cat._id, categoryName: cat.categoryName },
          }))
        );
        setCategories(cats);
        setAllFieldTypes(types);
        setSelectedCategoryId(currentCatId);
        setSelectedFieldTypeId(currentTypeId);
      }

      setPageLoading(false);
    };
    fetchAll();
  }, [id]);

  /* ---------- Derived ---------- */
  const availableFieldTypes = useMemo(() => {
    if (!selectedCategoryId) return allFieldTypes;
    return allFieldTypes.filter((ft) => {
      const catId = (ft.categoryID?._id || ft.categoryID || '').toString();
      return catId === selectedCategoryId.toString();
    });
  }, [selectedCategoryId, allFieldTypes]);

  /* ---------- Handlers ---------- */

  const addUtility = () => setUtilities((prev) => [...prev, '']);

  const updateUtility = (index, value) =>
    setUtilities((prev) => prev.map((u, i) => (i === index ? value : u)));

  const removeUtility = (index) =>
    setUtilities((prev) => prev.filter((_, i) => i !== index));

  const handleCategoryChange = (catId) => {
    setSelectedCategoryId(catId);
    const typesForCat = allFieldTypes.filter((ft) => {
      const ftCatId = (ft.categoryID?._id || ft.categoryID || '').toString();
      return ftCatId === catId.toString();
    });
    if (typesForCat.length > 0 && !typesForCat.find((ft) => ft._id === selectedFieldTypeId)) {
      setSelectedFieldTypeId(typesForCat[0]._id);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const formatPriceDisplay = (price) => Number(price).toLocaleString('vi-VN');

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setHourlyPrice(Number(raw) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFieldTypeId) {
      notification.error('Vui lòng chọn loại sân!');
      return;
    }
    if (!selectedCategoryId) {
      notification.error('Vui lòng chọn môn thể thao!');
      return;
    }
    if (images.length === 0) {
      notification.error('Vui lòng giữ lại hoặc thêm ít nhất 1 ảnh sân!');
      return;
    }

    setSubmitting(true);

    const address = [street, ward, province].filter(Boolean).join(', ');
    const filteredUtilities = utilities.map((u) => u.trim()).filter(Boolean);

    const uniqueUtilities = new Set(filteredUtilities.map((u) => u.toLowerCase()));
    if (uniqueUtilities.size !== filteredUtilities.length) {
      notification.error('Tiện ích bị trùng! Vui lòng kiểm tra lại.');
      setSubmitting(false);
      return;
    }

    const fd = new FormData();
    fd.append('fieldTypeID', selectedFieldTypeId);
    fd.append('categoryID', selectedCategoryId);
    fd.append('fieldName', fieldName);
    fd.append('address', address);
    fd.append('description', description);
    fd.append('hourlyPrice', String(hourlyPrice));
    fd.append('slotDuration', String(slotDuration));
    fd.append('openingTime', openingTime);
    fd.append('closingTime', closingTime);
    fd.append('status', status ? 'Available' : 'Maintenance');
    fd.append('utilities', JSON.stringify(filteredUtilities));

    // Separate existing Cloudinary URLs from new File objects
    const existingUrls = images.filter((img) => typeof img === 'string');
    fd.append('existingImages', JSON.stringify(existingUrls));
    images.filter((img) => img instanceof File).forEach((file) => fd.append('images', file));

    const res = await updateField(fieldIdReal || id, fd);
    setSubmitting(false);

    if (res.success) {
      notification.success(`Cập nhật sân "${fieldName}" thành công!`);
      navigate(`/admin/fields/${fieldIdReal || id}`);
    } else {
      if (res.error?.includes('409') || res.error?.toLowerCase().includes('booking')) {
        notification.error('Không thể thay đổi giờ hoạt động vì có lịch đặt đang hoạt động.');
      } else if (res.error?.toLowerCase().includes('maintenance')) {
        notification.error('Không thể chuyển sang bảo trì vì có lịch đặt đang hoạt động.');
      } else {
        notification.error(res.error || 'Cập nhật sân thất bại. Vui lòng thử lại.');
      }
    }
  };

  /* ---------- Loading / Error states ---------- */
  if (pageLoading) {
    return (
      <div className="edit-field-page">
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>sync</span>
          <p>Đang tải thông tin sân...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="edit-field-page">
        <div className="edit-not-found">
          <span className="material-symbols-outlined">search_off</span>
          <h2>Không tìm thấy sân</h2>
          <p>{pageError}</p>
          <Link to="/admin/fields" className="edit-btn-back">
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại danh sách sân
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-field-page">
      {/* Header */}
      <div className="edit-page-header">
        <div className="edit-header-left">
          <button type="button" className="edit-back-btn" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="edit-page-title">Chỉnh sửa thông tin sân</h2>
            <p className="edit-page-subtitle">Cập nhật thông tin chi tiết cho {fieldName}</p>
          </div>
        </div>
        <div className="edit-header-right">
          <Link to={`/admin/fields/${fieldIdReal || id}`} className="edit-view-link">
            <span className="material-symbols-outlined">visibility</span>
            Xem trang sân
          </Link>
        </div>
      </div>

      {/* Form */}
      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="edit-grid">
          {/* Left Column */}
          <div className="edit-col-left">
            {/* General Info Card */}
            <div className="edit-card">
              <h3 className="edit-card-title">
                <span className="material-symbols-outlined">info</span>
                Thông tin chung
              </h3>
              <div className="edit-form-grid">
                {/* Tên sân */}
                <div className="edit-form-group">
                  <label className="edit-label">Tên sân</label>
                  <input
                    type="text"
                    className="edit-input"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Nhập tên sân..."
                    required
                  />
                </div>

                {/* Địa chỉ */}
                <div className="edit-form-group full-width">
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', background: '#f8fafc' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#22c55e' }}>location_on</span>
                      Địa chỉ
                    </p>
                    <div className="edit-form-grid" style={{ margin: 0 }}>
                      <div className="edit-form-group full-width" style={{ marginBottom: '10px' }}>
                        <label className="edit-label">Thôn / Xóm / Đường</label>
                        <input
                          type="text"
                          className="edit-input"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Ví dụ: 123 Nguyễn Huệ"
                          required
                        />
                      </div>
                      <div className="edit-form-group" style={{ marginBottom: 0 }}>
                        <label className="edit-label">Xã / Phường / Thị trấn</label>
                        <input
                          type="text"
                          className="edit-input"
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          placeholder="Ví dụ: Phường Bến Nghé"
                          required
                        />
                      </div>
                      <div className="edit-form-group" style={{ marginBottom: 0 }}>
                        <label className="edit-label">Tỉnh / Thành phố</label>
                        <input
                          type="text"
                          className="edit-input"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          placeholder="Ví dụ: TP. Hồ Chí Minh"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Môn thể thao */}
                <div className="edit-form-group">
                  <label className="edit-label">Môn thể thao</label>
                  <select
                    className="edit-select"
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">-- Chọn môn --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                {/* Loại sân */}
                <div className="edit-form-group">
                  <label className="edit-label">Loại sân</label>
                  <select
                    className="edit-select"
                    value={selectedFieldTypeId}
                    onChange={(e) => setSelectedFieldTypeId(e.target.value)}
                  >
                    <option value="">-- Chọn loại sân --</option>
                    {availableFieldTypes.map((ft) => (
                      <option key={ft._id} value={ft._id}>{ft.typeName}</option>
                    ))}
                  </select>
                </div>

                {/* Giá thuê */}
                <div className="edit-form-group">
                  <label className="edit-label">Giá thuê (VND/slot)</label>
                  <div className="edit-input-suffix">
                    <input
                      type="text"
                      className="edit-input"
                      value={formatPriceDisplay(hourlyPrice)}
                      onChange={handlePriceChange}
                      placeholder="0"
                    />
                    <span className="edit-suffix">đ</span>
                  </div>
                </div>

                {/* Thời lượng slot */}
                <div className="edit-form-group">
                  <label className="edit-label">Thời lượng mỗi slot</label>
                  <div className="edit-input-suffix">
                    <input
                      type="number"
                      className="edit-input"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      min={60}
                      max={480}
                      step={30}
                    />
                    <span className="edit-suffix">phút</span>
                  </div>
                </div>

                {/* Giờ mở cửa */}
                <div className="edit-form-group">
                  <label className="edit-label">Giờ mở cửa</label>
                  <input
                    type="time"
                    className="edit-input"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                  />
                </div>

                {/* Giờ đóng cửa */}
                <div className="edit-form-group">
                  <label className="edit-label">Giờ đóng cửa</label>
                  <input
                    type="time"
                    className="edit-input"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                  />
                </div>

                {/* Mô tả */}
                <div className="edit-form-group full-width">
                  <label className="edit-label">Mô tả chi tiết</label>
                  <textarea
                    className="edit-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả chi tiết về sân..."
                    rows={5}
                  />
                </div>
              </div>
            </div>

            {/* Images Card */}
            <div className="edit-card">
              <h3 className="edit-card-title">
                <span className="material-symbols-outlined">imagesmode</span>
                Hình ảnh
              </h3>
              <div className="edit-images-grid">
                {images.map((img, index) => {
                  const src = img instanceof File ? URL.createObjectURL(img) : img;
                  return (
                    <div key={index} className="edit-image-item">
                      <img src={src} alt={`Ảnh ${index + 1}`} className="edit-image-preview" />
                      <div className="edit-image-overlay">
                        <button
                          type="button"
                          className="edit-image-action view"
                          onClick={() => window.open(src, '_blank')}
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button
                          type="button"
                          className="edit-image-action delete"
                          onClick={() => removeImage(index)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                <label className="edit-image-upload">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <span>Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <p className="edit-image-hint">Định dạng hỗ trợ: JPG, PNG. Tối đa 5MB mỗi ảnh.</p>
            </div>
          </div>

          {/* Right Column — Settings */}
          <div className="edit-col-right">
            <div className="edit-card edit-settings-card">
              <h3 className="edit-card-title">
                <span className="material-symbols-outlined">settings</span>
                Thiết lập
              </h3>

              {/* Status Toggle */}
              <div className="edit-setting-row">
                <div>
                  <label className="edit-setting-label">Trạng thái sân</label>
                  <p className="edit-setting-hint">Tắt để tạm ngưng đặt sân</p>
                </div>
                <label className="edit-toggle">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={() => setStatus(!status)}
                  />
                  <span className="edit-toggle-slider" />
                </label>
              </div>

              <div className="edit-setting-status">
                <span className={`edit-status-dot ${status ? 'active' : 'maintenance'}`} />
                <span className={`edit-status-text ${status ? 'active' : 'maintenance'}`}>
                  {status ? 'Đang hoạt động' : 'Bảo trì'}
                </span>
              </div>

              <hr className="edit-divider" />

              {/* Utilities */}
              <div className="edit-utilities-section">
                <label className="edit-setting-label">Tiện ích đi kèm</label>
                <div className="edit-utilities-list">
                  {utilities.map((util, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="text"
                        className="edit-input"
                        value={util}
                        onChange={(e) => updateUtility(index, e.target.value)}
                        placeholder={`Tiện ích ${index + 1}...`}
                        style={{ flex: 1 }}
                      />
                      {utilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUtility(index)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>remove_circle</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUtility}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px dashed #22c55e', borderRadius: '8px', color: '#22c55e', cursor: 'pointer', padding: '6px 12px', fontSize: '0.875rem', width: '100%', justifyContent: 'center', marginTop: '4px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
                    Thêm tiện ích
                  </button>
                </div>
              </div>

              <hr className="edit-divider" />

              {/* Quick Summary */}
              <div className="edit-summary">
                <h4 className="edit-summary-title">Tóm tắt</h4>
                <div className="edit-summary-items">
                  <div className="edit-summary-item">
                    <span className="material-symbols-outlined">stadium</span>
                    <span>{fieldName || 'Chưa đặt tên'}</span>
                  </div>
                  <div className="edit-summary-item">
                    <span className="material-symbols-outlined">payments</span>
                    <span>{formatPriceDisplay(hourlyPrice)}đ / giờ</span>
                  </div>
                  <div className="edit-summary-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>{openingTime} - {closingTime}</span>
                  </div>
                  <div className="edit-summary-item">
                    <span className="material-symbols-outlined">timer</span>
                    <span>{slotDuration} phút / slot</span>
                  </div>
                  <div className="edit-summary-item">
                    <span className="material-symbols-outlined">photo_library</span>
                    <span>{images.length} ảnh</span>
                  </div>
                  <div className="edit-summary-item">
                    <span className="material-symbols-outlined">build</span>
                    <span>{utilities.filter(u => u.trim()).length} tiện ích</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="edit-actions">
          <button
            type="button"
            className="edit-btn-cancel"
            onClick={() => navigate(`/admin/fields/${fieldIdReal || id}`)}
            disabled={submitting}
          >
            Hủy bỏ
          </button>
          <button type="submit" className="edit-btn-save" disabled={submitting}>
            <span className="material-symbols-outlined">
              {submitting ? 'sync' : 'save'}
            </span>
            {submitting ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerFieldEditPage;
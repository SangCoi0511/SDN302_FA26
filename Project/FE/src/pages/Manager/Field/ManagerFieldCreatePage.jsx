import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import { getFieldCreateForm, createField } from '../../../services/managerService';
import '../../../styles/ManagerFieldEditPage.css';



const ManagerFieldCreatePage = () => {
  const navigate = useNavigate();
  const notification = useNotification();

  /* ---------- Form state — all empty / default ---------- */
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
  const [utilities, setUtilities] = useState(['']);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- API form data ---------- */
  const [categories, setCategories] = useState([]);
  const [allFieldTypes, setAllFieldTypes] = useState([]);
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      setFormLoading(true);
      const res = await getFieldCreateForm();
      if (res.success && res.data) {
        // BE trả về { categories: [{ _id, categoryName, fieldTypes: [...] }] }
        const cats = res.data.categories || [];
        const types = cats.flatMap((cat) =>
          (cat.fieldTypes || []).map((ft) => ({
            ...ft,
            categoryID: { _id: cat._id, categoryName: cat.categoryName },
          }))
        );
        setCategories(cats);
        setAllFieldTypes(types);
        if (cats.length > 0) setSelectedCategoryId(cats[0]._id.toString());
      }
      setFormLoading(false);
    };
    fetchForm();
  }, []);

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
    setSelectedFieldTypeId(typesForCat.length > 0 ? typesForCat[0]._id : '');
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /** Handle file upload — store File objects for upload */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const formatPriceDisplay = (price) => Number(price).toLocaleString('vi-VN');

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setHourlyPrice(Number(raw) || 0);
  };

  /** Handle form submission — POST to API using FormData (multipart) */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      notification.error('Vui lòng chọn môn thể thao!');
      return;
    }
    if (!selectedFieldTypeId) {
      notification.error('Vui lòng chọn loại sân!');
      return;
    }
    if (images.length === 0) {
      notification.error('Vui lòng thêm ít nhất 1 ảnh sân!');
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
    fd.append('categoryID', selectedCategoryId);
    fd.append('fieldTypeID', selectedFieldTypeId);
    fd.append('fieldName', fieldName);
    fd.append('address', address);
    fd.append('description', description);
    fd.append('hourlyPrice', String(hourlyPrice));
    fd.append('slotDuration', String(slotDuration));
    fd.append('openingTime', openingTime);
    fd.append('closingTime', closingTime);
    fd.append('utilities', JSON.stringify(filteredUtilities));
    images.forEach((img) => fd.append('images', img));

    const res = await createField(fd);
    setSubmitting(false);

    if (res.success) {
      notification.success(`Tạo sân "${fieldName}" thành công!`);
      navigate('/admin/fields');
    } else {
      notification.error(res.error || 'Tạo sân thất bại. Vui lòng thử lại.');
    }
  };

  if (formLoading) {
    return (
      <div className="edit-field-page">
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>sync</span>
          <p>Đang tải form...</p>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="edit-field-page">
      {/* Header */}
      <div className="edit-page-header">
        <div className="edit-header-left">
          <button type="button" className="edit-back-btn" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="edit-page-title">Thêm sân mới</h2>
            <p className="edit-page-subtitle">
              Nhập thông tin chi tiết để tạo sân mới trong hệ thống
            </p>
          </div>
        </div>
        <div className="edit-header-right">
          <Link to="/admin/fields" className="edit-view-link">
            <span className="material-symbols-outlined">list</span>
            Danh sách sân
          </Link>
        </div>
      </div>

      {/* Form */}
      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="edit-grid">
          {/* ===== Left Column ===== */}
          <div className="edit-col-left">
            {/* General Info Card */}
            <div className="edit-card">
              <h3 className="edit-card-title">
                <span className="material-symbols-outlined">edit_note</span>
                Thông tin cơ bản
              </h3>
              <div className="edit-form-grid">
                {/* Tên sân */}
                <div className="edit-form-group full-width">
                  <label className="edit-label">Tên sân</label>
                  <input
                    type="text"
                    className="edit-input"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Ví dụ: Sân A - Khu vực 1"
                    required
                  />
                </div>

                {/* Địa chỉ */}
                <div className="edit-form-group full-width">
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
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
                    required
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
                    required
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
                      value={hourlyPrice ? formatPriceDisplay(hourlyPrice) : ''}
                      onChange={handlePriceChange}
                      placeholder="300,000"
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
                      min={30}
                      max={180}
                      step={15}
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
                    placeholder="Nhập mô tả về sân, tiện ích đi kèm..."
                    rows={5}
                  />
                </div>
              </div>
            </div>

            {/* Images Card */}
            <div className="edit-card">
              <h3 className="edit-card-title">
                <span className="material-symbols-outlined">image</span>
                Hình ảnh sân
              </h3>

              <label className="edit-dropzone">
                <span className="material-symbols-outlined edit-dropzone-icon">cloud_upload</span>
                <p className="edit-dropzone-text">
                  <span className="edit-dropzone-highlight">Bấm để tải lên</span> hoặc kéo thả
                </p>
                <p className="edit-dropzone-hint">PNG, JPG hoặc WEBP (Tối đa 10MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                />
              </label>

              {images.length > 0 && (
                <div className="edit-upload-list">
                  {images.map((img, index) => {
                    const previewUrl = img instanceof File ? URL.createObjectURL(img) : img;
                    const fileName = img instanceof File ? img.name : `ảnh-sân-${index + 1}.jpg`;
                    return (
                      <div key={index} className="edit-upload-item">
                        <div
                          className="edit-upload-thumb"
                          style={{ backgroundImage: `url(${previewUrl})` }}
                        />
                        <div className="edit-upload-info">
                          <p className="edit-upload-name">{fileName}</p>
                          <p className="edit-upload-size">
                            {img instanceof File
                              ? `${(img.size / 1024).toFixed(0)} KB`
                              : 'Đã tải lên'}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="edit-upload-remove"
                          onClick={() => removeImage(index)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ===== Right Column — Settings ===== */}
          <div className="edit-col-right">
            <div className="edit-card edit-settings-card">
              <h3 className="edit-card-title">
                <span className="material-symbols-outlined">settings</span>
                Thiết lập
              </h3>

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
                    <span>{hourlyPrice ? `${formatPriceDisplay(hourlyPrice)}đ / giờ` : 'Chưa nhập giá'}</span>
                  </div>
                  <div className="edit-summary-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>{openingTime} – {closingTime}</span>
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
            onClick={() => navigate('/admin/fields')}
            disabled={submitting}
          >
            Hủy bỏ
          </button>
          <button type="submit" className="edit-btn-save" disabled={submitting}>
            <span className="material-symbols-outlined">
              {submitting ? 'sync' : 'add_circle'}
            </span>
            {submitting ? 'Đang tạo...' : 'Thêm sân'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerFieldCreatePage;
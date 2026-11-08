/**
 * @fileoverview FieldInfoSection - Component hiển thị tiện ích và thông tin chi tiết sân
 */

const FieldInfoSection = ({ field, amenities }) => {
  return (
    <>
      {/* Amenities */}
      <div className="detail-section">
        <h3 className="section-title">Tiện ích sân</h3>
        <div className="amenities-grid">
          {amenities.map((amenity, index) => (
            <div key={index} className="amenity-item">
              <span className="material-symbols-outlined">{amenity.icon}</span>
              <span>{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="detail-section">
        <h3 className="section-title">Thông tin chi tiết</h3>
        <div className="field-description">
          <p>{field.description}</p>
          <div className="field-info-grid">
            <div className="field-info-item">
              <span className="material-symbols-outlined">category</span>
              <span><strong>Thể loại:</strong> {field.fieldType?.category?.categoryName}</span>
            </div>
            <div className="field-info-item">
              <span className="material-symbols-outlined">sports</span>
              <span><strong>Loại sân:</strong> {field.fieldType?.typeName}</span>
            </div>
            <div className="field-info-item">
              <span className="material-symbols-outlined">schedule</span>
              <span><strong>Giờ mở cửa:</strong> {field.openingTime} - {field.closingTime}</span>
            </div>
            <div className="field-info-item">
              <span className="material-symbols-outlined">timer</span>
              <span><strong>Thời lượng slot:</strong> {field.slotDuration} phút</span>
            </div>
            <div className="field-info-item">
              <span className="material-symbols-outlined">location_on</span>
              <span><strong>Khu vực:</strong> {field.district || (field.address?.split(',').slice(1).join(',').trim())}</span>
            </div>
            <div className="field-info-item">
              <span className="material-symbols-outlined">person</span>
              <span><strong>Quản lý:</strong> {field.manager?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FieldInfoSection;

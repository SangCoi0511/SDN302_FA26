/**
 * @fileoverview FieldCard - Component hiển thị thẻ sân trong danh sách
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FieldCard = ({ field, viewMode, notification }) => {
  const { t } = useTranslation();
  const isMaintenance = field.status === 'Maintenance';

  const handleCardClick = (e) => {
    if (isMaintenance) {
      e.preventDefault();
      notification.warning('Sân đang bảo trì, không thể xem chi tiết. Vui lòng quay lại sau.');
    }
  };

  return (
    <Link
      to={isMaintenance ? '#' : `/fields/${field._id}`}
      key={field._id}
      className={`field-card ${viewMode === 'list' ? 'field-card-list' : ''} ${isMaintenance ? 'field-card-maintenance' : ''}`}
      onClick={handleCardClick}
    >
      <div
        className="field-image"
        style={{
          backgroundImage: `url(${field.image && field.image[0] ? field.image[0] : 'https://via.placeholder.com/400x300?text=No+Image'})`,
        }}
      >
        {field.status === 'Available' && (
          <div className="field-status-badge available">
            <span className="status-dot"></span>
            {t('fieldList.badgeAvailable')}
          </div>
        )}
        {field.status === 'Maintenance' && (
          <div className="field-status-badge maintenance">
            <span className="status-dot"></span>
            {t('fieldList.badgeMaintenance')}
          </div>
        )}
      </div>

      <div className="field-content">
        {/* Header: Name + Rating */}
        <div className="field-header">
          <h3 className="field-name" title={field.fieldName}>{field.fieldName}</h3>
          <div className={`field-rating ${field.averageRating > 0 ? '' : 'no-rating'}`}>
            <span className="material-symbols-outlined rating-star">star</span>
            {field.averageRating > 0 ? (
              <>
                <span className="rating-value">{field.averageRating.toFixed(1)}</span>
                {field.totalReviews > 0 && (
                  <span className="rating-count">({field.totalReviews})</span>
                )}
              </>
            ) : (
              <span className="rating-value">{t('field.new')}</span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="field-location">
          <span className="material-symbols-outlined">location_on</span>
          <span className="location-text" title={field.address}>{field.address}</span>
        </div>

        {/* Field Type */}
        <div className="field-type-row">
          <span className="category-tag">
            {field.fieldType?.category?.categoryName || 'Sports'}
          </span>
          {field.fieldType?.typeName && (
            <span className="type-separator">•</span>
          )}
          {field.fieldType?.typeName && (
            <span className="type-name">{field.fieldType.typeName}</span>
          )}
        </div>

        {/* Amenities */}
        <div className="field-amenities">
          {field.utilities?.slice(0, 3).map(utility => (
            <span key={utility} className="amenity-tag">{utility}</span>
          ))}
          {field.utilities && field.utilities.length > 3 && (
            <span className="amenity-tag more">+{field.utilities.length - 3}</span>
          )}
        </div>

        {/* Footer: Price + Book Button */}
        <div className="field-footer">
          <div className="field-price">
            <span className="price-amount">{field.hourlyPrice.toLocaleString()}đ</span>
            <span className="price-unit">{t('fieldList.perHour')}</span>
          </div>
          {!isMaintenance && (
            <button className="book-button">
              {t('field.bookNow')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
          {isMaintenance && (
            <span className="maintenance-label">
              <span className="material-symbols-outlined">construction</span>
              Đang bảo trì
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FieldCard;

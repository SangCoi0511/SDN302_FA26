/**
 * @fileoverview FieldDetailPage - Trang chi tiết sân (Orchestrator)
 * 
 * Logic & state được quản lý bởi useFieldDetail hook
 * UI được chia thành các component con:
 * - FieldImageGallery: Gallery ảnh
 * - FieldInfoSection: Tiện ích + thông tin chi tiết
 * - FieldReviews: Đánh giá & bình luận
 * - BookingSidebar: Sidebar đặt sân
 */

import { Link } from 'react-router-dom';
import MapModal from '../../components/Map/MapModal';
import QRPaymentModal from '../../components/QRPaymentModal';
import FieldImageGallery from './components/FieldImageGallery';
import FieldInfoSection from './components/FieldInfoSection';
import FieldReviews from './components/FieldReviews';
import BookingSidebar from './components/BookingSidebar';
import useFieldDetail from './useFieldDetail';
import { utilityMap } from './fieldDetailHelpers';
import defaultAvatar from '../../assets/images/default-avatar.svg';
import '../../styles/FieldDetailPage.css';

const FieldDetailPage = () => {
  const {
    id,
    field,
    feedbacks,
    averageRating,
    totalReviews,
    loading,
    bookingLoading,
    selectedDate,
    selectedSlots,
    recurringType,
    setRecurringType,
    recurringMonths,
    setRecurringMonths,
    isMapModalOpen,
    setIsMapModalOpen,
    qrModalOpen,
    setQrModalOpen,
    qrPaymentData,
    calculateRecurringDates,
    mergedTimeRanges,
    timeSlots,
    ratingBreakdown,
    maxBookingDateStr,
    handleOpenMap,
    handleDateChange,
    handleSlotSelection,
    calculateTotalPrice,
    calculateTotalBookingDetails,
    handleBooking,
  } = useFieldDetail();

  // Loading state
  if (loading) {
    return (
      <div className="field-detail-page">
        <div className="field-detail-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="loading-spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin sân...</p>
        </div>
      </div>
    );
  }

  // If field not found, show 404
  if (!field) {
    return (
      <div className="field-detail-page">
        <div className="field-detail-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--text-muted)' }}>search_off</span>
          <h2 style={{ margin: '1rem 0 0.5rem' }}>Không tìm thấy sân</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Sân bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/fields" className="btn-book-now" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Quay lại danh sách sân
          </Link>
        </div>
      </div>
    );
  }

  // Derived data
  const amenities = (field.utilities || []).map((u) => utilityMap[u] || { icon: 'check_circle', name: u });
  const images = field.image?.length > 0
    ? field.image
    : ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'];
  const managerPhone = field.manager?.phone || '0900 000 000';

  return (
    <div className="field-detail-page">
      <div className="field-detail-container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">Trang chủ</Link>
          <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <Link to="/fields" className="breadcrumb-link">Tìm kiếm</Link>
          <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <span className="breadcrumb-current">{field.fieldName}</span>
        </nav>

        {/* Page Layout */}
        <div className="detail-grid">
          {/* Left Column */}
          <div className="detail-content">
            {/* Header */}
            <div className="detail-header">
              <h1 className="field-title">{field.fieldName}</h1>
              <div className="field-location-row">
                <span className="material-symbols-outlined">location_on</span>
                <p>{field.address}</p>
                <a href="#" className="map-link" onClick={handleOpenMap} title="Mở Google Maps">
                  <span className="material-symbols-outlined">map</span>
                  Xem bản đồ
                </a>
              </div>
              <div className="field-badges-row">
                <div className="badge badge-rating">
                  <span className="material-symbols-outlined">star</span>
                  {averageRating > 0 ? `${averageRating} (${totalReviews} đánh giá)` : 'Chưa có đánh giá'}
                </div>
                {field.status === 'Available' && (
                  <div className="badge badge-verified">
                    <span className="material-symbols-outlined">verified</span>
                    Đang hoạt động
                  </div>
                )}
                {field.status === 'Maintenance' && (
                  <div className="badge badge-quick" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <span className="material-symbols-outlined">construction</span>
                    Đang bảo trì
                  </div>
                )}
                <div className="badge badge-quick">
                  <span className="material-symbols-outlined">bolt</span>
                  {field.fieldType?.typeName}
                </div>
              </div>
            </div>

            <FieldImageGallery images={images} />
            <FieldInfoSection field={field} amenities={amenities} />
            <FieldReviews
              feedbacks={feedbacks}
              averageRating={averageRating}
              totalReviews={totalReviews}
              ratingBreakdown={ratingBreakdown}
            />
          </div>

          {/* Right Column - Booking Card */}
          <div className="booking-sidebar">
            <BookingSidebar
              field={field}
              selectedDate={selectedDate}
              maxDate={maxBookingDateStr}
              selectedSlots={selectedSlots}
              recurringType={recurringType}
              setRecurringType={setRecurringType}
              recurringMonths={recurringMonths}
              setRecurringMonths={setRecurringMonths}
              timeSlots={timeSlots}
              mergedTimeRanges={mergedTimeRanges}
              calculateRecurringDates={calculateRecurringDates}
              calculateTotalPrice={calculateTotalPrice}
              calculateTotalBookingDetails={calculateTotalBookingDetails}
              bookingLoading={bookingLoading}
              handleDateChange={handleDateChange}
              handleSlotSelection={handleSlotSelection}
              handleBooking={handleBooking}
            />

            {/* Manager Info Card */}
            <div className="manager-info-card">
              <h4 className="manager-info-title">
                <span className="material-symbols-outlined">badge</span>
                Thông tin chủ sân
              </h4>
              <div className="manager-info-body">
                <img
                  src={field.manager?.image || defaultAvatar}
                  alt={field.manager?.name || 'Chủ sân'}
                  className="manager-info-avatar"
                  onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                />
                <div className="manager-info-details">
                  <p className="manager-info-name">{field.manager?.name || 'Chưa cập nhật'}</p>
                  <a href={`tel:${field.manager?.phone}`} className="manager-info-phone">
                    <span className="material-symbols-outlined">phone</span>
                    {field.manager?.phone || 'Chưa cập nhật'}
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="contact-card">
              <div className="contact-header">
                <span className="material-symbols-outlined">support_agent</span>
                <span className="contact-title">Cần hỗ trợ?</span>
              </div>
              <p className="contact-text">
                Liên hệ hotline hoặc chat với chúng tôi để được hỗ trợ nhanh nhất.
              </p>
              <div className="contact-actions">
                <a href={`tel:${managerPhone}`} className="btn-contact">
                  <span className="material-symbols-outlined">phone</span>
                  {managerPhone}
                </a>
                {/* <button className="btn-contact">
                  <span className="material-symbols-outlined">chat</span>
                  Chat ngay
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        address={field.address}
        fieldName={field.fieldName}
      />

      {/* QR Payment Modal */}
      {qrPaymentData && (
        <QRPaymentModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          qrCodeUrl={qrPaymentData.qrCodeUrl}
          managerInfo={qrPaymentData.managerInfo}
          depositAmount={qrPaymentData.depositAmount}
          totalPrice={qrPaymentData.totalPrice}
          bookingId={qrPaymentData.bookingId}
          fieldName={qrPaymentData.fieldName}
        />
      )}
    </div>
  );
};

export default FieldDetailPage;

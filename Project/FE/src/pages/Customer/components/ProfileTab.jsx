/**
 * ProfileTab Component
 * Tab hiển thị và chỉnh sửa thông tin cá nhân
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import authService from '../../../services/authService';

/** Booking status constants (khớp với BE) */
const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const ProfileTab = ({ user, upcomingBookings, onTabChange }) => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const notification = useNotification();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      notification.error('Tên không được để trống');
      return;
    }
    if (!formData.phone.trim()) {
      notification.error('Số điện thoại không được để trống');
      return;
    }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone.trim())) {
      notification.error('Số điện thoại không hợp lệ (VD: 0901234567)');
      return;
    }
    if (!formData.email.trim()) {
      notification.error('Email không được để trống');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      notification.error('Email không hợp lệ (VD: example@gmail.com)');
      return;
    }

    setSaving(true);
    try {
      const response = await authService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      });

      if (response.success) {
        const updatedCustomer = response.data?.customer;
        // Update user in AuthContext & localStorage
        updateUser({
          ...user,
          name: updatedCustomer?.name || formData.name.trim(),
          phone: updatedCustomer?.phone || formData.phone.trim(),
          email: updatedCustomer?.email || formData.email.trim(),
          address: updatedCustomer?.address || formData.address.trim(),
        });
        notification.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        notification.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      notification.error(error.message || 'Lỗi khi cập nhật thông tin. Vui lòng thử lại.');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return { className: 'status-confirmed', label: 'Đã đặt sân' };
      case BOOKING_STATUS.COMPLETED:
        return { className: 'status-completed', label: 'Đã hoàn thành' };
      case BOOKING_STATUS.CANCELLED:
        return { className: 'status-cancelled', label: 'Đã hủy' };
      case BOOKING_STATUS.PENDING:
        return { className: 'status-pending', label: 'Chờ thanh toán' };
      default:
        return { className: '', label: status };
    }
  };

  return (
    <>
      {/* Personal Info Section */}
      <section className="user-dashboard-section">
        <div className="user-dashboard-section-header">
          <h2 className="user-dashboard-section-title">Thông tin cá nhân</h2>
          {!isEditing && (
            <button
              className="user-dashboard-edit-link"
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        <form className="user-dashboard-form" onSubmit={(e) => e.preventDefault()}>
          <div className="user-dashboard-form-grid">
            <label className="user-dashboard-form-field">
              <p className="user-dashboard-form-label">Họ và tên</p>
              <input
                name="name"
                type="text"
                className="user-dashboard-form-input"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </label>

            <label className="user-dashboard-form-field">
              <p className="user-dashboard-form-label">Số điện thoại</p>
              <input
                name="phone"
                type="tel"
                className="user-dashboard-form-input"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </label>

            <label className="user-dashboard-form-field">
              <p className="user-dashboard-form-label">Email</p>
              <input
                name="email"
                type="email"
                className="user-dashboard-form-input"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </label>

            <label className="user-dashboard-form-field">
              <p className="user-dashboard-form-label">Địa chỉ</p>
              <input
                name="address"
                type="text"
                className="user-dashboard-form-input"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </label>
          </div>

          {isEditing && (
            <div className="user-dashboard-form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel} disabled={saving}>
                Hủy bỏ
              </button>
              <button type="button" className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Upcoming Bookings Section */}
      <section className="user-dashboard-bookings-section">
        <div className="user-dashboard-bookings-header">
          <h3 className="user-dashboard-bookings-title">Lịch đặt sân sắp tới</h3>
          <button
            className="user-dashboard-view-all"
            onClick={() => onTabChange('bookings')}
          >
            Xem tất cả
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <div className="user-dashboard-bookings-list">
          {upcomingBookings.length === 0 ? (
            <div className="user-dashboard-bookings-empty">
              <span className="material-symbols-outlined">event_busy</span>
              <p>Chưa có lịch đặt sân nào</p>
            </div>
          ) : (
            upcomingBookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.status);
              const bookingId = booking.id || booking._id;
              const details = booking.bookingDetails || [];
              const firstDetail = details[0] || {};
              const fieldName = firstDetail.fieldName || 'Không rõ sân';

              // Parse date & time from ISO string
              let dateStr = '';
              let startTimeStr = '';
              let endTimeStr = '';
              if (firstDetail.startTime) {
                const start = new Date(firstDetail.startTime);
                dateStr = start.toISOString().split('T')[0];
                startTimeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
              }
              if (details.length > 0) {
                const lastDetail = details[details.length - 1];
                if (lastDetail.endTime) {
                  const end = new Date(lastDetail.endTime);
                  endTimeStr = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                }
              }

              return (
                <div key={bookingId} className="user-dashboard-booking-card">
                  <div className="user-dashboard-booking-info">
                    <div className="user-dashboard-booking-badges">
                      <span className={`user-dashboard-booking-status ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <h4 className="user-dashboard-booking-name">{fieldName}</h4>
                    <div className="user-dashboard-booking-meta">
                      {dateStr && (
                        <div className="user-dashboard-booking-meta-item">
                          <span className="material-symbols-outlined">calendar_today</span>
                          <span>{formatDate(dateStr)}</span>
                        </div>
                      )}
                      {startTimeStr && (
                        <div className="user-dashboard-booking-meta-item">
                          <span className="material-symbols-outlined">schedule</span>
                          <span>
                            {startTimeStr}{endTimeStr ? ` - ${endTimeStr}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="user-dashboard-booking-meta-item price">
                        <span className="material-symbols-outlined">payments</span>
                        <span>{(booking.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                  <div className="user-dashboard-booking-actions">
                    <button
                      className="btn-detail"
                      onClick={() => navigate(`/booking-history/${bookingId}`)}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
};

export default ProfileTab;

/**
 * @fileoverview BookingSidebar - Component sidebar đặt sân
 * Bao gồm form chọn ngày, lịch lặp, khung giờ, bảng giá, nút đặt sân
 */

import { getDayOfWeekName } from '../fieldDetailHelpers';

const BookingSidebar = ({
  field,
  selectedDate,
  maxDate,
  selectedSlots,
  recurringType,
  setRecurringType,
  recurringMonths,
  setRecurringMonths,
  timeSlots,
  mergedTimeRanges,
  calculateRecurringDates,
  calculateTotalPrice,
  calculateTotalBookingDetails,
  bookingLoading,
  handleDateChange,
  handleSlotSelection,
  handleBooking,
}) => {
  return (
    <div className="booking-card">
      <h3 className="booking-title">Chi tiết lịch đặt</h3>

      <div className="booking-form">
        {/* Chọn ngày chơi */}
        <div className="form-group">
          <label className="form-label">Ngày chơi</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            max={maxDate}
            onChange={handleDateChange}
            className="form-input"
          />
        </div>

        {/* Chọn lịch lặp lại */}
        <div className="form-group">
          <label className="form-label">Lặp lại</label>
          <select
            value={recurringType}
            onChange={(e) => setRecurringType(e.target.value)}
            className="form-input"
          >
            <option value="once">Đặt 1 lần</option>
            <option value="weekly">Đặt cả tuần (7 ngày liên tiếp)</option>
            <option value="recurring">Đặt hàng tuần (lặp theo tháng)</option>
          </select>
          
          {recurringType === 'weekly' && selectedDate && (
            <p className="form-hint highlight">
              <span className="material-symbols-outlined">event_repeat</span>
              Đặt slot này cho <strong>7 ngày liên tiếp</strong> kể từ {selectedDate}
            </p>
          )}
          
          {recurringType === 'recurring' && selectedDate && (
            <p className="form-hint highlight">
              <span className="material-symbols-outlined">event_repeat</span>
              Lặp lại vào <strong>{getDayOfWeekName(selectedDate)}</strong> hàng tuần
            </p>
          )}
        </div>

        {/* Chọn số tháng lặp — chỉ hiện khi recurring */}
        {recurringType === 'recurring' && (
          <div className="form-group">
            <label className="form-label">Thời gian lặp</label>
            <select
              value={recurringMonths}
              onChange={(e) => setRecurringMonths(Number(e.target.value))}
              className="form-input"
            >
              <option value={1}>1 tháng (4 lần)</option>
              <option value={2}>2 tháng (8 lần)</option>
              <option value={3}>3 tháng (12 lần)</option>
            </select>
            
            <div className="recurring-preview">
              <p className="recurring-preview-title">
                <span className="material-symbols-outlined">event_repeat</span>
                Sẽ đặt {calculateRecurringDates.length} {getDayOfWeekName(selectedDate)}:
              </p>
              <ul className="recurring-dates-list">
                {calculateRecurringDates.slice(0, 4).map((date, idx) => (
                  <li key={idx}>
                    {new Date(date).toLocaleDateString('vi-VN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </li>
                ))}
                {calculateRecurringDates.length > 4 && (
                  <li className="more-dates">
                    ... và {calculateRecurringDates.length - 4} ngày khác
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Chọn khung giờ */}
        <div className="form-group">
          <label className="form-label">
            Chọn khung giờ {selectedSlots.length > 0 && `(${selectedSlots.length} khung)`}
          </label>
          
          {timeSlots.length === 0 && (
            <p className="empty-slots-text">Không có khung giờ khả dụng cho ngày này</p>
          )}
          
          <div className="time-slots">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                className={`time-slot ${!slot.available ? 'unavailable' : ''} ${selectedSlots.some(s => s.time === slot.time) ? 'selected' : ''}`}
                disabled={!slot.available}
                onClick={() => handleSlotSelection(slot)}
              >
                {slot.time}
                {slot.isBooked && <span className="slot-badge">Đã đặt</span>}
              </button>
            ))}
          </div>
          
          <p className="form-hint">
            <span className="material-symbols-outlined">info</span>
            Bước 1: Chọn ngày → Bước 2: Chọn khung giờ (có thể chọn nhiều khung liên tiếp)
          </p>
        </div>

        {/* Loại sân */}
        {/* <div className="form-group">
          <label className="form-label">Loại sân</label>
          <p className="form-value">{field.fieldType?.typeName} ({field.fieldType?.category?.categoryName})</p>
        </div> */}

        {/* Thời lượng mỗi khung */}
        {/* <div className="form-group">
          <label className="form-label">Thời lượng</label>
          <p className="form-value">{field.slotDuration} phút</p>
        </div> */}

        {/* Bảng giá */}
        <div className="price-breakdown">
          {mergedTimeRanges.length > 0 && (
            <div className="price-row time-ranges">
              <span>Khung giờ đã chọn:</span>
              <span className="time-ranges-value">
                {mergedTimeRanges.map(r => `${r.startTime}-${r.endTime}`).join(', ')}
              </span>
            </div>
          )}
          
          <div className="price-row">
            <span>Giá thuê sân ({field.slotDuration}p) × {selectedSlots.length || 1}</span>
            <span>{(field.hourlyPrice * (selectedSlots.length || 1)).toLocaleString('vi-VN')}đ</span>
          </div>
          
          {recurringType === 'recurring' && calculateRecurringDates.length > 1 && (
            <div className="price-row recurring">
              <span>× {calculateRecurringDates.length} lần (hàng tuần)</span>
              <span>{calculateTotalPrice().toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          
          {recurringType === 'weekly' && calculateRecurringDates.length > 1 && (
            <div className="price-row recurring">
              <span>× {calculateRecurringDates.length} ngày (cả tuần)</span>
              <span>{calculateTotalPrice().toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          
          {selectedSlots.length > 0 && (
            <div className="price-row info">
              <span>Số bản ghi booking</span>
              <span>{calculateTotalBookingDetails()} records</span>
            </div>
          )}
          
          {selectedSlots.length > 0 && (
            <div className="price-row deposit">
              <span>Tiền cọc (30%)</span>
              <span>{Math.round(calculateTotalPrice() * 0.3).toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          
          <div className="price-total">
            <span>Tổng cộng</span>
            <span className="total-amount">
              {selectedSlots.length > 0 
                ? calculateTotalPrice().toLocaleString('vi-VN') 
                : field.hourlyPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Nút đặt sân */}
        <button 
          className="btn-book-now" 
          onClick={handleBooking}
          disabled={selectedSlots.length === 0 || field.status === 'Maintenance' || bookingLoading}
        >
          {bookingLoading
            ? 'Đang xử lý...'
            : field.status === 'Maintenance'
              ? 'Sân đang bảo trì'
              : selectedSlots.length > 0
                ? 'Đặt sân ngay'
                : 'Chọn khung giờ'}
        </button>
      </div>
    </div>
  );
};

export default BookingSidebar;

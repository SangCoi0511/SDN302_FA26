/**
 * @fileoverview Helper functions cho FieldDetailPage
 * 
 * Bao gồm:
 * - utilityMap: Map utility name → icon + label
 * - mergeConsecutiveSlots: Gộp slots liền kề
 * - checkSlotAvailability: Check availability 1 slot
 * - generateTimeSlots: Generate danh sách time slots
 * - getDayOfWeekName: Lấy tên thứ trong tuần
 */

/**
 * Map utility name from mockData to Material icon + Vietnamese label
 */
export const utilityMap = {
  'Wifi': { icon: 'wifi', name: 'Wifi miễn phí' },
  'Parking': { icon: 'local_parking', name: 'Bãi giữ xe' },
  'Shower': { icon: 'shower', name: 'Phòng tắm' },
  'Changing Room': { icon: 'checkroom', name: 'Phòng thay đồ' },
  'Water': { icon: 'local_drink', name: 'Nước uống' },
  'First Aid': { icon: 'medical_services', name: 'Y tế' },
  'Equipment Rental': { icon: 'sports', name: 'Cho thuê dụng cụ' },
  'Coaching': { icon: 'school', name: 'Huấn luyện viên' },
  'Cafe': { icon: 'local_cafe', name: 'Quán cà phê' },
  'Air Conditioning': { icon: 'ac_unit', name: 'Điều hòa' },
  'Snack Bar': { icon: 'restaurant', name: 'Căn tin' },
  'Scoreboard': { icon: 'scoreboard', name: 'Bảng điểm' },
};

/**
 * Gộp các slots liền kề thành các khoảng thời gian
 * VD: [08:00-09:00, 09:00-10:00, 14:00-15:00] → [{start: 08:00, end: 10:00}, {start: 14:00, end: 15:00}]
 * 
 * @param {Array} slots - Danh sách slots đã chọn (sorted by startTime)
 * @returns {Array} - Danh sách các khoảng thời gian đã gộp
 */
export const mergeConsecutiveSlots = (slots) => {
  if (!slots || slots.length === 0) return [];
  
  // Sort slots theo startTime
  const sortedSlots = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  const merged = [];
  let currentGroup = {
    startTime: sortedSlots[0].startTime,
    endTime: sortedSlots[0].endTime,
  };
  
  for (let i = 1; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    
    // Nếu slot hiện tại bắt đầu ngay sau khi slot trước kết thúc → gộp
    if (slot.startTime === currentGroup.endTime) {
      currentGroup.endTime = slot.endTime;
    } else {
      // Không liền kề → push group hiện tại và bắt đầu group mới
      merged.push({ ...currentGroup });
      currentGroup = {
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
    }
  }
  
  // Push group cuối cùng
  merged.push(currentGroup);
  
  return merged;
};

/**
 * Check availability của 1 slot cho 1 ngày cụ thể
 * Uses API-fetched booked slots instead of mockBookingDetails
 * 
 * @param {string} fieldId - ID của sân (unused in API mode, kept for compat)
 * @param {string} dateStr - Ngày cần check (YYYY-MM-DD)
 * @param {string} startTime - Giờ bắt đầu (HH:mm)
 * @param {string} endTime - Giờ kết thúc (HH:mm)
 * @param {Array}  bookedSlots - Array of booked slot objects from API availability
 * @returns {{ available: boolean, isBooked: boolean, isPast: boolean }}
 */
export const getSlotAvailabilityInfo = (dateStr, startTime, endTime, bookedSlots = []) => {
  const isBooked = bookedSlots.some((b) => {
    const bStartTime = b.startTime ? new Date(b.startTime) : null;
    const bEndTime = b.endTime ? new Date(b.endTime) : null;

    if (bStartTime && bEndTime) {
      const bStartStr = `${String(bStartTime.getHours()).padStart(2, '0')}:${String(bStartTime.getMinutes()).padStart(2, '0')}`;
      const bEndStr = `${String(bEndTime.getHours()).padStart(2, '0')}:${String(bEndTime.getMinutes()).padStart(2, '0')}`;
      return bStartStr === startTime && bEndStr === endTime && b.isAvailable === false;
    }
    return false;
  });

  const now = new Date();
  const slotStart = new Date(`${dateStr}T${startTime}:00`);
  const isPast = slotStart <= now;

  return {
    available: !isBooked && !isPast,
    isBooked,
    isPast,
  };
};

/**
 * Backward-compatible boolean availability check
 */
export const checkSlotAvailability = (fieldId, dateStr, startTime, endTime, bookedSlots = []) => {
  return getSlotAvailabilityInfo(dateStr, startTime, endTime, bookedSlots).available;
};

/**
 * Generate time slots from field's opening/closing time and slot duration
 * Then check availability using API-fetched booked slots
 * 
 * IMPORTANT: breakTime = 10 phút giữa các slot (khớp với BE generateTimeSlots)
 */
export const generateTimeSlots = (field, selectedDate, bookedSlots = []) => {
  if (!field || !selectedDate) return [];

  const BREAK_TIME = 10; // 10 phút nghỉ giữa các slot — khớp với BE

  const [openH, openM] = field.openingTime.split(':').map(Number);
  const [closeH, closeM] = field.closingTime.split(':').map(Number);
  const duration = field.slotDuration; // minutes

  const slots = [];
  let currentMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;

  while (currentMinutes + duration <= endMinutes) {
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const endSlotMinutes = currentMinutes + duration;
    const endSlotH = Math.floor(endSlotMinutes / 60);
    const endSlotM = endSlotMinutes % 60;

    const startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endTime = `${String(endSlotH).padStart(2, '0')}:${String(endSlotM).padStart(2, '0')}`;
    const time = `${startTime} - ${endTime}`;

    const { available, isBooked, isPast } = getSlotAvailabilityInfo(selectedDate, startTime, endTime, bookedSlots);

    slots.push({
      time,
      startTime,
      endTime,
      available,
      isBooked,
      isPast,
    });

    // Thêm breakTime (10 phút) giữa các slot — khớp với BE
    currentMinutes += duration + BREAK_TIME;
  }

  return slots;
};

/**
 * Lấy tên thứ trong tuần từ ngày
 * @param {string} dateStr - Ngày (YYYY-MM-DD)
 * @returns {string} - Tên thứ (VD: "Thứ 2", "Chủ nhật")
 */
export const getDayOfWeekName = (dateStr) => {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

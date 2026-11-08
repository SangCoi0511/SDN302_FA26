/**
 * @fileoverview Frontend Validation Utilities
 * 
 * Defense in Depth: Frontend validation layer to complement backend validation
 * Validates sensitive data before sending to API to enhance security
 * 
 * Features:
 * - Field data validation (price, time, utilities)
 * - User input sanitization (prevent XSS, SQL injection)
 * - Business rule validation (booking slots, time ranges)
 * - Format validation (phone, email, date/time)
 * 
 * @author San Sieu Toc Team
 * @date 2026-02-24
 */

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Validation rules and limits
 * @constant
 */
export const VALIDATION_RULES = {
  // Price constraints (VND)
  PRICE: {
    MIN: 50000,        // 50k minimum
    MAX: 5000000,      // 5M maximum
    STEP: 10000        // Must be multiple of 10k
  },
  
  // Time constraints
  TIME: {
    MIN_HOUR: 0,
    MAX_HOUR: 23,
    MIN_MINUTE: 0,
    MAX_MINUTE: 59,
    OPENING_HOUR: 5,   // Earliest opening: 5:00 AM
    CLOSING_HOUR: 23,  // Latest closing: 11:00 PM
    MIN_SLOT_DURATION: 30,  // 30 minutes
    MAX_SLOT_DURATION: 180  // 3 hours
  },
  
  // String length constraints
  STRING: {
    FIELD_NAME_MIN: 5,
    FIELD_NAME_MAX: 100,
    ADDRESS_MIN: 10,
    ADDRESS_MAX: 200,
    DESCRIPTION_MIN: 10,
    DESCRIPTION_MAX: 500,
    PHONE_LENGTH: 10,
    EMAIL_MAX: 100
  },
  
  // Array constraints
  ARRAY: {
    MIN_UTILITIES: 0,
    MAX_UTILITIES: 20,
    MIN_IMAGES: 0,
    MAX_IMAGES: 10
  },
  
  // Date constraints
  DATE: {
    MIN_BOOKING_ADVANCE_DAYS: 0,    // Can book today
    MAX_BOOKING_ADVANCE_DAYS: 90    // Max 90 days in advance
  }
};

/**
 * Regex patterns for validation
 * @constant
 */
export const PATTERNS = {
  // Vietnamese phone number: 09, 03, 07, 08, 05 + 8 digits
  PHONE: /^(09|03|07|08|05)[0-9]{8}$/,
  
  // Email: standard RFC 5322
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Time format: HH:MM (24-hour)
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // Date format: YYYY-MM-DD
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  
  // MongoDB ObjectId (24 hex characters)
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  
  // Alphanumeric with Vietnamese characters and spaces
  SAFE_TEXT: /^[\p{L}\p{N}\s.,\-()]+$/u,
  
  // Numbers only
  NUMBERS_ONLY: /^\d+$/,
  
  // No special characters (prevent XSS)
  NO_SPECIAL_CHARS: /^[^<>{}[\]\\|~`'"]*$/
};

/**
 * Dangerous patterns that should be blocked (XSS, SQL injection)
 * @constant
 */
export const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // <script> tags
  /javascript:/gi,                                         // javascript: protocol
  /on\w+\s*=/gi,                                          // Event handlers (onclick, onerror, etc.)
  /<iframe/gi,                                            // <iframe> tags
  /<!--[\s\S]*?-->/g,                                     // HTML comments
  /eval\s*\(/gi,                                          // eval() function
  /expression\s*\(/gi,                                    // CSS expression()
  /(union|select|insert|update|delete|drop|create|alter)\s+(all|from|table|database)/gi,  // SQL keywords
  /('|"|`)\s*(or|and)\s*\1\s*=\s*\1/gi                   // SQL injection patterns
];

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize string input to prevent XSS and injection attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      console.warn('⚠️ Dangerous pattern detected and blocked:', input);
      return ''; // Return empty string if dangerous pattern found
    }
  }
  
  // HTML entity encoding for special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
};

/**
 * Sanitize number input
 * @param {any} input - User input
 * @returns {number|null} - Sanitized number or null if invalid
 */
export const sanitizeNumber = (input) => {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return null;
  return num;
};

/**
 * Sanitize array of strings
 * @param {any} input - User input array
 * @returns {string[]} - Sanitized array
 */
export const sanitizeArray = (input) => {
  if (!Array.isArray(input)) return [];
  return input
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
};

// ============================================================================
// FIELD VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate field name
 * @param {string} fieldName - Field name to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateFieldName = (fieldName) => {
  if (!fieldName || typeof fieldName !== 'string') {
    return { valid: false, error: 'Tên sân không được để trống' };
  }
  
  const sanitized = sanitizeString(fieldName);
  const length = sanitized.length;
  
  if (length < VALIDATION_RULES.STRING.FIELD_NAME_MIN) {
    return { 
      valid: false, 
      error: `Tên sân phải có ít nhất ${VALIDATION_RULES.STRING.FIELD_NAME_MIN} ký tự` 
    };
  }
  
  if (length > VALIDATION_RULES.STRING.FIELD_NAME_MAX) {
    return { 
      valid: false, 
      error: `Tên sân không được vượt quá ${VALIDATION_RULES.STRING.FIELD_NAME_MAX} ký tự` 
    };
  }
  
  return { valid: true, error: null, sanitized };
};

/**
 * Validate address
 * @param {string} address - Address to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Địa chỉ không được để trống' };
  }
  
  const sanitized = sanitizeString(address);
  const length = sanitized.length;
  
  if (length < VALIDATION_RULES.STRING.ADDRESS_MIN) {
    return { 
      valid: false, 
      error: `Địa chỉ phải có ít nhất ${VALIDATION_RULES.STRING.ADDRESS_MIN} ký tự` 
    };
  }
  
  if (length > VALIDATION_RULES.STRING.ADDRESS_MAX) {
    return { 
      valid: false, 
      error: `Địa chỉ không được vượt quá ${VALIDATION_RULES.STRING.ADDRESS_MAX} ký tự` 
    };
  }
  
  return { valid: true, error: null, sanitized };
};

/**
 * Validate hourly price
 * @param {number} price - Price to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validatePrice = (price) => {
  const num = sanitizeNumber(price);
  
  if (num === null) {
    return { valid: false, error: 'Giá không hợp lệ' };
  }
  
  if (num < VALIDATION_RULES.PRICE.MIN) {
    return { 
      valid: false, 
      error: `Giá tối thiểu là ${(VALIDATION_RULES.PRICE.MIN / 1000).toLocaleString()}k` 
    };
  }
  
  if (num > VALIDATION_RULES.PRICE.MAX) {
    return { 
      valid: false, 
      error: `Giá tối đa là ${(VALIDATION_RULES.PRICE.MAX / 1000).toLocaleString()}k` 
    };
  }
  
  if (num % VALIDATION_RULES.PRICE.STEP !== 0) {
    return { 
      valid: false, 
      error: `Giá phải là bội số của ${(VALIDATION_RULES.PRICE.STEP / 1000)}k` 
    };
  }
  
  return { valid: true, error: null, sanitized: num };
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateTime = (time) => {
  if (!time || typeof time !== 'string') {
    return { valid: false, error: 'Thời gian không hợp lệ' };
  }
  
  if (!PATTERNS.TIME.test(time)) {
    return { valid: false, error: 'Định dạng thời gian phải là HH:MM' };
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  
  if (hours < VALIDATION_RULES.TIME.MIN_HOUR || hours > VALIDATION_RULES.TIME.MAX_HOUR) {
    return { valid: false, error: 'Giờ phải từ 00 đến 23' };
  }
  
  if (minutes < VALIDATION_RULES.TIME.MIN_MINUTE || minutes > VALIDATION_RULES.TIME.MAX_MINUTE) {
    return { valid: false, error: 'Phút phải từ 00 đến 59' };
  }
  
  return { valid: true, error: null, sanitized: time };
};

/**
 * Validate time range (opening to closing)
 * @param {string} openingTime - Opening time
 * @param {string} closingTime - Closing time
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateTimeRange = (openingTime, closingTime) => {
  const openValidation = validateTime(openingTime);
  if (!openValidation.valid) {
    return { valid: false, error: `Giờ mở cửa: ${openValidation.error}` };
  }
  
  const closeValidation = validateTime(closingTime);
  if (!closeValidation.valid) {
    return { valid: false, error: `Giờ đóng cửa: ${closeValidation.error}` };
  }
  
  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;
  
  if (openMinutes >= closeMinutes) {
    return { valid: false, error: 'Giờ đóng cửa phải sau giờ mở cửa' };
  }
  
  if (openHour < VALIDATION_RULES.TIME.OPENING_HOUR) {
    return { 
      valid: false, 
      error: `Giờ mở cửa sớm nhất là ${VALIDATION_RULES.TIME.OPENING_HOUR}:00` 
    };
  }
  
  if (closeHour > VALIDATION_RULES.TIME.CLOSING_HOUR) {
    return { 
      valid: false, 
      error: `Giờ đóng cửa muộn nhất là ${VALIDATION_RULES.TIME.CLOSING_HOUR}:00` 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate slot duration
 * @param {number} duration - Duration in minutes
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateSlotDuration = (duration) => {
  const num = sanitizeNumber(duration);
  
  if (num === null) {
    return { valid: false, error: 'Thời lượng slot không hợp lệ' };
  }
  
  if (num < VALIDATION_RULES.TIME.MIN_SLOT_DURATION) {
    return { 
      valid: false, 
      error: `Thời lượng slot tối thiểu là ${VALIDATION_RULES.TIME.MIN_SLOT_DURATION} phút` 
    };
  }
  
  if (num > VALIDATION_RULES.TIME.MAX_SLOT_DURATION) {
    return { 
      valid: false, 
      error: `Thời lượng slot tối đa là ${VALIDATION_RULES.TIME.MAX_SLOT_DURATION} phút` 
    };
  }
  
  // Must be divisible by 15 (15, 30, 45, 60, 90, 120, etc.)
  if (num % 15 !== 0) {
    return { valid: false, error: 'Thời lượng slot phải là bội số của 15 phút' };
  }
  
  return { valid: true, error: null, sanitized: num };
};

/**
 * Validate utilities array
 * @param {string[]} utilities - Array of utility names
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateUtilities = (utilities) => {
  if (!Array.isArray(utilities)) {
    return { valid: false, error: 'Tiện ích phải là danh sách' };
  }
  
  const sanitized = sanitizeArray(utilities);
  
  if (sanitized.length < VALIDATION_RULES.ARRAY.MIN_UTILITIES) {
    return { valid: true, error: null, sanitized }; // Allow empty utilities
  }
  
  if (sanitized.length > VALIDATION_RULES.ARRAY.MAX_UTILITIES) {
    return { 
      valid: false, 
      error: `Số lượng tiện ích tối đa là ${VALIDATION_RULES.ARRAY.MAX_UTILITIES}` 
    };
  }
  
  // Check for duplicates
  const uniqueUtilities = [...new Set(sanitized)];
  if (uniqueUtilities.length !== sanitized.length) {
    return { valid: false, error: 'Có tiện ích trùng lặp' };
  }
  
  return { valid: true, error: null, sanitized };
};

/**
 * Validate date (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateDate = (date) => {
  if (!date || typeof date !== 'string') {
    return { valid: false, error: 'Ngày không hợp lệ' };
  }
  
  if (!PATTERNS.DATE.test(date)) {
    return { valid: false, error: 'Định dạng ngày phải là YYYY-MM-DD' };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Ngày không tồn tại' };
  }
  
  return { valid: true, error: null, sanitized: date };
};

/**
 * Validate booking date (must be within allowed range)
 * @param {string} date - Date string to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateBookingDate = (date) => {
  const basicValidation = validateDate(date);
  if (!basicValidation.valid) return basicValidation;
  
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + VALIDATION_RULES.DATE.MIN_BOOKING_ADVANCE_DAYS);
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + VALIDATION_RULES.DATE.MAX_BOOKING_ADVANCE_DAYS);
  
  if (bookingDate < minDate) {
    return { 
      valid: false, 
      error: 'Không thể đặt sân cho ngày trong quá khứ' 
    };
  }
  
  if (bookingDate > maxDate) {
    return { 
      valid: false, 
      error: `Chỉ có thể đặt sân trước tối đa ${VALIDATION_RULES.DATE.MAX_BOOKING_ADVANCE_DAYS} ngày` 
    };
  }
  
  return { valid: true, error: null, sanitized: date };
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Số điện thoại không được để trống' };
  }
  
  const sanitized = phone.trim().replace(/\s/g, ''); // Remove spaces
  
  if (!PATTERNS.PHONE.test(sanitized)) {
    return { 
      valid: false, 
      error: 'Số điện thoại không hợp lệ (VD: 0901234567)' 
    };
  }
  
  return { valid: true, error: null, sanitized };
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email không được để trống' };
  }
  
  const sanitized = email.trim().toLowerCase();
  
  if (sanitized.length > VALIDATION_RULES.STRING.EMAIL_MAX) {
    return { 
      valid: false, 
      error: `Email không được vượt quá ${VALIDATION_RULES.STRING.EMAIL_MAX} ký tự` 
    };
  }
  
  if (!PATTERNS.EMAIL.test(sanitized)) {
    return { valid: false, error: 'Email không hợp lệ' };
  }
  
  return { valid: true, error: null, sanitized };
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'ID không hợp lệ' };
  }
  
  if (!PATTERNS.OBJECT_ID.test(id)) {
    return { valid: false, error: 'ID không đúng định dạng' };
  }
  
  return { valid: true, error: null };
};

// ============================================================================
// COMPOSITE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate complete field data (for create/update field)
 * @param {object} fieldData - Field data object
 * @returns {{valid: boolean, errors: object, sanitized: object}}
 */
export const validateFieldData = (fieldData) => {
  const errors = {};
  const sanitized = {};
  
  // Validate field name
  const nameValidation = validateFieldName(fieldData.fieldName);
  if (!nameValidation.valid) {
    errors.fieldName = nameValidation.error;
  } else {
    sanitized.fieldName = nameValidation.sanitized;
  }
  
  // Validate address
  const addressValidation = validateAddress(fieldData.address);
  if (!addressValidation.valid) {
    errors.address = addressValidation.error;
  } else {
    sanitized.address = addressValidation.sanitized;
  }
  
  // Validate price
  const priceValidation = validatePrice(fieldData.hourlyPrice);
  if (!priceValidation.valid) {
    errors.hourlyPrice = priceValidation.error;
  } else {
    sanitized.hourlyPrice = priceValidation.sanitized;
  }
  
  // Validate time range
  const timeRangeValidation = validateTimeRange(
    fieldData.openingTime, 
    fieldData.closingTime
  );
  if (!timeRangeValidation.valid) {
    errors.timeRange = timeRangeValidation.error;
  } else {
    sanitized.openingTime = fieldData.openingTime;
    sanitized.closingTime = fieldData.closingTime;
  }
  
  // Validate slot duration
  const slotDurationValidation = validateSlotDuration(fieldData.slotDuration);
  if (!slotDurationValidation.valid) {
    errors.slotDuration = slotDurationValidation.error;
  } else {
    sanitized.slotDuration = slotDurationValidation.sanitized;
  }
  
  // Validate utilities
  const utilitiesValidation = validateUtilities(fieldData.utilities);
  if (!utilitiesValidation.valid) {
    errors.utilities = utilitiesValidation.error;
  } else {
    sanitized.utilities = utilitiesValidation.sanitized;
  }
  
  // Validate description (optional)
  if (fieldData.description) {
    const descSanitized = sanitizeString(fieldData.description);
    if (descSanitized.length > VALIDATION_RULES.STRING.DESCRIPTION_MAX) {
      errors.description = `Mô tả không được vượt quá ${VALIDATION_RULES.STRING.DESCRIPTION_MAX} ký tự`;
    } else {
      sanitized.description = descSanitized;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate booking search filters
 * @param {object} filters - Filter object from search form
 * @returns {{valid: boolean, errors: object, sanitized: object}}
 */
export const validateSearchFilters = (filters) => {
  const errors = {};
  const sanitized = {};
  
  // Validate search text
  if (filters.searchText) {
    const searchSanitized = sanitizeString(filters.searchText);
    if (searchSanitized.length > 100) {
      errors.searchText = 'Từ khóa tìm kiếm quá dài';
    } else {
      sanitized.searchText = searchSanitized;
    }
  }
  
  // Validate price range
  if (filters.priceMin !== undefined) {
    const minValidation = validatePrice(filters.priceMin);
    if (!minValidation.valid) {
      errors.priceMin = minValidation.error;
    } else {
      sanitized.priceMin = minValidation.sanitized;
    }
  }
  
  if (filters.priceMax !== undefined) {
    const maxValidation = validatePrice(filters.priceMax);
    if (!maxValidation.valid) {
      errors.priceMax = maxValidation.error;
    } else {
      sanitized.priceMax = maxValidation.sanitized;
    }
  }
  
  // Validate price range logic
  if (sanitized.priceMin && sanitized.priceMax && sanitized.priceMin > sanitized.priceMax) {
    errors.priceRange = 'Giá tối thiểu không được lớn hơn giá tối đa';
  }
  
  // Validate date
  if (filters.date) {
    const dateValidation = validateBookingDate(filters.date);
    if (!dateValidation.valid) {
      errors.date = dateValidation.error;
    } else {
      sanitized.date = dateValidation.sanitized;
    }
  }
  
  // Validate time range
  if (filters.startTime && filters.endTime) {
    const timeValidation = validateTimeRange(filters.startTime, filters.endTime);
    if (!timeValidation.valid) {
      errors.timeRange = timeValidation.error;
    } else {
      sanitized.startTime = filters.startTime;
      sanitized.endTime = filters.endTime;
    }
  }
  
  // Validate utilities
  if (filters.utilities) {
    const utilitiesValidation = validateUtilities(filters.utilities);
    if (!utilitiesValidation.valid) {
      errors.utilities = utilitiesValidation.error;
    } else {
      sanitized.utilities = utilitiesValidation.sanitized;
    }
  }
  
  // Validate district (just sanitize)
  if (filters.district) {
    sanitized.district = sanitizeString(filters.district);
  }
  
  // Validate category name (just sanitize)
  if (filters.categoryName) {
    sanitized.categoryName = sanitizeString(filters.categoryName);
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  // Constants
  VALIDATION_RULES,
  PATTERNS,
  DANGEROUS_PATTERNS,
  
  // Sanitization
  sanitizeString,
  sanitizeNumber,
  sanitizeArray,
  
  // Field validation
  validateFieldName,
  validateAddress,
  validatePrice,
  validateTime,
  validateTimeRange,
  validateSlotDuration,
  validateUtilities,
  validateDate,
  validateBookingDate,
  validatePhone,
  validateEmail,
  validateObjectId,
  
  // Composite validation
  validateFieldData,
  validateSearchFilters
};

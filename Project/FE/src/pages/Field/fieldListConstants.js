/**
 * @fileoverview Constants cho FieldListPage
 */

/**
 * Price range constants
 * @constant
 */
export const PRICE_CONFIG = {
  MIN: 0,
  MAX: 2000000,
  STEP: 50000,
  DEFAULT_MAX: 1000000
};

/**
 * Default filter values
 * @constant
 */
export const DEFAULT_FILTERS = {
  searchText: '',
  categoryName: '',
  fieldTypeName: '',
  district: '',
  city: '',    // Tỉnh/Thành Phố  (e.g. "TP.HCM")
  ward: '',    // Phường/Xã/Quận  (e.g. "Quận 7")
  priceMax: PRICE_CONFIG.DEFAULT_MAX,
  date: '',
  startTime: '',
  endTime: '',
  status: 'all',
  sortBy: 'newest',
  page: 1,
  limit: 6
};

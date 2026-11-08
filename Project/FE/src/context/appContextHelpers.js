/**
 * @fileoverview AppContext constants & utility functions
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default pagination settings
 * @constant
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 0,
};

/**
 * API request status
 * @constant
 */
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Cache duration (5 minutes)
 * @constant
 */
export const CACHE_DURATION = 5 * 60 * 1000;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * getNestedValue - Lấy giá trị nested từ object
 *
 * @param {Object} obj - Object source
 * @param {string} path - Dot notation path (e.g., 'fieldType.category.categoryName')
 * @returns {*} - Value at path
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * sortFieldsData - Sort fields array
 *
 * @param {Array} fields - Fields array
 * @param {string} sortBy - Sort criteria
 * @returns {Array} - Sorted fields
 */
export const sortFieldsData = (fields, sortBy) => {
  const sortedFields = [...fields];

  switch (sortBy) {
    case 'name':
    case 'name_asc':
      return sortedFields.sort((a, b) =>
        (a.fieldName || '').localeCompare(b.fieldName || '', 'vi')
      );

    case 'name_desc':
      return sortedFields.sort((a, b) =>
        (b.fieldName || '').localeCompare(a.fieldName || '', 'vi')
      );

    case 'price_asc':
      return sortedFields.sort((a, b) =>
        (a.hourlyPrice || 0) - (b.hourlyPrice || 0)
      );

    case 'price_desc':
      return sortedFields.sort((a, b) =>
        (b.hourlyPrice || 0) - (a.hourlyPrice || 0)
      );

    case 'rating':
    case 'rating_desc':
      return sortedFields.sort((a, b) =>
        (b.averageRating || 0) - (a.averageRating || 0)
      );

    case 'newest':
      return sortedFields.sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

    default:
      return sortedFields;
  }
};

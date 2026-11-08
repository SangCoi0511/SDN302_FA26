/**
 * @fileoverview Custom Hooks - Reusable Hooks cho Sân Siêu Tốc
 * 
 * File này chứa các custom hooks được sử dụng nhiều nơi trong app:
 * - useSearch: Hook cho search functionality
 * - useFieldFilter: Hook cho field filtering
 * - usePagination: Hook cho pagination
 * - useApiCall: Hook cho single API calls
 * - useDebounce: Hook cho debounce input
 * 
 * @author San Sieu Toc Team
 * @date 2026-02-27
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';

// ============================================================================
// useDebounce - Debounce value changes
// ============================================================================

/**
 * useDebounce - Debounce một value sau delay
 * 
 * Dùng để tránh gọi API quá nhiều khi user đang typing
 * 
 * @param {*} value - Giá trị cần debounce
 * @param {number} [delay=300] - Delay time in ms
 * @returns {*} - Debounced value
 * 
 * @example
 * const [searchText, setSearchText] = useState('');
 * const debouncedSearch = useDebounce(searchText, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     searchFields({ searchText: debouncedSearch });
 *   }
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================================
// useSearch - Search functionality hook
// ============================================================================

/**
 * useSearch - Hook quản lý search state và logic
 * 
 * Cung cấp:
 * - searchText state với debounce
 * - results, loading, error states
 * - handleSearch function
 * - clearSearch function
 * 
 * @param {Object} options - Search options
 * @param {number} [options.debounceDelay=300] - Debounce delay
 * @param {boolean} [options.autoSearch=true] - Auto search khi debounced value thay đổi
 * @param {Object} [options.defaultFilters={}] - Default filter values
 * @returns {Object} - Search state và functions
 * 
 * @example
 * const {
 *   searchText,
 *   setSearchText,
 *   results,
 *   loading,
 *   error,
 *   handleSearch,
 *   clearSearch
 * } = useSearch({ autoSearch: true });
 */
export const useSearch = (options = {}) => {
  const {
    debounceDelay = 300,
    autoSearch = true,
    defaultFilters = {}
  } = options;

  const { searchFields, isLoading, getError, clearError } = useApp();

  // ==========================================
  // STATE
  // ==========================================
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  // Debounced search text
  const debouncedSearchText = useDebounce(searchText, debounceDelay);

  // ==========================================
  // HANDLERS
  // ==========================================

  /**
   * handleSearch - Thực hiện search
   * @param {Object} [customFilters] - Override filters
   */
  const handleSearch = useCallback(async (customFilters = {}) => {
    const searchFilters = {
      ...filters,
      ...customFilters,
      searchText: customFilters.searchText ?? debouncedSearchText,
      page: customFilters.page || 1
    };

    const result = await searchFields(searchFilters);

    if (result.success) {
      setResults(result.data.fields);
      setPagination(result.data.pagination);
    }

    return result;
  }, [filters, debouncedSearchText, searchFields]);

  /**
   * clearSearch - Reset search state
   */
  const clearSearch = useCallback(() => {
    setSearchText('');
    setFilters(defaultFilters);
    setResults([]);
    setPagination({ page: 1, limit: 9, total: 0, totalPages: 0 });
    clearError('searchFields');
  }, [defaultFilters, clearError]);

  /**
   * updateFilters - Update filter values
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * goToPage - Navigate to specific page
   * @param {number} page - Page number
   */
  const goToPage = useCallback((page) => {
    handleSearch({ page });
  }, [handleSearch]);

  // ==========================================
  // AUTO SEARCH EFFECT
  // ==========================================
  useEffect(() => {
    if (autoSearch && debouncedSearchText !== undefined) {
      handleSearch();
    }
  }, [debouncedSearchText]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==========================================
  // RETURN
  // ==========================================
  return {
    // States
    searchText,
    setSearchText,
    filters,
    results,
    pagination,
    loading: isLoading('searchFields'),
    error: getError('searchFields'),

    // Actions
    handleSearch,
    clearSearch,
    updateFilters,
    goToPage
  };
};

// ============================================================================
// useFieldFilter - Field filtering hook
// ============================================================================

/**
 * useFieldFilter - Hook quản lý field filter state
 * 
 * Dùng cho FieldListPage với sticky sidebar
 * 
 * @param {Object} [initialFilters] - Initial filter values
 * @returns {Object} - Filter state và functions
 * 
 * @example
 * const {
 *   filters,
 *   setFilter,
 *   resetFilters,
 *   activeFilterCount,
 *   fieldTypes
 * } = useFieldFilter();
 */
export const useFieldFilter = (initialFilters = {}) => {
  const { globalData, getFieldTypesByCategory, searchFields, isLoading } = useApp();

  // ==========================================
  // STATE
  // ==========================================
  const [filters, setFilters] = useState({
    searchText: '',
    categoryName: '',
    fieldTypeName: '',
    district: '',
    priceMin: 0,
    priceMax: 1000000,
    date: '',
    startTime: '',
    endTime: '',
    sortBy: 'name',
    ...initialFilters
  });

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  /**
   * Field types dựa trên category đã chọn
   * Chỉ hiển thị khi category = Football
   */
  const fieldTypes = useMemo(() => {
    if (filters.categoryName === 'Football') {
      return getFieldTypesByCategory('Football');
    }
    return [];
  }, [filters.categoryName, getFieldTypesByCategory]);

  /**
   * Số lượng filter đang active
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.categoryName) count++;
    if (filters.fieldTypeName) count++;
    if (filters.district) count++;
    if (filters.priceMin > 0) count++;
    if (filters.priceMax < 1000000) count++;
    if (filters.date) count++;
    return count;
  }, [filters]);

  // ==========================================
  // HANDLERS
  // ==========================================

  /**
   * setFilter - Update một filter value
   * @param {string} key - Filter key
   * @param {*} value - Filter value
   */
  const setFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Reset fieldTypeName khi đổi category (trừ Football)
      if (key === 'categoryName' && value !== 'Football') {
        newFilters.fieldTypeName = '';
      }
      
      return newFilters;
    });
  }, []);

  /**
   * setMultipleFilters - Update nhiều filters cùng lúc
   * @param {Object} newFilters - Object chứa filters mới
   */
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * resetFilters - Reset về initial state
   */
  const resetFilters = useCallback(() => {
    setFilters({
      searchText: '',
      categoryName: '',
      fieldTypeName: '',
      district: '',
      priceMin: 0,
      priceMax: 1000000,
      date: '',
      startTime: '',
      endTime: '',
      sortBy: 'name',
      ...initialFilters
    });
  }, [initialFilters]);

  /**
   * applyFilters - Apply filters và search
   * @param {number} [page=1] - Page number
   */
  const applyFilters = useCallback(async (page = 1) => {
    const result = await searchFields({ ...filters, page });
    
    if (result.success) {
      setResults(result.data.fields);
      setPagination(result.data.pagination);
    }
    
    return result;
  }, [filters, searchFields]);

  // ==========================================
  // RETURN
  // ==========================================
  return {
    // States
    filters,
    results,
    pagination,
    loading: isLoading('searchFields'),

    // Computed
    fieldTypes,
    activeFilterCount,
    categories: globalData.categories,
    districts: globalData.districts,
    priceRange: globalData.priceRange,

    // Actions
    setFilter,
    setMultipleFilters,
    resetFilters,
    applyFilters
  };
};

// ============================================================================
// usePagination - Pagination hook
// ============================================================================

/**
 * usePagination - Hook quản lý pagination state
 * 
 * @param {Object} options - Pagination options
 * @param {number} [options.initialPage=1] - Initial page
 * @param {number} [options.itemsPerPage=9] - Items per page
 * @param {number} [options.totalItems=0] - Total items
 * @returns {Object} - Pagination state và functions
 * 
 * @example
 * const {
 *   currentPage,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   prevPage,
 *   pageNumbers
 * } = usePagination({ totalItems: 100, itemsPerPage: 10 });
 */
export const usePagination = (options = {}) => {
  const {
    initialPage = 1,
    itemsPerPage = 9,
    totalItems = 0
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  /**
   * goToPage - Navigate to specific page
   * @param {number} page - Page number
   */
  const goToPage = useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  /**
   * nextPage - Go to next page
   */
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  /**
   * prevPage - Go to previous page
   */
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  /**
   * Generate page numbers for pagination UI
   * Shows: [1] ... [4] [5] [6] ... [10]
   */
  const pageNumbers = useMemo(() => {
    const pages = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show with ellipsis
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  // Reset to page 1 when totalItems changes
  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    pageNumbers
  };
};

// ============================================================================
// useApiCall - Single API call hook
// ============================================================================

/**
 * useApiCall - Hook cho single API call với loading/error states
 * 
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Options
 * @param {boolean} [options.immediate=false] - Call immediately on mount
 * @param {Array} [options.deps=[]] - Dependencies for auto-refetch
 * @returns {Object} - { data, loading, error, execute, reset }
 * 
 * @example
 * const { data, loading, error, execute } = useApiCall(
 *   () => fieldService.getFieldDetail(fieldId),
 *   { immediate: true }
 * );
 */
export const useApiCall = (apiFunction, options = {}) => {
  const { immediate = false, deps = [] } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);

  /**
   * execute - Execute API call
   * @param {...any} args - Arguments to pass to API function
   */
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      
      if (isMounted.current) {
        setData(result);
      }
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi xảy ra';
      
      if (isMounted.current) {
        setError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiFunction]);

  /**
   * reset - Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Immediate execution
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

// ============================================================================
// useLocalStorage - Local storage hook
// ============================================================================

/**
 * useLocalStorage - Hook để sync state với localStorage
 * 
 * @param {string} key - LocalStorage key
 * @param {*} initialValue - Initial value
 * @returns {[*, Function]} - [value, setValue]
 * 
 * @example
 * const [savedFilters, setSavedFilters] = useLocalStorage('fieldFilters', {});
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// ============================================================================
// useClickOutside - Detect click outside element
// ============================================================================

/**
 * useClickOutside - Hook detect click outside một hoặc nhiều elements
 * 
 * Dùng cho dropdown, modal, popup
 * Hỗ trợ multiple refs cho trường hợp Portal (dropdown ở ngoài DOM hierarchy)
 * 
 * @param {Function} handler - Callback khi click outside
 * @param {Array<React.RefObject>} [additionalRefs=[]] - Các refs bổ sung cần check (VD: Portal dropdown)
 * @returns {React.RefObject} - Ref chính để attach vào element
 * 
 * @example
 * // Single element
 * const dropdownRef = useClickOutside(() => setIsOpen(false));
 * <div ref={dropdownRef}>Dropdown content</div>
 * 
 * @example
 * // Multiple elements (Portal pattern)
 * const portalRef = useRef(null);
 * const triggerRef = useClickOutside(() => setIsOpen(false), [portalRef]);
 * <div ref={triggerRef}>Trigger</div>
 * {createPortal(<div ref={portalRef}>Portal content</div>, document.body)}
 */
export const useClickOutside = (handler, additionalRefs = []) => {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      // Check main ref
      if (ref.current && ref.current.contains(event.target)) {
        return;
      }
      
      // Check additional refs (cho Portal pattern)
      for (const additionalRef of additionalRefs) {
        if (additionalRef.current && additionalRef.current.contains(event.target)) {
          return;
        }
      }
      
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, additionalRefs]);

  return ref;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  useDebounce,
  useSearch,
  useFieldFilter,
  usePagination,
  useApiCall,
  useLocalStorage,
  useClickOutside
};

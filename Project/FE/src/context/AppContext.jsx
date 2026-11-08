/**
 * @fileoverview AppContext - Global Application Context
 * 
 * Context này quản lý tập trung các operations dùng chung trong toàn ứng dụng:
 * - API Handler: Wrapper cho axios với loading/error states
 * - Search Functions: Tìm kiếm fields, categories, etc.
 * - CRUD Operations: Generic CRUD cho các entities
 * - Filter Functions: Xử lý filter logic
 * - Global State: Categories, FieldTypes, Districts (dùng chung nhiều nơi)
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getCategoriesAndTypes } from '../services/fieldService';

// Extracted hooks & helpers
import { REQUEST_STATUS, CACHE_DURATION } from './appContextHelpers';
import useApiHandler from './useApiHandler';
import useCrudOperations from './useCrudOperations';
import useSearchAndFilter from './useSearchAndFilter';

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AppContext = createContext(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const AppProvider = ({ children }) => {
  // ==========================================
  // API HANDLER (loading, error, apiRequest)
  // ==========================================

  const {
    loadingStates,
    errorStates,
    setLoading,
    setError,
    clearError,
    apiRequest,
    isLoading,
    getError,
  } = useApiHandler();

  // ==========================================
  // GLOBAL DATA STATE
  // ==========================================

  const [globalData, setGlobalData] = useState({
    categories: [],
    fieldTypes: [],
    districts: [],
    priceRange: { min: 0, max: 1000000 },
    fields: [],
    lastFetch: null,
  });

  // ==========================================
  // SEARCH & FILTER
  // ==========================================

  const {
    searchState,
    searchFields,
    quickSearch,
    filterData,
    getFieldTypesByCategory,
  } = useSearchAndFilter(setLoading, setError, clearError, globalData);

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  const {
    fetchOne,
    fetchList,
    createOne,
    updateOne,
    deleteOne,
  } = useCrudOperations(apiRequest);

  // ==========================================
  // DATA FETCHING
  // ==========================================

  const fetchGlobalData = useCallback(async (force = false) => {
    const now = Date.now();

    if (!force && globalData.lastFetch && (now - globalData.lastFetch) < CACHE_DURATION) {
      return { success: true, data: globalData };
    }

    try {
      const result = await getCategoriesAndTypes();
      if (result.success) {
        setGlobalData(prev => ({
          ...prev,
          categories: result.data.categories || [],
          fieldTypes: result.data.fieldTypes || [],
          lastFetch: now,
        }));
      }
      return result.success
        ? { success: true, data: globalData }
        : { success: false, error: result.error };
    } catch (error) {
      console.error('fetchGlobalData error:', error);
      return { success: false, error: error.message };
    }
  }, [globalData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchGlobalData(); }, []);

  const refreshFields = useCallback(async () => {
    const result = await searchFields({});
    if (result.success) {
      setGlobalData(prev => ({
        ...prev,
        fields: result.data.fields,
      }));
    }
    return result;
  }, [searchFields]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const contextValue = useMemo(() => ({
    // States
    loadingStates,
    errorStates,
    globalData,
    searchState,

    // Loading/Error helpers
    isLoading,
    getError,
    clearError,

    // API Handler
    apiRequest,

    // Search Functions
    searchFields,
    quickSearch,

    // Filter Functions
    filterData,
    getFieldTypesByCategory,

    // CRUD Operations
    fetchOne,
    fetchList,
    createOne,
    updateOne,
    deleteOne,

    // Data Fetching
    fetchGlobalData,
    refreshFields,

    // Constants
    REQUEST_STATUS,
  }), [
    loadingStates,
    errorStates,
    globalData,
    searchState,
    isLoading,
    getError,
    clearError,
    apiRequest,
    searchFields,
    quickSearch,
    filterData,
    getFieldTypesByCategory,
    fetchOne,
    fetchList,
    createOne,
    updateOne,
    deleteOne,
    fetchGlobalData,
    refreshFields,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AppContext;

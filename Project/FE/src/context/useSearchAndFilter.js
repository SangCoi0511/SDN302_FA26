/**
 * @fileoverview useSearchAndFilter - Search & Filter operations cho AppContext
 */

import { useState, useCallback } from 'react';
import { searchFields as fieldServiceSearch } from '../services/fieldService';
import { DEFAULT_PAGINATION, getNestedValue } from './appContextHelpers';

const useSearchAndFilter = (setLoading, setError, clearError, globalData) => {
  const [searchState, setSearchState] = useState({
    query: '',
    filters: {},
    results: [],
    pagination: DEFAULT_PAGINATION,
  });

  /**
   * searchFields - Tìm kiếm sân thể thao
   */
  const searchFields = useCallback(async (filters = {}) => {
    const requestKey = 'searchFields';
    setLoading(requestKey, true);
    clearError(requestKey);

    try {
      const sanitizedFilters = {
        ...filters,
        searchText: filters.searchText ? filters.searchText.trim() : '',
      };

      const result = await fieldServiceSearch(sanitizedFilters);

      if (result.success) {
        setSearchState({
          query: sanitizedFilters.searchText || '',
          filters: sanitizedFilters,
          results: result.data.fields,
          pagination: result.data.pagination,
        });
      } else {
        setError(requestKey, result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error.message || 'Lỗi tìm kiếm sân';
      setError(requestKey, errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(requestKey, false);
    }
  }, [setLoading, setError, clearError]);

  /**
   * quickSearch - Tìm kiếm nhanh (autocomplete)
   */
  const quickSearch = useCallback(async (query, limit = 5) => {
    const requestKey = 'quickSearch';

    if (!query || query.length < 1) return [];

    setLoading(requestKey, true);

    try {
      const sanitizedQuery = query.trim();
      const result = await fieldServiceSearch({
        searchText: sanitizedQuery,
        status: 'all',
        page: 1,
        limit: 100,
      });

      if (!result.success) return [];

      return result.data.fields.slice(0, limit).map((field) => ({
        id: field._id,
        name: field.fieldName,
        address: field.address,
        category:
          field.fieldType?.category?.categoryName || field.fieldType?.typeName,
        price: field.hourlyPrice,
        imageUrl: (field.images || field.image)?.[0] || null,
      }));
    } catch (error) {
      console.error('Quick search error:', error);
      return [];
    } finally {
      setLoading(requestKey, false);
    }
  }, [setLoading]);

  /**
   * filterData - Generic filter function
   */
  const filterData = useCallback((data, filters) => {
    if (!Array.isArray(data) || !filters || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          return true;
        }

        const itemValue = getNestedValue(item, key);

        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }

        if (key.endsWith('Min')) {
          const actualKey = key.replace('Min', '');
          const actualValue = getNestedValue(item, actualKey);
          return actualValue >= value;
        }

        if (key.endsWith('Max')) {
          const actualKey = key.replace('Max', '');
          const actualValue = getNestedValue(item, actualKey);
          return actualValue <= value;
        }

        if (typeof itemValue === 'string' && typeof value === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }

        return itemValue === value;
      });
    });
  }, []);

  /**
   * getFieldTypesByCategory - Lấy field types theo category
   *
   * Sau khi cập nhật DB, BE trả về fieldtypes.categoryID là raw ObjectId string
   * (không populate). Cần normalize cả hai phía về string trước khi so sánh
   * để tránh fail khi một trong hai là object { _id/toString } hoặc MongoId object.
   */
  const getFieldTypesByCategory = useCallback(
    (categoryName) => {
      if (!categoryName) return [];

      const category = globalData.categories.find(
        (cat) => cat.categoryName === categoryName
      );

      if (!category) return [];

      // Normalize category._id: hỗ trợ plain string, ObjectId object, { $oid } (MongoDB shell format)
      const categoryIdStr = String(
        category._id?.$oid ?? category._id?._id ?? category._id ?? ''
      );

      return globalData.fieldTypes.filter((type) => {
        // Normalize type.categoryID: hỗ trợ plain string, ObjectId object, { $oid }, populated object
        const catId = String(
          type.categoryID?.$oid ??
            type.categoryID?._id ??
            type.categoryID ??
            ''
        );
        return catId === categoryIdStr;
      });
    },
    [globalData.categories, globalData.fieldTypes]
  );

  return {
    searchState,
    searchFields,
    quickSearch,
    filterData,
    getFieldTypesByCategory,
  };
};

export default useSearchAndFilter;

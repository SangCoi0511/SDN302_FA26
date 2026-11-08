/**
 * @fileoverview useCrudOperations - Generic CRUD operations cho AppContext
 */

import { useCallback } from 'react';
import { API_CONFIG } from '../config/api.config';

const useCrudOperations = (apiRequest) => {
  /**
   * fetchOne - Lấy một item theo ID
   */
  const fetchOne = useCallback(async (entity, id) => {
    const endpoints = {
      field: API_CONFIG.ENDPOINTS.FIELD.DETAIL,
      booking: API_CONFIG.ENDPOINTS.BOOKING.DETAIL,
      customer: API_CONFIG.ENDPOINTS.CUSTOMER.PROFILE,
    };

    const urlBuilder = endpoints[entity];
    if (!urlBuilder) {
      return { success: false, error: `Unknown entity: ${entity}` };
    }

    const url = typeof urlBuilder === 'function' ? urlBuilder(id) : urlBuilder;

    return apiRequest({
      key: `fetch_${entity}_${id}`,
      method: 'GET',
      url,
    });
  }, [apiRequest]);

  /**
   * fetchList - Lấy danh sách items
   */
  const fetchList = useCallback(async (entity, params = {}) => {
    const endpoints = {
      fields: API_CONFIG.ENDPOINTS.FIELD.LIST,
      bookings: API_CONFIG.ENDPOINTS.BOOKING.LIST,
    };

    const url = endpoints[entity];
    if (!url) {
      return { success: false, error: `Unknown entity: ${entity}` };
    }

    return apiRequest({
      key: `fetchList_${entity}`,
      method: 'GET',
      url,
      params,
    });
  }, [apiRequest]);

  /**
   * createOne - Tạo mới một item
   */
  const createOne = useCallback(async (entity, data) => {
    const endpoints = {
      field: API_CONFIG.ENDPOINTS.FIELD.CREATE,
      booking: API_CONFIG.ENDPOINTS.BOOKING.CREATE,
      feedback: API_CONFIG.ENDPOINTS.FEEDBACK.CREATE,
    };

    const url = endpoints[entity];
    if (!url) {
      return { success: false, error: `Unknown entity: ${entity}` };
    }

    return apiRequest({
      key: `create_${entity}`,
      method: 'POST',
      url,
      data,
    });
  }, [apiRequest]);

  /**
   * updateOne - Cập nhật một item
   */
  const updateOne = useCallback(async (entity, id, data) => {
    const endpoints = {
      field: API_CONFIG.ENDPOINTS.FIELD.UPDATE,
      customer: () => API_CONFIG.ENDPOINTS.CUSTOMER.UPDATE_PROFILE,
    };

    const urlBuilder = endpoints[entity];
    if (!urlBuilder) {
      return { success: false, error: `Unknown entity: ${entity}` };
    }

    const url = typeof urlBuilder === 'function' ? urlBuilder(id) : urlBuilder;

    return apiRequest({
      key: `update_${entity}_${id}`,
      method: 'PUT',
      url,
      data,
    });
  }, [apiRequest]);

  /**
   * deleteOne - Xóa một item
   */
  const deleteOne = useCallback(async (entity, id) => {
    const endpoints = {
      field: API_CONFIG.ENDPOINTS.FIELD.DELETE,
      booking: API_CONFIG.ENDPOINTS.BOOKING.CANCEL,
    };

    const urlBuilder = endpoints[entity];
    if (!urlBuilder) {
      return { success: false, error: `Unknown entity: ${entity}` };
    }

    const url = typeof urlBuilder === 'function' ? urlBuilder(id) : urlBuilder;

    return apiRequest({
      key: `delete_${entity}_${id}`,
      method: 'DELETE',
      url,
    });
  }, [apiRequest]);

  return {
    fetchOne,
    fetchList,
    createOne,
    updateOne,
    deleteOne,
  };
};

export default useCrudOperations;

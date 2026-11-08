/**
 * @fileoverview useApiHandler - API request wrapper with loading/error states
 */

import { useState, useCallback } from 'react';
import axiosInstance from '../services/axios';

const useApiHandler = () => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const setError = useCallback((key, error) => {
    setErrorStates(prev => ({ ...prev, [key]: error }));
  }, []);

  const clearError = useCallback((key) => {
    setErrorStates(prev => ({ ...prev, [key]: null }));
  }, []);

  /**
   * apiRequest - Generic API request wrapper với loading/error handling
   */
  const apiRequest = useCallback(async ({
    key,
    method = 'GET',
    url,
    data = null,
    params = null,
    showError = true,
  }) => {
    setLoading(key, true);
    clearError(key);

    try {
      const config = {
        method,
        url,
        ...(data && { data }),
        ...(params && { params }),
      };

      const response = await axiosInstance(config);

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';

      if (showError) {
        setError(key, errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
        status: error.response?.status || 500,
      };
    } finally {
      setLoading(key, false);
    }
  }, [setLoading, setError, clearError]);

  const isLoading = useCallback(
    (key) => loadingStates[key] || false,
    [loadingStates]
  );

  const getError = useCallback(
    (key) => errorStates[key] || null,
    [errorStates]
  );

  return {
    loadingStates,
    errorStates,
    setLoading,
    setError,
    clearError,
    apiRequest,
    isLoading,
    getError,
  };
};

export default useApiHandler;

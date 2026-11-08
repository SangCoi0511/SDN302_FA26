/**
 * Auth Service
 * Handles all authentication API calls
 * 
 * @description Service gọi API Auth từ Backend
 * @note Đồng bộ với BE routes: /api/customer/auth/*
 * @date 2026-03-02
 */

import axiosInstance from './axios';
import { API_CONFIG } from '../config/api.config';

const { ENDPOINTS } = API_CONFIG;

/**
 * Customer Authentication Service
 */
const authService = {
  
  // ============================================
  // CUSTOMER AUTH
  // ============================================
  
  /**
   * Login customer
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { success, message, data: { customer, token } }
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CUSTOMER_AUTH.LOGIN,
        credentials
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  /**
   * Register new customer
   * @param {Object} userData - { name, email, password, phone }
   * @returns {Promise<Object>} - { success, message, data: { customer, token } }
   */
  register: async (userData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CUSTOMER_AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  /**
   * Request password reset (send email)
   * @param {string} email - Customer email
   * @returns {Promise<Object>} - { success, message }
   */
  resetPassword: async (email) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CUSTOMER_AUTH.RESET_PASSWORD,
        { email }
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  /**
   * Change password (requires authentication)
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise<Object>} - { success, message }
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.put(
        ENDPOINTS.CUSTOMER_AUTH.CHANGE_PASSWORD,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  // ============================================
  // CUSTOMER PROFILE
  // ============================================
  
  /**
   * Get current customer profile
   * @returns {Promise<Object>} - { success, data: { customer } }
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.CUSTOMER_PROFILE.GET
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  /**
   * Update customer profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - { success, message, data: { customer } }
   */
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put(
        ENDPOINTS.CUSTOMER_PROFILE.UPDATE,
        profileData
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  // ============================================
  // MANAGER AUTH (Cho Admin Dashboard)
  // ============================================
  
  /**
   * Login manager/admin
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { success, message, data: { manager, token } }
   */
  loginManager: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.MANAGER_AUTH.LOGIN,
        credentials
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Request password reset for manager (send email)
   * @param {string} email - Manager email
   * @returns {Promise<Object>} - { success, message }
   */
  resetManagerPassword: async (email) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.MANAGER_AUTH.RESET_PASSWORD,
        { email }
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  /**
   * Get manager profile
   * @returns {Promise<Object>} - { success, data: { manager } }
   */
  getManagerProfile: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.MANAGER_PROFILE.GET
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Update manager profile
   * @param {Object} profileData - { name, phone, image?, imageQR? }
   *   image   — base64 string (data:image/...) → BE uploads to Cloudinary
   *   imageQR — base64 string (data:image/...) → BE saves directly to DB
   * @returns {Promise<Object>} - { success, message, data: { manager } }
   */
  updateManagerProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put(
        ENDPOINTS.MANAGER_PROFILE.UPDATE,
        profileData
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Change manager password (requires authentication)
   * @param {Object} passwordData - { currentPassword, newPassword, confirmNewPassword }
   * @returns {Promise<Object>} - { success, message }
   */
  changePasswordManager: async (passwordData) => {
    try {
      const response = await axiosInstance.put(
        ENDPOINTS.MANAGER_AUTH.CHANGE_PASSWORD,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },
  
  // ============================================
  // ERROR HANDLER
  // ============================================
  
  /**
   * Handle API errors uniformly
   * @param {Error} error - Axios error object
   * @returns {Object} - Formatted error object
   */
  handleError: (error) => {
    // Server responded with error
    if (error.response) {
      const { status, data } = error.response;
      
      return {
        success: false,
        status,
        message: data.message || 'Đã có lỗi xảy ra',
        errors: data.errors || null,
      };
    }
    
    // Network error (no response)
    if (error.request) {
      return {
        success: false,
        status: 0,
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        errors: null,
      };
    }
    
    // Other errors
    return {
      success: false,
      status: 0,
      message: error.message || 'Đã có lỗi xảy ra',
      errors: null,
    };
  },
};

export default authService;

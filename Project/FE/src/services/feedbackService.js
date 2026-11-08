/**
 * Feedback Service
 * Handles all feedback-related API calls
 *
 * Endpoints (from api.config.js → FEEDBACK):
 *   GET /api/feedback/field/:fieldId      → getFeedbacksByField
 *   GET /api/feedback/stats/field/:fieldId → getFieldStats
 */

import axiosInstance from './axios';
import { API_CONFIG } from '../config/api.config';

const ENDPOINTS = API_CONFIG.ENDPOINTS;

const feedbackService = {
  /**
   * Get feedbacks for a specific field (paginated)
   * @param {string} fieldId
   * @param {Object} [options]
   * @param {number} [options.page=1]
   * @param {number} [options.limit=10]
   * @returns {Promise<{success:boolean, data?:Array, total?:number, error?:string}>}
   */
  async getFeedbacksByField(fieldId, options = {}) {
    try {
      if (!fieldId) return { success: false, data: [], error: 'Field ID is required' };
      const { page = 1, limit = 50 } = options;
      const response = await axiosInstance.get(ENDPOINTS.FEEDBACK.BY_FIELD(fieldId), {
        params: { page, limit },
      });
      // BE response shape: { success, data: feedbacks[], averageRating, pagination }
      // "data" is the array directly (not wrapped in an object)
      const raw = response.data;
      const feedbacks = raw?.data || [];
      const averageRating = raw?.averageRating ?? 0;
      const total = raw?.pagination?.totalItems ?? feedbacks.length;
      return { success: true, data: feedbacks, averageRating, total };
    } catch (error) {
      console.error('getFeedbacksByField error:', error);
      return { success: false, data: [], error: error.response?.data?.message || error.message };
    }
  },

  /**
   * Get rating stats for a field (averageRating, totalReviews)
   * @param {string} fieldId
   * @returns {Promise<{success:boolean, data?:Object, error?:string}>}
   */
  async getFieldStats(fieldId) {
    try {
      if (!fieldId) return { success: false, data: null, error: 'Field ID is required' };
      const response = await axiosInstance.get(ENDPOINTS.FEEDBACK.STATS(fieldId));
      const raw = response.data?.data || response.data;
      return {
        success: true,
        data: {
          averageRating: raw?.averageRating ?? 0,
          totalReviews: raw?.totalReviews ?? 0,
        },
      };
    } catch (error) {
      console.error('getFieldStats error:', error);
      return {
        success: false,
        data: { averageRating: 0, totalReviews: 0 },
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Create a new feedback
   * BE fields: bookingDetailID, rate (1-5), content (10-500 chars)
   * Only allowed when BookingDetail.status === 'Completed'
   * @param {{ bookingDetailId: string, rating: number, comment: string }} payload
   */
  async createFeedback(payload) {
    try {
      const { bookingDetailId, rating, comment } = payload;
      // Map FE field names → BE field names
      const response = await axiosInstance.post(ENDPOINTS.FEEDBACK.CREATE, {
        bookingDetailID: bookingDetailId,
        rate: rating,
        content: comment,
      });
      const raw = response.data?.data || response.data;
      return { success: true, data: raw };
    } catch (error) {
      console.error('createFeedback error:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  /**
   * Update an existing feedback
   * BE fields: rate, content
   * @param {string} feedbackId
   * @param {{ rating?: number, comment?: string }} payload
   */
  async updateFeedback(feedbackId, payload) {
    try {
      const { rating, comment } = payload;
      const response = await axiosInstance.put(ENDPOINTS.FEEDBACK.UPDATE(feedbackId), {
        rate: rating,
        content: comment,
      });
      const raw = response.data?.data || response.data;
      return { success: true, data: raw };
    } catch (error) {
      console.error('updateFeedback error:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  /**
   * Delete a feedback
   * @param {string} feedbackId
   */
  async deleteFeedback(feedbackId) {
    try {
      await axiosInstance.delete(ENDPOINTS.FEEDBACK.DELETE(feedbackId));
      return { success: true };
    } catch (error) {
      console.error('deleteFeedback error:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
};

export default feedbackService;

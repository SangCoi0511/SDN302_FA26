/**
 * Booking Service
 * Handles all booking-related API calls
 * 
 * Endpoints (from api.config.js → BOOKINGS):
 *   POST /api/customer/bookings                         → createBooking
 *   GET  /api/customer/bookings/my-bookings             → getMyBookings
 *   PUT  /api/customer/bookings/:id/cancel              → cancelBooking
 *   GET  /api/customer/fields/:fieldId/availability     → (in fieldService)
 */

import axiosInstance from './axios';
import { API_CONFIG } from '../config/api.config';

const bookingService = {
  /**
   * Create a new booking
   * 
   * BE expects: { fieldId, startDate, selectedSlots: [{startTime, endTime}], repeatType, duration }
   * BE returns: { bookingId, totalPrice, depositAmount, status, qrCode, managerInfo, bookingDetails, message }
   * 
   * @param {Object} bookingData
   * @param {string} bookingData.fieldId - Field ID
   * @param {string} bookingData.startDate - Start date (YYYY-MM-DD)
   * @param {Array}  bookingData.selectedSlots - [{startTime: "HH:mm", endTime: "HH:mm"}]
   * @param {string} bookingData.repeatType - "once" | "weekly" | "recurring"
   * @param {number} [bookingData.duration] - 1|2|3 months (only for "recurring")
   * @returns {Promise} API response
   */
  async createBooking(bookingData) {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.BOOKINGS.CREATE,
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  /**
   * Get customer's booking list
   * @returns {Promise} API response with booking list
   */
  async getMyBookings() {
    try {
      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.BOOKINGS.MY_BOOKINGS
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching booking list:', error);
      throw error;
    }
  },

  /**
   * Cancel a booking (only when status is "Pending")
   * @param {string} bookingId - Booking ID
   * @returns {Promise} API response
   */
  async cancelBooking(bookingId) {
    try {
      const response = await axiosInstance.put(
        API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL(bookingId),
        {},
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  },

  /**
   * Renew a recurring contract booking
   * @param {string} bookingId
   * @param {number} duration - 1|2|3 months
   * @returns {Promise} API response
   */
  async renewBooking(bookingId, duration) {
    try {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.BOOKINGS.RENEW(bookingId),
        { duration }
      );
      return response.data;
    } catch (error) {
      console.error('Error renewing booking:', error);
      throw error;
    }
  },
};

export default bookingService;

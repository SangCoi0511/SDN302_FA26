/**
 * @fileoverview Manager Service - API Layer for Manager Dashboard Operations
 *
 * Calls real backend endpoints:
 *   GET /api/manager/dashboard/stats         → getDashboardStats
 *   GET /api/manager/dashboard/summary       → getDashboardSummary
 *   GET /api/manager/dashboard/recent-bookings → getRecentBookings
 *   GET /api/manager/customers               → getCustomers
 *   GET /api/manager/customers/stats         → getCustomerStats
 *   GET /api/manager/customers/:id           → getCustomerById
 *   PUT /api/manager/customers/:id/status    → updateCustomerStatus
 *   GET /api/feedback/all                    → getAllFeedbacks (manager view)
 *   DELETE /api/feedback/delete/:id          → deleteFeedback
 *   GET /api/manager/field/categories        → getManagerCategories
 *   GET /api/manager/field/types/category/:catId → getManagerTypesByCategory
 *   GET /api/manager/field/create-form       → getFieldCreateForm
 *   GET /api/manager/field/:id               → getManagerFieldById
 *   POST /api/manager/field/create           → createField
 *   PUT /api/manager/field/:id               → updateField
 *   DELETE /api/manager/field/:id            → deleteField
 *
 * All functions return { success: boolean, data?: any, error?: string }
 *
 * @author San Sieu Toc Team
 */
import axiosInstance from "./axios";
import { API_CONFIG } from "../config/api.config";

const { ENDPOINTS } = API_CONFIG;

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Get full dashboard statistics.
 * GET /api/manager/dashboard/stats
 */
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.STATS);
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return {
      success: false,
      data: null,
      error:
        error.response?.data?.message || error.message || "Lỗi tải thống kê",
    };
  }
};

/**
 * Get dashboard summary (fields/customers/bookings/feedbacks counts).
 * GET /api/manager/dashboard/summary
 */
export const getDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.SUMMARY);
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("getDashboardSummary error:", error);
    return {
      success: false,
      data: null,
      error:
        error.response?.data?.message || error.message || "Lỗi tải tổng quan",
    };
  }
};

/**
 * Get recent bookings for dashboard table.
 * GET /api/manager/dashboard/recent-bookings?limit=20
 * @param {number} [limit=20]
 */
export const getRecentBookings = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(
      ENDPOINTS.DASHBOARD.RECENT_BOOKINGS,
      {
        params: { limit },
      },
    );
    const raw = response.data?.data || response.data;
    const bookings = raw?.bookings || raw?.recentBookings || raw || [];
    return { success: true, data: bookings };
  } catch (error) {
    console.error("getRecentBookings error:", error);
    return {
      success: false,
      data: [],
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải đặt sân gần đây",
    };
  }
};

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Get all customers (paginated, searchable).
 * GET /api/manager/customers?page=1&limit=10&search=&status=
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=50]
 * @param {string} [params.search]
 * @param {string} [params.status]
 */
export const getCustomers = async (params = {}) => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.MANAGER_CUSTOMERS.LIST, {
      params,
    });
    const raw = response.data?.data || response.data;
    const customers = raw?.customers || raw || [];
    const total = raw?.total || customers.length;
    return { success: true, data: customers, total };
  } catch (error) {
    console.error("getCustomers error:", error);
    return {
      success: false,
      data: [],
      total: 0,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải danh sách khách hàng",
    };
  }
};

/**
 * Get customer statistics (total/active/inactive/banned counts).
 * GET /api/manager/customers/stats
 */
export const getCustomerStats = async () => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.MANAGER_CUSTOMERS.STATS);
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("getCustomerStats error:", error);
    return {
      success: false,
      data: null,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải thống kê khách hàng",
    };
  }
};

/**
 * Get a single customer's detail.
 * GET /api/manager/customers/:id
 * @param {string} customerId
 */
export const getCustomerById = async (customerId) => {
  try {
    if (!customerId)
      return { success: false, data: null, error: "Customer ID is required" };
    const response = await axiosInstance.get(
      ENDPOINTS.MANAGER_CUSTOMERS.DETAIL(customerId),
    );
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("getCustomerById error:", error);
    return {
      success: false,
      data: null,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải thông tin khách hàng",
    };
  }
};

/**
 * Update a customer's status (active / banned).
 * PUT /api/manager/customers/:id/status
 * @param {string} customerId
 * @param {string} status - 'active' | 'banned' | 'inactive'
 */
export const updateCustomerStatus = async (customerId, status) => {
  try {
    if (!customerId)
      return { success: false, error: "Customer ID is required" };
    const response = await axiosInstance.put(
      ENDPOINTS.MANAGER_CUSTOMERS.UPDATE_STATUS(customerId),
      { status },
    );
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("updateCustomerStatus error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi cập nhật trạng thái",
    };
  }
};

/**
 * Get all bookings for manager's fields, optionally filtered by customerId.
 * GET /api/manager/bookings?customerId=...
 * @param {Object} [params]
 * @param {string} [params.customerId]
 */
export const getManagerBookings = async (params = {}) => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.MANAGER_BOOKINGS.LIST, {
      params,
    });
    const raw = response.data?.data || response.data;
    const bookings = Array.isArray(raw) ? raw : [];
    return { success: true, data: bookings };
  } catch (error) {
    console.error("getManagerBookings error:", error);
    return {
      success: false,
      data: [],
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải danh sách đặt sân",
    };
  }
};

/**
 * Confirm deposit received (Pending → Confirmed).
 * PUT /api/manager/bookings/:bookingId/confirm-deposit
 */
export const confirmDeposit = async (bookingId) => {
  try {
    const response = await axiosInstance.put(
      ENDPOINTS.MANAGER_BOOKINGS.CONFIRM_DEPOSIT(bookingId),
    );
    return { success: true, data: response.data?.data };
  } catch (error) {
    console.error("confirmDeposit error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi xác nhận tiền cọc",
    };
  }
};

/**
 * Confirm payment received (Confirmed+Unpaid → Paid).
 * PUT /api/manager/bookings/:bookingId/confirm-payment
 */
export const confirmPayment = async (bookingId) => {
  try {
    const response = await axiosInstance.put(
      ENDPOINTS.MANAGER_BOOKINGS.CONFIRM_PAYMENT(bookingId),
    );
    return { success: true, data: response.data?.data };
  } catch (error) {
    console.error("confirmPayment error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi xác nhận thanh toán",
    };
  }
};

/**
 * Cancel a booking (Pending → Cancelled) when deposit not received.
 * PUT /api/manager/bookings/:bookingId/cancel
 */
export const cancelManagerBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.put(
      ENDPOINTS.MANAGER_BOOKINGS.CANCEL(bookingId),
    );
    return { success: true, data: response.data?.data };
  } catch (error) {
    console.error('cancelManagerBooking error:', error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Lỗi hủy booking',
    };
  }
};

/**
 * Update status of a single booking detail (slot).
 * PUT /api/manager/booking-details/:detailId/status
 * @param {string} detailId - BookingDetail ID
 * @param {string} status - 'Completed' | 'Cancelled'
 */
export const updateBookingDetailStatus = async (detailId, status) => {
  try {
    const response = await axiosInstance.put(
      ENDPOINTS.MANAGER_BOOKINGS.UPDATE_DETAIL_STATUS(detailId),
      { status },
    );
    return { success: true, data: response.data?.data };
  } catch (error) {
    console.error("updateBookingDetailStatus error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi cập nhật trạng thái slot",
    };
  }
};

// ============================================================================
// FEEDBACK (MANAGER VIEW)
// ============================================================================

/**
 * Get all feedbacks (manager view, paginated).
 * GET /api/feedback/all?page=1&limit=10
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=50]
 */
export const getAllFeedbacks = async (params = {}) => {
  try {
    const { page = 1, limit = 50 } = params;
    const response = await axiosInstance.get(ENDPOINTS.FEEDBACK.ALL, {
      params: { page, limit },
    });
    // BE response: { success, data: feedbacks[], averageRating, pagination: { currentPage, totalPages, totalItems, ... } }
    const raw = response.data;
    const feedbacks = raw?.data || [];
    const pagination = raw?.pagination || null;
    const avgRating = raw?.averageRating ?? null;
    const total = pagination?.totalItems ?? feedbacks.length;
    return {
      success: true,
      data: feedbacks,
      total,
      rawPagination: pagination,
      avgRating,
    };
  } catch (error) {
    console.error("getAllFeedbacks error:", error);
    return {
      success: false,
      data: [],
      total: 0,
      rawPagination: null,
      avgRating: null,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải danh sách feedback",
    };
  }
};

/**
 * Delete a feedback by ID (manager action).
 * DELETE /api/feedback/delete/:feedbackId
 * @param {string} feedbackId
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    if (!feedbackId)
      return { success: false, error: "Feedback ID is required" };
    await axiosInstance.delete(ENDPOINTS.FEEDBACK.DELETE(feedbackId));
    return { success: true };
  } catch (error) {
    console.error("deleteFeedback error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || error.message || "Lỗi xóa feedback",
    };
  }
};

// ============================================================================
// FIELD MANAGEMENT (MANAGER)
// ============================================================================

/**
 * Get categories list for manager.
 * GET /api/manager/field/categories
 */
export const getManagerCategories = async () => {
  try {
    const response = await axiosInstance.get(
      ENDPOINTS.MANAGER_FIELDS.CATEGORIES,
    );
    const raw = response.data?.data || response.data;
    const categories = raw?.categories || raw || [];
    return { success: true, data: categories };
  } catch (error) {
    console.error("getManagerCategories error:", error);
    return {
      success: false,
      data: [],
      error:
        error.response?.data?.message || error.message || "Lỗi tải danh mục",
    };
  }
};

/**
 * Get field types for a specific category (manager).
 * GET /api/manager/field/types/category/:categoryId
 * @param {string} categoryId
 */
export const getManagerTypesByCategory = async (categoryId) => {
  try {
    if (!categoryId)
      return { success: false, data: [], error: "Category ID is required" };
    const response = await axiosInstance.get(
      ENDPOINTS.MANAGER_FIELDS.TYPES_BY_CATEGORY(categoryId),
    );
    const raw = response.data?.data || response.data;
    const fieldTypes = raw?.fieldTypes || raw || [];
    return { success: true, data: fieldTypes };
  } catch (error) {
    console.error("getManagerTypesByCategory error:", error);
    return {
      success: false,
      data: [],
      error:
        error.response?.data?.message || error.message || "Lỗi tải loại sân",
    };
  }
};

/**
 * Get field create form data (categories + types).
 * GET /api/manager/field/create-form
 */
export const getFieldCreateForm = async () => {
  try {
    const response = await axiosInstance.get(
      ENDPOINTS.MANAGER_FIELDS.CREATE_FORM,
    );
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("getFieldCreateForm error:", error);
    return {
      success: false,
      data: null,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải form tạo sân",
    };
  }
};

/**
 * Get a single field by ID (manager view — includes private details).
 * GET /api/manager/field/:id
 * @param {string} fieldId
 */
export const getManagerFieldById = async (fieldId) => {
  try {
    if (!fieldId)
      return { success: false, data: null, error: "Field ID is required" };
    const response = await axiosInstance.get(
      ENDPOINTS.MANAGER_FIELDS.DETAIL(fieldId),
    );
    // BE trả về { success, data: { field: {...} } }
    const raw = response.data?.data || response.data;
    const data = raw?.field || raw;
    return { success: true, data };
  } catch (error) {
    console.error("getManagerFieldById error:", error);
    return {
      success: false,
      data: null,
      error:
        error.response?.status === 404
          ? "Không tìm thấy sân"
          : error.response?.data?.message ||
            error.message ||
            "Lỗi tải thông tin sân",
    };
  }
};

/**
 * Create a new field.
 * POST /api/manager/field/create
 * @param {FormData|Object} payload
 */
export const createField = async (payload) => {
  try {
    const response = await axiosInstance.post(
      ENDPOINTS.MANAGER_FIELDS.CREATE,
      payload,
    );
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("createField error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Lỗi tạo sân",
    };
  }
};

/**
 * Update an existing field.
 * PUT /api/manager/field/:id
 * @param {string} fieldId
 * @param {FormData|Object} payload
 */
export const updateField = async (fieldId, payload) => {
  try {
    if (!fieldId) return { success: false, error: "Field ID is required" };
    const response = await axiosInstance.put(
      ENDPOINTS.MANAGER_FIELDS.UPDATE(fieldId),
      payload,
    );
    const data = response.data?.data || response.data;
    return { success: true, data };
  } catch (error) {
    console.error("updateField error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || error.message || "Lỗi cập nhật sân",
    };
  }
};

/**
 * Delete a field.
 * DELETE /api/manager/field/:id
 * @param {string} fieldId
 */
export const deleteField = async (fieldId) => {
  try {
    if (!fieldId) return { success: false, error: "Field ID is required" };
    await axiosInstance.delete(ENDPOINTS.MANAGER_FIELDS.DELETE(fieldId));
    return { success: true };
  } catch (error) {
    console.error("deleteField error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Lỗi xóa sân",
    };
  }
};

// ============================================================================
// DASHBOARD - EXTENDED
// ============================================================================

/**
 * Get top fields by revenue.
 * GET /api/manager/dashboard/top-fields?limit=5
 * @param {number} [limit=5]
 */
export const getTopFields = async (limit = 5) => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.TOP_FIELDS, {
      params: { limit },
    });
    const raw = response.data?.data || response.data;
    const fields = raw?.fields || raw || [];
    return { success: true, data: fields };
  } catch (error) {
    console.error("getTopFields error:", error);
    return {
      success: false,
      data: [],
      error:
        error.response?.data?.message || error.message || "Lỗi tải top sân",
    };
  }
};

/**
 * Get top customers by spending.
 * GET /api/manager/dashboard/top-customers?limit=5
 * @param {number} [limit=5]
 */
export const getTopCustomers = async (limit = 5) => {
  try {
    const response = await axiosInstance.get(
      ENDPOINTS.DASHBOARD.TOP_CUSTOMERS,
      {
        params: { limit },
      },
    );
    const raw = response.data?.data || response.data;
    const customers = raw?.customers || raw || [];
    return { success: true, data: customers };
  } catch (error) {
    console.error("getTopCustomers error:", error);
    return {
      success: false,
      data: [],
      error:
        error.response?.data?.message ||
        error.message ||
        "Lỗi tải top khách hàng",
    };
  }
};

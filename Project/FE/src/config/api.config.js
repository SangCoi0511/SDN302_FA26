/**
 * API Configuration
 * Central configuration for API endpoints and settings
 * 
 * @description Cấu hình endpoints API cho Sân Siêu Tốc
 * @note Đồng bộ 100% với Backend routes thực tế (routes/index.js)
 * @date 2026-03-05
 */

export const API_CONFIG = {
  // Base URL - server BE chạy tại port 9999
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,

  ENDPOINTS: {

    // ==========================================
    // CUSTOMER AUTH
    // router.use('/api/customer/auth', customerAuthRoutes)
    // ==========================================
    CUSTOMER_AUTH: {
      REGISTER:        '/api/customer/auth/register',         // POST
      LOGIN:           '/api/customer/auth/login',            // POST
      RESET_PASSWORD:  '/api/customer/auth/reset-password',   // POST
      CHANGE_PASSWORD: '/api/customer/auth/change-password',  // PUT  (auth)
    },

    // ==========================================
    // CUSTOMER PROFILE
    // router.use('/api/customer/profile', customerProfileRoutes)
    // ==========================================
    CUSTOMER_PROFILE: {
      GET:    '/api/customer/profile/get-profile',    // GET  (auth)
      UPDATE: '/api/customer/profile/update-profile', // PUT  (auth)
    },

    // ==========================================
    // MANAGER AUTH
    // router.use('/api/manager/auth', managerAuthRoutes)
    // ==========================================
    MANAGER_AUTH: {
      LOGIN:           '/api/manager/auth/login',            // POST
      RESET_PASSWORD:  '/api/manager/auth/reset-password',   // POST
      CHANGE_PASSWORD: '/api/manager/auth/change-password',  // PUT  (auth)
    },

    // ==========================================
    // MANAGER PROFILE
    // router.use('/api/manager/profile', managerProfileRoutes)
    // ==========================================
    MANAGER_PROFILE: {
      GET:    '/api/manager/profile/get-profile',    // GET  (auth)
      UPDATE: '/api/manager/profile/update-profile', // PUT  (auth)
    },

    // ==========================================
    // PUBLIC FIELDS
    // router.use('/api/field', customerFieldRoutes)
    // ==========================================
    FIELDS: {
      LIST:                   '/api/field/list',                            // GET  - all fields
      CATEGORIES:             '/api/field/categories',                     // GET  - all categories
      TYPES:                  '/api/field/types',                          // GET  - all field types
      TYPES_BY_CATEGORY: (categoryId) => `/api/field/types/category/${categoryId}`, // GET
      DETAIL:          (id) => `/api/field/${id}`,                         // GET  - field by ID
    },

    // ==========================================
    // MANAGER FIELD MANAGEMENT
    // router.use('/api/manager/field', managerFieldRoutes)
    // ==========================================
    MANAGER_FIELDS: {
      CATEGORIES:             '/api/manager/field/categories',             // GET  (auth)
      TYPES_BY_CATEGORY: (categoryId) => `/api/manager/field/types/category/${categoryId}`, // GET (auth)
      CREATE_FORM:            '/api/manager/field/create-form',            // GET  (auth)
      CREATE:                 '/api/manager/field/create',                 // POST (auth)
      DETAIL:          (id) => `/api/manager/field/${id}`,                 // GET  (auth)
      UPDATE:          (id) => `/api/manager/field/${id}`,                 // PUT  (auth)
      DELETE:          (id) => `/api/manager/field/${id}`,                 // DELETE (auth)
    },

    // ==========================================
    // CUSTOMER BOOKINGS
    // router.use('/api/customer', customerBookingRoutes)
    // ==========================================
    BOOKINGS: {
      // Public - no auth
      AVAILABILITY: (fieldId) => `/api/customer/fields/${fieldId}/availability`, // GET ?date=YYYY-MM-DD

      // Customer (auth required)
      CREATE:       '/api/customer/bookings',                              // POST (auth)
      MY_BOOKINGS:  '/api/customer/bookings/my-bookings',                  // GET  (auth)
      CANCEL: (bookingId) => `/api/customer/bookings/${bookingId}/cancel`, // PUT  (auth)
      RENEW:  (bookingId) => `/api/customer/bookings/${bookingId}/renew`,  // POST (auth)
    },

    // ==========================================
    // MANAGER BOOKINGS
    // router.use('/api/manager', managerBookingRoutes)
    // ==========================================
    MANAGER_BOOKINGS: {
      LIST:            '/api/manager/bookings',                                                    // GET  (auth) ?customerId=
      CONFIRM_DEPOSIT: (bookingId) => `/api/manager/bookings/${bookingId}/confirm-deposit`,        // PUT  (auth)
      CONFIRM_PAYMENT: (bookingId) => `/api/manager/bookings/${bookingId}/confirm-payment`,        // PUT  (auth)
      CANCEL:          (bookingId) => `/api/manager/bookings/${bookingId}/cancel`,                 // PUT  (auth)
      UPDATE_DETAIL_STATUS: (detailId) => `/api/manager/booking-details/${detailId}/status`,       // PUT  (auth)
    },

    // ==========================================
    // FEEDBACK
    // router.use('/api/feedback', feedbackRoutes)
    // Routes: POST /create, PUT /update/:id, DELETE /delete/:id
    // ==========================================
    FEEDBACK: {
      ALL:            '/api/feedback/all',                                      // GET  ?page=1&limit=10
      BY_FIELD: (fieldId) => `/api/feedback/field/${fieldId}`,                  // GET  ?page=1&limit=10
      STATS:    (fieldId) => `/api/feedback/stats/field/${fieldId}`,            // GET  - avg rating
      CREATE:         '/api/feedback/create',                                   // POST (auth, customer)
      UPDATE: (feedbackId) => `/api/feedback/update/${feedbackId}`,             // PUT  (auth, customer)
      DELETE: (feedbackId) => `/api/feedback/delete/${feedbackId}`,             // DELETE (auth, customer)
    },

    // ==========================================
    // MANAGER DASHBOARD
    // router.use('/api/manager/dashboard', managerDashboardRoutes)
    // ==========================================
    DASHBOARD: {
      STATS:           '/api/manager/dashboard/stats',                   // GET  - all stats
      SUMMARY:         '/api/manager/dashboard/summary',                 // GET  - summary
      BOOKING_STATUS:  '/api/manager/dashboard/bookings/status',         // GET  - status breakdown
      PAYMENT_STATUS:  '/api/manager/dashboard/bookings/payment-status', // GET  - payment breakdown
      REVENUE_MONTH:   '/api/manager/dashboard/revenue/month',           // GET
      REVENUE_WEEK:    '/api/manager/dashboard/revenue/week',            // GET
      REVENUE_FIELD_TYPE: '/api/manager/dashboard/revenue/field-type',  // GET
      CATEGORIES:      '/api/manager/dashboard/categories',              // GET
      TOP_FIELDS:      '/api/manager/dashboard/top-fields',              // GET  ?limit=10
      TOP_CUSTOMERS:   '/api/manager/dashboard/top-customers',           // GET  ?limit=10
      RECENT_BOOKINGS: '/api/manager/dashboard/recent-bookings',         // GET  ?limit=20
    },

    // ==========================================
    // MANAGER CUSTOMER MANAGEMENT
    // router.use('/api/manager/customers', managerCustomerRoutes)
    // ==========================================
    MANAGER_CUSTOMERS: {
      LIST:            '/api/manager/customers',                          // GET  (auth)
      STATS:           '/api/manager/customers/stats',                    // GET  (auth)
      DETAIL:   (id) => `/api/manager/customers/${id}`,                   // GET  (auth)
      UPDATE_STATUS: (id) => `/api/manager/customers/${id}/status`,       // PUT  (auth)
    },
  },
};

export default API_CONFIG;

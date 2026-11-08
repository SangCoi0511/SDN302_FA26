import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ManagerLayout from './components/layout/ManagerLayout';

// Pages
import HomePage from './pages/Home/HomePage';
import AuthPage from './pages/Auth/AuthPage'; // Unified Auth Interface
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import NotFoundPage from './pages/NotFoundPage';

// Field Pages
import FieldListPage from './pages/Field/FieldListPage';
import FieldDetailPage from './pages/Field/FieldDetailPage';

// Customer Pages
import UserProfilePage from './pages/Customer/UserProfilePage';
import BookingDetailPage from './pages/Customer/BookingDetailPage';

// Manager Pages
import ManagerDashboardPage from './pages/Manager/ManagerDashboardPage';
import ManagerSettingsPage from './pages/Manager/ManagerSettingsPage';
import ManagerFieldsPage from './pages/Manager/Field/ManagerFieldsPage';
import ManagerFieldDetailPage from './pages/Manager/Field/ManagerFieldDetailPage';
import ManagerFieldCreatePage from './pages/Manager/Field/ManagerFieldCreatePage';
import ManagerFieldEditPage from './pages/Manager/Field/ManagerFieldEditPage';
import ManagerCustomersPage from './pages/Manager/Customer/ManagerCustomersPage';
import ManagerCustomerDetailPage from './pages/Manager/Customer/ManagerCustomerDetailPage';
import ManagerFeedbackPage from './pages/Manager/Feedback/ManagerFeedbackPage';
import ManagerBookingsPage from './pages/Manager/Booking/ManagerBookingsPage';

import BannedModal from './components/common/BannedModal';

function App() {
  return (
    <Router>
      <BannedModal />
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          
          {/* Auth Routes (inside MainLayout with Header/Footer) */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/manager/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          {/* Forgot password routes tách rõ customer/manager */}
          <Route path="/forgot-password" element={<AuthPage />} />
          <Route path="/manager/forgot-password" element={<AuthPage />} />
          
          {/* Field & Customer Routes */}
          <Route path="/fields" element={<FieldListPage />} />
          <Route path="/field" element={<Navigate to="/fields" replace />} />
          <Route path="/fields/:id" element={<FieldDetailPage />} />
          {/* Legacy alias: giữ tương thích link cũ /field/:id */}
          <Route path="/field/:id" element={<FieldDetailPage />} />
          {/* Customer profile — /customer/profile (canonical) + legacy aliases */}
          <Route path="/customer/profile" element={<UserProfilePage />} />
          <Route path="/customer/dashboard" element={<Navigate to="/customer/profile" replace />} />
          <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />
          <Route path="/booking-history" element={<UserProfilePage />} />
          <Route path="/booking-history/:id" element={<BookingDetailPage />} />
          <Route path="/settings" element={<UserProfilePage />} />
        </Route>

        {/* Manager Routes with ManagerLayout */}
        <Route path="/admin" element={<ManagerLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboardPage />} />
          <Route path="fields" element={<ManagerFieldsPage />} />
          <Route path="fields/create" element={<ManagerFieldCreatePage />} />
          <Route path="fields/:id" element={<ManagerFieldDetailPage />} />
          <Route path="fields/:id/edit" element={<ManagerFieldEditPage />} />
          <Route path="customers" element={<ManagerCustomersPage />} />
          <Route path="customers/:id" element={<ManagerCustomerDetailPage />} />
          <Route path="feedback" element={<ManagerFeedbackPage />} />
          <Route path="bookings" element={<ManagerBookingsPage />} />
          <Route path="settings" element={<ManagerSettingsPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

/**
 * UserProfilePage - Trang Profile của User
 * 
 * Đã tách thành các components:
 * - UserSidebar: Sidebar navigation
 * - ProfileTab: Tab thông tin cá nhân
 * - BookingsTab: Tab lịch sử đặt sân
 * - SettingsTab: Tab cài đặt
 * 
 * Data: Lấy booking từ API thật (bookingService.getMyBookings)
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';

// Components
import { UserSidebar, ProfileTab, BookingsTab, SettingsTab } from './components';

// Styles
import '../../styles/UserProfilePage.css';

/** Booking status constants (khớp với BE) */
const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/**
 * Xác định trạng thái hiển thị dựa trên slot-level statuses:
 * - Nếu booking bị Cancelled → Cancelled
 * - Nếu Pending + endTime đã qua → Expired
 * - Nếu có bất kỳ slot nào Completed → Completed
 * - Nếu có bất kỳ slot nào Cancelled → Expired (slot bị hủy bởi manager)
 * - Còn lại trả status gốc từ BE
 */
const resolveDisplayStatus = (booking) => {
  const { status, bookingDetails } = booking;

  // Booking cấp độ bị hủy
  if (status === BOOKING_STATUS.CANCELLED) return BOOKING_STATUS.CANCELLED;

  // Pending quá hạn → Expired
  if (status === BOOKING_STATUS.PENDING) {
    const now = new Date();
    const details = bookingDetails || [];
    const lastDetail = details[details.length - 1];
    const endTime = lastDetail?.endTime ? new Date(lastDetail.endTime) : null;
    if (endTime && now > endTime) return 'Expired';
    return status;
  }

  // Với trạng thái Confirmed / Completed: kiểm tra slot-level statuses
  const details = bookingDetails || [];
  const hasCompletedSlot = details.some((d) => d.status === 'Completed');
  const hasCancelledSlot = details.some((d) => d.status === 'Cancelled');

  if (hasCompletedSlot) return BOOKING_STATUS.COMPLETED;
  if (hasCancelledSlot) return 'Expired';

  return status;
};

const UserProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ========== API State ==========
  const [allBookings, setAllBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // ========== Fetch bookings from API ==========
  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const response = await bookingService.getMyBookings();
      // BE controller trả { success: true, data: [...] }
      // bookingService unwrap axios → response = { success: true, data: [...] }
      let bookings = [];
      if (Array.isArray(response)) {
        bookings = response;
      } else if (response?.data && Array.isArray(response.data)) {
        bookings = response.data;
      }
      setAllBookings(bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setAllBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Determine active tab from URL path
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/booking-history')) return 'bookings';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/profile') || path.includes('/customer')) return 'profile';
    return searchParams.get('tab') || 'profile';
  };

  const activeTab = getTabFromPath();

  // Enrich bookings with resolved display status (client-side time check)
  const enrichedBookings = useMemo(() => {
    return allBookings.map((b) => ({
      ...b,
      displayStatus: resolveDisplayStatus(b),
    }));
  }, [allBookings]);

  // Calculate stats from enriched display status
  const stats = useMemo(() => {
    return {
      total: enrichedBookings.length,
      completed: enrichedBookings.filter((b) => b.displayStatus === BOOKING_STATUS.COMPLETED).length,
      confirmed: enrichedBookings.filter((b) => b.displayStatus === BOOKING_STATUS.CONFIRMED).length,
      cancelled: enrichedBookings.filter((b) => b.displayStatus === BOOKING_STATUS.CANCELLED).length,
      pending: enrichedBookings.filter((b) => b.displayStatus === BOOKING_STATUS.PENDING).length,
      expired: enrichedBookings.filter((b) => b.displayStatus === 'Expired').length,
    };
  }, [enrichedBookings]);

  // Upcoming bookings: Confirmed + Pending với endTime chưa qua
  const upcomingBookings = useMemo(() => {
    return enrichedBookings
      .filter((b) =>
        b.displayStatus === BOOKING_STATUS.CONFIRMED ||
        b.displayStatus === BOOKING_STATUS.PENDING
      )
      .slice(0, 4);
  }, [enrichedBookings]);

  // Tab change handler
  const handleTabChange = (tabKey) => {
    if (tabKey === 'bookings') {
      navigate('/booking-history');
    } else if (tabKey === 'settings') {
      navigate('/settings');
    } else {
      navigate('/customer/profile');
    }
  };

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-layout">
        {/* Sidebar */}
        <UserSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userName={user?.name || ''}
          userImage={user?.image}
        />

        {/* Main Content */}
        <main className="user-dashboard-main">
          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              upcomingBookings={upcomingBookings}
              onTabChange={handleTabChange}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsTab
              allBookings={enrichedBookings}
              stats={stats}
              loading={bookingsLoading}
              onRefresh={fetchBookings}
            />
          )}

          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

export default UserProfilePage;

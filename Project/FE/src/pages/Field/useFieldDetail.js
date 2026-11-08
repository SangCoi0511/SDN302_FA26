/**
 * @fileoverview Custom hook cho FieldDetailPage
 * 
 * Quản lý toàn bộ state, effects, và handlers cho trang chi tiết sân
 * Tách logic ra khỏi component để giữ component gọn gàng
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getFieldById, getFieldAvailability } from '../../services/fieldService';
import feedbackService from '../../services/feedbackService';
import bookingService from '../../services/bookingService';
import {
  mergeConsecutiveSlots,
  checkSlotAvailability,
  generateTimeSlots,
  getDayOfWeekName,
} from './fieldDetailHelpers';

const WEEKS_PER_MONTH = 4;

const useFieldDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const notification = useNotification();

  // ========== API Data State ==========
  const [field, setField] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ========== UI State ==========
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [recurringType, setRecurringType] = useState('once');
  const [recurringMonths, setRecurringMonths] = useState(1);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // ========== QR Payment Modal State ==========
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPaymentData, setQrPaymentData] = useState(null);

  // ========== Fetch Field Data ==========
  useEffect(() => {
    const fetchFieldData = async () => {
      setLoading(true);
      try {
        const result = await getFieldById(id);
        if (result.success && result.data?.field) {
          setField(result.data.field);
        } else {
          setField(null);
        }
      } catch (err) {
        console.error('Error fetching field:', err);
        setField(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFieldData();
  }, [id]);

  // ========== Fetch Feedbacks & Ratings ==========
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!id) return;
      try {
        // averageRating is returned directly from getFeedbacksByField (BE response root)
        const fbResult = await feedbackService.getFeedbacksByField(id);
        if (fbResult.success) {
          setFeedbacks(fbResult.data);
          setAverageRating(parseFloat((fbResult.averageRating || 0).toFixed(1)));
          setTotalReviews(fbResult.total || fbResult.data.length);
        }
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      }
    };
    fetchFeedbacks();
  }, [id]);

  // ========== Fetch Availability when date changes ==========
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id || !selectedDate) return;
      try {
        const result = await getFieldAvailability(id, selectedDate);
        if (result.success && result.data?.slots) {
          setBookedSlots(result.data.slots);
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setBookedSlots([]);
      }
    };
    fetchAvailability();
  }, [id, selectedDate]);

  // ========== Computed Values ==========

  const maxBookingYear = useMemo(() => {
    const now = new Date();
    return now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  }, []);

  const maxBookingDateStr = useMemo(() => {
    return `${maxBookingYear}-12-31`;
  }, [maxBookingYear]);

  const calculateRecurringDates = useMemo(() => {
    if (!selectedDate) return [];
    if (recurringType === 'once') return [selectedDate];

    if (recurringType === 'weekly') {
      // Đặt 7 ngày liên tiếp (BE: repeatType = 'weekly')
      const dates = [];
      let current = new Date(selectedDate);
      for (let i = 0; i < 7; i++) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    }

    // recurring: lặp cùng ngày trong tuần theo N tháng (BE: repeatType = 'recurring')
    const totalWeeks = recurringMonths * WEEKS_PER_MONTH;
    const dates = [];
    let current = new Date(selectedDate);
    for (let i = 0; i < totalWeeks; i++) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7);
    }
    return dates;
  }, [selectedDate, recurringType, recurringMonths]);

  const checkRecurringAvailability = useCallback(() => {
    if (!field || selectedSlots.length === 0) {
      return { isAvailable: true, conflictDates: [] };
    }

    const conflictDates = [];
    for (const dateStr of calculateRecurringDates) {
      for (const slot of selectedSlots) {
        const available = checkSlotAvailability(field._id, dateStr, slot.startTime, slot.endTime);
        if (!available) {
          conflictDates.push({ date: dateStr, slot: `${slot.startTime} - ${slot.endTime}` });
          break;
        }
      }
    }

    return { isAvailable: conflictDates.length === 0, conflictDates };
  }, [field, selectedSlots, calculateRecurringDates]);

  const mergedTimeRanges = useMemo(() => {
    return mergeConsecutiveSlots(selectedSlots);
  }, [selectedSlots]);

  const timeSlots = useMemo(() => {
    if (!field || !selectedDate) return [];
    return generateTimeSlots(field, selectedDate, bookedSlots);
  }, [field, selectedDate, bookedSlots]);

  const ratingBreakdown = useMemo(() => {
    if (feedbacks.length === 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((fb) => {
      const r = fb.rate ?? fb.rating;          // BE uses "rate", guard against old shape
      if (r >= 1 && r <= 5) counts[r] = (counts[r] || 0) + 1;
    });
    const total = feedbacks.length;
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
    };
  }, [feedbacks]);

  // ========== Handlers ==========

  const handleOpenMap = (e) => {
    e.preventDefault();
    setIsMapModalOpen(true);
  };

  const handleDateChange = (e) => {
    const selectedDateValue = e.target.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDateValue);

    if (selected < today) {
      notification.warning('Không thể chọn ngày trong quá khứ. Vui lòng chọn từ hôm nay trở đi.');
      return;
    }

    if (selectedDateValue && selectedDateValue > maxBookingDateStr) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const isDecember = now.getMonth() === 11;
      notification.warning(
        isDecember
          ? `Chỉ có thể đặt sân đến hết năm ${maxBookingYear}.`
          : `Hiện chỉ mở đặt sân đến hết năm ${currentYear}. Năm ${currentYear + 1} sẽ mở đặt từ tháng 12.`
      );
      return;
    }

    setSelectedDate(selectedDateValue);
    setSelectedSlots([]);
  };

  const handleSlotSelection = (slot) => {
    if (!slot.available) return;
    const slotIndex = selectedSlots.findIndex(s => s.time === slot.time);

    if (slotIndex > -1) {
      setSelectedSlots(selectedSlots.filter(s => s.time !== slot.time));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const calculateTotalMinutes = () => {
    let totalMinutes = 0;
    for (const range of mergedTimeRanges) {
      const [startH, startM] = range.startTime.split(':').map(Number);
      const [endH, endM] = range.endTime.split(':').map(Number);
      totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
    }
    return totalMinutes;
  };

  const calculateTotalBookingDetails = () => {
    return selectedSlots.length * calculateRecurringDates.length;
  };

  const calculateTotalPrice = () => {
    if (!field) return 0;
    const numOccurrences = calculateRecurringDates.length;
    return field.hourlyPrice * selectedSlots.length * numOccurrences;
  };

  const buildBookingDetails = () => {
    if (!field) return [];
    const details = [];
    for (const dateStr of calculateRecurringDates) {
      for (const slot of selectedSlots) {
        details.push({
          fieldID: field._id,
          startTime: new Date(`${dateStr}T${slot.startTime}:00`).toISOString(),
          endTime: new Date(`${dateStr}T${slot.endTime}:00`).toISOString(),
          priceSnapshot: field.hourlyPrice,
          status: 'Active',
        });
      }
    }
    return details;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      notification.warning('Vui lòng đăng nhập để đặt sân');
      navigate('/login', { state: { from: `/field/${id}` } });
      return;
    }

    if (!selectedDate) {
      notification.warning('Vui lòng chọn ngày chơi');
      return;
    }

    if (selectedSlots.length === 0) {
      notification.warning('Vui lòng chọn ít nhất một khung giờ');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(selectedDate) < today) {
      notification.error('Không thể đặt sân cho ngày trong quá khứ');
      return;
    }

    const outOfWindowDate = calculateRecurringDates.find(d => d > maxBookingDateStr);
    if (outOfWindowDate) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const isDecember = now.getMonth() === 11;
      notification.warning(
        isDecember
          ? `Lịch lặp có ngày vượt quá năm ${maxBookingYear}. Vui lòng chọn ngày hoặc thời gian lặp khác.`
          : `Hiện chỉ mở đặt sân đến hết năm ${currentYear}. Năm ${currentYear + 1} sẽ mở đặt từ tháng 12.`
      );
      return;
    }

    const apiPayload = {
      fieldId: field._id,
      startDate: selectedDate,
      selectedSlots: selectedSlots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      repeatType: recurringType, // 'once' | 'weekly' | 'recurring' — khớp đúng với BE
    };

    // duration chỉ dùng cho 'recurring' (1 | 2 | 3 tháng)
    if (recurringType === 'recurring') {
      apiPayload.duration = recurringMonths;
    }

    setBookingLoading(true);
    try {
      const response = await bookingService.createBooking(apiPayload);
      const data = response.data || response;

      notification.success(data.message || 'Đặt sân thành công! Vui lòng thanh toán tiền cọc.');

      setQrPaymentData({
        qrCodeUrl: data.qrCode || null,
        managerInfo: data.managerInfo || null,
        depositAmount: data.depositAmount || 0,
        totalPrice: data.totalPrice || calculateTotalPrice(),
        bookingId: data.bookingId || null,
        fieldName: field.fieldName,
      });
      setQrModalOpen(true);

      setSelectedSlots([]);

      try {
        const avResult = await getFieldAvailability(id, selectedDate);
        if (avResult.success && avResult.data?.slots) {
          setBookedSlots(avResult.data.slots);
        }
      } catch (_) {
        // Ignore refresh errors
      }

    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Đặt sân thất bại. Vui lòng thử lại.';
      notification.error(errMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  return {
    // Params
    id,
    navigate,
    user,
    isAuthenticated,
    notification,

    // Data
    field,
    feedbacks,
    averageRating,
    totalReviews,
    loading,
    bookingLoading,

    // UI State
    selectedDate,
    selectedSlots,
    recurringType,
    setRecurringType,
    recurringMonths,
    setRecurringMonths,
    isMapModalOpen,
    setIsMapModalOpen,

    // QR Modal
    qrModalOpen,
    setQrModalOpen,
    qrPaymentData,

    // Computed
    calculateRecurringDates,
    checkRecurringAvailability,
    mergedTimeRanges,
    timeSlots,
    ratingBreakdown,
    maxBookingDateStr,

    // Handlers
    handleOpenMap,
    handleDateChange,
    handleSlotSelection,
    calculateTotalMinutes,
    calculateTotalBookingDetails,
    calculateTotalPrice,
    buildBookingDetails,
    handleBooking,
  };
};

export default useFieldDetail;

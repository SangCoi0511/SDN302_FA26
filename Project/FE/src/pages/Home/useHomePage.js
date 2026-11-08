/**
 * @fileoverview Custom hook cho HomePage
 * 
 * Quản lý state, effects, và handlers cho trang chủ
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { useDebounce, useClickOutside } from '../../hooks/useAppHooks';

const BACKGROUND_IMAGES = [
  '/assets/images/football.jpg',
  '/assets/images/badminton.jpg',
  '/assets/images/basketball.jpg',
  '/assets/images/tennis.jpg',
  '/assets/images/volleyball.jpg',
];

const useHomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { quickSearch, searchFields, isLoading, globalData } = useApp();

  // ==========================================
  // STATE DECLARATIONS
  // ==========================================

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate] = useState('');
  const [previewResults, setPreviewResults] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredFields, setFeaturedFields] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const loadingPreview = isLoading('quickSearch');

  // Refs
  const dropdownPortalRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchWrapperRef = useClickOutside(
    () => setShowPreview(false),
    [dropdownPortalRef]
  );
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const categoryFilters = [
    { _id: 'all', categoryName: t('home.allCategories') },
    ...(globalData.categories || []).map(cat => ({
      ...cat,
      categoryName: t(`category.${cat.categoryName}`, cat.categoryName)
    }))
  ];

  // ==========================================
  // EFFECTS
  // ==========================================

  // Background carousel - Đổi ảnh mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured fields từ API khi selectedCategory thay đổi
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      try {
        const filters = {
          status: 'Available',
          page: 1,
          limit: 4,
          sortBy: 'newest',
        };
        if (selectedCategory !== 'all') {
          filters.categoryId = selectedCategory;
        }
        const result = await searchFields(filters);
        if (result.success) {
          setFeaturedFields(result.data.fields || []);
        } else {
          setFeaturedFields([]);
        }
      } catch {
        setFeaturedFields([]);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, [selectedCategory, searchFields]);

  // Fetch preview results khi debounced query thay đổi
  useEffect(() => {
    const fetchPreview = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 1) {
        setPreviewResults([]);
        setShowPreview(false);
        return;
      }
      const results = await quickSearch(debouncedSearchQuery.trim(), 5);
      setPreviewResults(results);
      setShowPreview(results.length > 0);
    };
    fetchPreview();
  }, [debouncedSearchQuery, quickSearch]);

  // Cập nhật vị trí dropdown
  useEffect(() => {
    const updatePosition = () => {
      if (searchContainerRef.current && showPreview) {
        const rect = searchContainerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    updatePosition();

    if (showPreview) {
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showPreview]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (searchDate) {
      params.set('date', searchDate);
    }
    navigate(`/fields?${params.toString()}`);
    setShowPreview(false);
  }, [searchQuery, searchDate, navigate]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handlePreviewClick = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handleSearchInputFocus = useCallback(() => {
    if (previewResults.length > 0) {
      setShowPreview(true);
    }
  }, [previewResults.length]);

  return {
    // State
    searchQuery,
    setSearchQuery,
    previewResults,
    showPreview,
    selectedCategory,
    setSelectedCategory,
    featuredFields,
    loadingFeatured,
    currentImageIndex,
    loadingPreview,
    dropdownPosition,

    // Refs
    dropdownPortalRef,
    searchContainerRef,
    searchWrapperRef,

    // Computed
    categoryFilters,
    backgroundImages: BACKGROUND_IMAGES,

    // Handlers
    handleSearch,
    handleKeyPress,
    handlePreviewClick,
    handleSearchInputFocus,

    // i18n
    t,
  };
};

export default useHomePage;

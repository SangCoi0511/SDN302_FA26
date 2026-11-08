/**
 * @fileoverview HomePage - Trang chủ Sân Siêu Tốc
 */

import '../../styles/HomePage.css';
import useHomePage from './useHomePage';
import HeroSection from './components/HeroSection';
import OurStorySection from './components/OurStorySection';
import FeaturedFieldsSection from './components/FeaturedFieldsSection';
import HowItWorksSection from './components/HowItWorksSection';

const HomePage = () => {
  const {
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
    dropdownPortalRef,
    searchContainerRef,
    searchWrapperRef,
    categoryFilters,
    backgroundImages,
    handleSearch,
    handleKeyPress,
    handlePreviewClick,
    handleSearchInputFocus,
    t,
  } = useHomePage();

  return (
    <>
      <HeroSection
        backgroundImages={backgroundImages}
        currentImageIndex={currentImageIndex}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchWrapperRef={searchWrapperRef}
        searchContainerRef={searchContainerRef}
        dropdownPortalRef={dropdownPortalRef}
        dropdownPosition={dropdownPosition}
        showPreview={showPreview}
        loadingPreview={loadingPreview}
        previewResults={previewResults}
        handleSearch={handleSearch}
        handleKeyPress={handleKeyPress}
        handleSearchInputFocus={handleSearchInputFocus}
        handlePreviewClick={handlePreviewClick}
        t={t}
      />
      <OurStorySection t={t} />
      <FeaturedFieldsSection
        categoryFilters={categoryFilters}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        featuredFields={featuredFields}
        loadingFeatured={loadingFeatured}
        t={t}
      />
      <HowItWorksSection t={t} />
    </>
  );
};

export default HomePage;
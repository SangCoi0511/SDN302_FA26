/**
 * @fileoverview HeroSection - Hero banner với search bar và preview dropdown
 */

import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

const HeroSection = ({
  backgroundImages,
  currentImageIndex,
  searchQuery,
  setSearchQuery,
  searchWrapperRef,
  searchContainerRef,
  dropdownPortalRef,
  dropdownPosition,
  showPreview,
  loadingPreview,
  previewResults,
  handleSearch,
  handleKeyPress,
  handleSearchInputFocus,
  handlePreviewClick,
  t,
}) => {
  const renderPreviewLoading = () => (
    <div className="p-8 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#00E536] mb-3"></div>
      <p className="text-gray-600 dark:text-gray-300">{t('home.searching')}</p>
    </div>
  );

  const renderPreviewResults = () => (
    <>
      <div className="px-4 py-3 bg-gray-50 dark:bg-green-900/30 border-b border-gray-200 dark:border-green-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('home.foundResults', { count: previewResults.length })}
        </span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {previewResults.map((field) => (
          <Link
            key={field.id}
            to={`/fields/${field.id}`}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-green-900/30 transition-colors border-b border-gray-100 dark:border-green-800/50 last:border-0 group"
            onClick={handlePreviewClick}
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-green-900">
              <img
                src={field.imageUrl || '/default-field.jpg'}
                alt={field.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => { e.target.src = '/default-field.jpg'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate group-hover:text-[#00E536] transition-colors">
                {field.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mb-1">
                <span className="material-icons-outlined text-xs">location_on</span>
                {field.address}
              </p>
              <p className="text-sm font-medium text-[#00E536]">
                {field.price ? `${field.price.toLocaleString()}đ/${t('field.pricePerHour', { price: '' }).replace('/', '')}` : t('home.contact')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-gray-400 group-hover:text-[#00E536] transition-colors">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="px-4 py-3 bg-gray-50 dark:bg-green-900/30 border-t border-gray-200 dark:border-green-800">
        <button
          className="w-full text-center text-sm font-medium text-[#00E536] hover:text-green-600 transition-colors flex items-center justify-center gap-2"
          onClick={handleSearch}
        >
          {t('home.viewAllResults')}
          <span className="material-icons-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="relative overflow-hidden" style={{ height: '90vh', minHeight: '600px', maxHeight: '860px' }}>
      {/* Background Carousel */}
      {backgroundImages.map((img, index) => (
        <div
          key={img}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: index === currentImageIndex ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: 1,
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-2/3 z-[2]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)' }} />

      {/* Hero Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-4" style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)' }}>
            {t('home.heroTitle')}{' '}
            <span className="text-[#00E536] logo-text-shadow">{t('home.heroHighlight')}</span>
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto" style={{ textShadow: '0 1px 6px rgba(0, 0, 0, 0.4)' }}>
            {t('home.heroSubtitle')}
          </p>
        </div>

        {/* Search Bar with Preview */}
        <div className="w-full max-w-3xl relative" ref={searchWrapperRef}>
          <div
            ref={searchContainerRef}
            className="bg-white dark:bg-[#14532d] rounded-2xl shadow-xl p-3 flex flex-col md:flex-row gap-3 transform transition-all hover:scale-[1.01]"
          >
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons-outlined text-gray-400 group-focus-within:text-[#00E536]">
                  sports_soccer
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-gray-50 dark:bg-green-900/30 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00E536] transition-shadow"
                placeholder={t('home.searchPlaceholder')}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleSearchInputFocus}
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-[#00E536] hover:bg-green-500 text-white dark:text-green-900 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-neon transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-icons-outlined">search</span>
              {t('home.searchButton')}
            </button>
          </div>

          {/* Preview Dropdown Portal */}
          {showPreview && createPortal(
            <div
              ref={dropdownPortalRef}
              className="bg-white dark:bg-[#14532d] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-green-800"
              style={{
                position: 'absolute',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 9999,
              }}
            >
              {loadingPreview ? renderPreviewLoading() : renderPreviewResults()}
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

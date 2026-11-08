/**
 * @fileoverview FieldListPage - Trang danh sách sân thể thao (Orchestrator)
 * 
 * Logic & state được quản lý bởi useFieldList hook
 * UI được chia thành các component con:
 * - FieldFilterSidebar: Sidebar bộ lọc
 * - FieldCard: Thẻ sân
 */

import { useTranslation } from 'react-i18next';

// Hooks & Components
import useFieldList from './useFieldList';
import FieldFilterSidebar from './components/FieldFilterSidebar';
import FieldCard from './components/FieldCard';

// Styles
import '../../styles/FieldListPage.css';

const FieldListPage = () => {
  const { t } = useTranslation();

  const {
    fields,
    pagination,
    facets,
    globalData,
    loading,
    error,
    notification,
    selectedCategoryFieldTypes,
    filters,
    searchInputText,
    setSearchInputText,
    priceInputValue,
    showMobileFilters,
    setShowMobileFilters,
    viewMode,
    setViewMode,
    navHidden,
    handleFilterChange,
    handleCategoryChange,
    handleFieldTypeChange,
    handleCityChange,
    handleWardChange,
    handleSortChange,
    handlePageChange,
    handleReset,
    handlePriceInputChange,
    handlePriceInputBlur,
    handlePriceKeyPress,
    clearSearch,
    handleSearchSubmit,
    handleSearchKeyPress,
    fetchFields,
  } = useFieldList();

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderLoading = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{t('fieldList.loading')}</p>
    </div>
  );

  const renderError = () => (
    <div className="error-container">
      <span className="material-symbols-outlined error-icon">error</span>
      <h3>{t('fieldList.errorTitle')}</h3>
      <p>{error}</p>
      <button onClick={fetchFields} className="retry-button">
        {t('fieldList.retry')}
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="empty-container">
      <span className="material-symbols-outlined empty-icon">search_off</span>
      <h3>{t('fieldList.emptyTitle')}</h3>
      <p>{t('fieldList.emptyDescription')}</p>
      <button onClick={handleReset} className="reset-filters-button">
        {t('fieldList.resetFilters')}
      </button>
    </div>
  );

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="field-list-page">
      {/* Page Title */}
      <div className="field-list-page-header">
        <h1 className="page-title">{t('fieldList.pageTitle')}</h1>
        <p className="page-subtitle">{t('fieldList.pageSubtitle')}</p>
      </div>

      <div className="field-list-container">
        {/* Sidebar Filters */}
        <FieldFilterSidebar
          filters={filters}
          searchInputText={searchInputText}
          setSearchInputText={setSearchInputText}
          priceInputValue={priceInputValue}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          navHidden={navHidden}
          globalData={globalData}
          facets={facets}
          selectedCategoryFieldTypes={selectedCategoryFieldTypes}
          handleFilterChange={handleFilterChange}
          handleCategoryChange={handleCategoryChange}
          handleFieldTypeChange={handleFieldTypeChange}
          handleCityChange={handleCityChange}
          handleWardChange={handleWardChange}
          handleReset={handleReset}
          handlePriceInputChange={handlePriceInputChange}
          handlePriceInputBlur={handlePriceInputBlur}
          handlePriceKeyPress={handlePriceKeyPress}
          clearSearch={clearSearch}
          handleSearchSubmit={handleSearchSubmit}
          handleSearchKeyPress={handleSearchKeyPress}
        />

        {/* Main Content */}
        <main className="field-list-main">
          {/* Search Bar (Mobile) */}
          <div className="mobile-search">
            <div className="search-box">
              <div className="search-input-container">
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                  type="text"
                  value={searchInputText}
                  onChange={(e) => setSearchInputText(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder={t('fieldList.searchPlaceholder')}
                  className="search-input"
                />
                {searchInputText && (
                  <button
                    className="clear-search-btn"
                    onClick={clearSearch}
                    aria-label={t('common.close')}
                    type="button"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
              <button
                className="search-submit-btn"
                onClick={handleSearchSubmit}
                type="button"
              >
                <span className="material-symbols-outlined">search</span>
                {t('common.search')}
              </button>
            </div>
          </div>

          {/* Results Header */}
          <div className="results-header">
            <div className="results-meta">
              <p className="results-count">
                {loading ? (
                  t('fieldList.resultsLoading')
                ) : filters.searchText ? (
                  <>
                    {t('fieldList.resultsFoundWithKeyword', { count: pagination.total })}{' '}
                    <strong className="search-keyword">"{filters.searchText}"</strong>
                  </>
                ) : (
                  t('fieldList.resultsFound', { count: pagination.total })
                )}
              </p>
              <div className="view-toggle">
                <button
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <span className="material-symbols-outlined">view_list</span>
                </button>
              </div>
              <select
                className="sort-select"
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="newest">{t('fieldList.sortNewest')}</option>
                <option value="name">{t('fieldList.sortNameAZ')}</option>
                <option value="price-asc">{t('fieldList.sortPriceAsc')}</option>
                <option value="price-desc">{t('fieldList.sortPriceDesc')}</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && renderLoading()}

          {/* Error State */}
          {error && !loading && renderError()}

          {/* Empty State */}
          {!loading && !error && fields.length === 0 && renderEmpty()}

          {/* Fields Grid */}
          {!loading && !error && fields.length > 0 && (
            <div className={`fields-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {fields.map(field => (
                <FieldCard
                  key={field._id}
                  field={field}
                  viewMode={viewMode}
                  notification={notification}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && fields.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-button"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (filters.page <= 3) {
                  pageNum = i + 1;
                } else if (filters.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = filters.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`pagination-button ${filters.page === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {pagination.totalPages > 5 && filters.page < pagination.totalPages - 2 && (
                <>
                  <span className="pagination-dots">...</span>
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}

              <button
                className="pagination-button"
                disabled={filters.page === pagination.totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FieldListPage;

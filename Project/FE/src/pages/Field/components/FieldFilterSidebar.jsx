/**
 * @fileoverview FieldFilterSidebar - Component sidebar bộ lọc sân
 */

import { useTranslation } from 'react-i18next';

const FieldFilterSidebar = ({
  filters,
  searchInputText,
  setSearchInputText,
  priceInputValue,
  showMobileFilters,
  setShowMobileFilters,
  navHidden,
  globalData,
  facets,
  selectedCategoryFieldTypes,
  handleFilterChange,
  handleCategoryChange,
  handleFieldTypeChange,
  handleCityChange,
  handleWardChange,
  handleReset,
  handlePriceInputChange,
  handlePriceInputBlur,
  handlePriceKeyPress,
  clearSearch,
  handleSearchSubmit,
  handleSearchKeyPress,
}) => {
  const { t } = useTranslation();

  return (
    <aside className={`field-list-sidebar ${showMobileFilters ? 'show' : ''} ${navHidden ? 'nav-hidden' : ''}`}>
      {/* Mobile Filter Toggle */}
      <div
        className="mobile-filter-toggle"
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <span className="toggle-label">
          <span className="material-symbols-outlined">filter_list</span>
          {t('fieldList.filters')}
        </span>
        <span className="material-symbols-outlined">expand_more</span>
      </div>

      {/* Desktop Sidebar Content */}
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            <span className="material-symbols-outlined">tune</span>
            {t('fieldList.filterSearch')}
          </h3>
          <button onClick={handleReset} className="reset-button">{t('fieldList.reset')}</button>
        </div>

        {/* Search Input */}
        <div className="filter-group search-filter-group">
          <p className="filter-label">{t('fieldList.searchLabel')}</p>
          <div className="search-box">
            <div className="search-input-container">
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
                  aria-label="Xóa tìm kiếm"
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
            </button>
          </div>
        </div>

        {/* Sport Type Filter */}
        <div className="filter-group">
          <p className="filter-label">{t('fieldList.sportType')}</p>
          <div className="sport-chips">
            {globalData.categories.map((cat) => {
              const facet = facets.categories.find(fc => fc.name === cat.categoryName);
              const count = facet ? facet.count : 0;
              return (
                <label key={cat._id || cat.categoryName} className="chip-label">
                  <input
                    type="checkbox"
                    checked={filters.categoryName === cat.categoryName}
                    onChange={() => handleCategoryChange(cat.categoryName)}
                    className="chip-input"
                  />
                  <div className="chip">
                    {cat.categoryName} ({count})
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Field Type Filter */}
        {filters.categoryName && selectedCategoryFieldTypes.length >= 1 && (
          <div className="filter-group">
            <p className="filter-label">{t('fieldList.fieldType')}</p>
            <div className="sport-chips">
              {selectedCategoryFieldTypes.length === 1 ? (
                /* Chỉ 1 loại (Sân tiêu chuẩn) → hiển thị dạng auto-selected, không cho bỏ chọn */
                <div className="chip chip--auto-selected">
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>check_circle</span>
                  {selectedCategoryFieldTypes[0].typeName}
                </div>
              ) : (
                /* Nhiều loại (Bóng đá) → cho user chọn */
                selectedCategoryFieldTypes.map((fieldType) => (
                  <label key={fieldType._id || fieldType.typeName} className="chip-label">
                    <input
                      type="checkbox"
                      checked={filters.fieldTypeName === fieldType.typeName}
                      onChange={() => handleFieldTypeChange(fieldType.typeName)}
                      className="chip-input"
                    />
                    <div className="chip">
                      {fieldType.typeName}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {/* Location Filter — 2 dropdown cascade */}
        {facets.cities && facets.cities.length > 0 && (
          <div className="filter-group">
            <p className="filter-label">{t('fieldList.district')}</p>

            {/* Dropdown 1: Tỉnh / Thành Phố */}
            <div className="select-wrapper" style={{ marginBottom: '8px' }}>
              <select
                value={filters.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="filter-select"
              >
                <option value="">Tỉnh / Thành Phố</option>
                {[...facets.cities]
                  .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                  .map(({ name, count }) => (
                    <option key={name} value={name}>
                      {name} ({count})
                    </option>
                  ))}
              </select>
              <span className="material-symbols-outlined select-icon">expand_more</span>
            </div>

            {/* Dropdown 2: Phường / Xã / Quận — chỉ hiện khi đã chọn city */}
            {filters.city && (() => {
              const cityData = facets.cities.find(c => c.name === filters.city);
              const wards = cityData?.wards || [];
              return wards.length > 0 ? (
                <div className="select-wrapper">
                  <select
                    value={filters.ward}
                    onChange={(e) => handleWardChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Tất cả Xã / Phường / Thị Trấn</option>
                    {[...wards]
                      .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                      .map(({ name, count }) => (
                        <option key={name} value={name}>
                          {name} ({count})
                        </option>
                      ))}
                  </select>
                  <span className="material-symbols-outlined select-icon">expand_more</span>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Date & Time Filter */}
        <div className="filter-group">
          <p className="filter-label">{t('fieldList.time')}</p>
          <div className="time-inputs">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="time-input"
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="time-range">
              <input
                type="time"
                value={filters.startTime}
                onChange={(e) => handleFilterChange('startTime', e.target.value)}
                className="time-input small"
              />
              <span className="time-separator">-</span>
              <input
                type="time"
                value={filters.endTime}
                onChange={(e) => handleFilterChange('endTime', e.target.value)}
                className="time-input small"
              />
            </div>
          </div>
        </div>

        {/* Price Filter */}
        <div className="filter-group">
          <p className="filter-label">{t('fieldList.maxPrice')}</p>
          <div className="price-filter-simple">
            <div className="price-input-wrapper">
              <span className="price-currency">₫</span>
              <input
                type="text"
                inputMode="numeric"
                value={priceInputValue}
                onChange={handlePriceInputChange}
                onBlur={handlePriceInputBlur}
                onKeyPress={handlePriceKeyPress}
                className="price-input-field"
                placeholder="1.000.000"
              />
            </div>
            <p className="price-hint">
              Tối đa: <strong>{filters.priceMax.toLocaleString('vi-VN')}đ</strong>
              &nbsp;·&nbsp;Nhấn Enter hoặc click ra ngoài để áp dụng
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FieldFilterSidebar;

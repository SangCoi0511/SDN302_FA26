/**
 * @fileoverview FeaturedFieldsSection - Sân bóng nổi bật
 */

import { Link } from 'react-router-dom';

const FeaturedFieldsSection = ({
  categoryFilters,
  selectedCategory,
  setSelectedCategory,
  featuredFields,
  loadingFeatured,
  t,
}) => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-[#052e16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.featuredFields')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('home.featuredFieldsDesc')}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-filter-tabs">
          {categoryFilters.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`category-tab ${selectedCategory === category._id ? 'active' : ''}`}
            >
              {category.categoryName}
            </button>
          ))}
        </div>

        {/* Featured Fields Grid */}
        <div className="featured-fields-grid">
          {loadingFeatured ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="featured-field-card group animate-pulse">
                <div className="card-inner">
                  <div className="card-image bg-gray-200 dark:bg-green-900/40" style={{ height: '180px' }} />
                  <div className="card-content">
                    <div className="h-5 bg-gray-200 dark:bg-green-900/40 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-green-900/40 rounded mb-3 w-1/2" />
                    <div className="card-footer">
                      <div className="h-4 bg-gray-200 dark:bg-green-900/40 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 dark:bg-green-900/40 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : featuredFields.length > 0 ? (
            featuredFields.map((field) => (
              <Link key={field._id} to={`/fields/${field._id}`} className="featured-field-card group">
                <div className="card-inner">
                  <div className="card-image">
                    <img
                      alt={field.fieldName}
                      src={field.images?.[0] || field.image?.[0] || '/default-field.jpg'}
                      onError={(e) => { e.target.src = '/default-field.jpg'; }}
                    />
                    {field.averageRating > 0 && (
                      <div className="badge badge-rating">
                        <span className="material-icons-outlined">star</span>
                        {field.averageRating}
                      </div>
                    )}
                  </div>
                  <div className="card-content">
                    <h4 className="card-title">{field.fieldName}</h4>
                    <p className="card-address">
                      <span className="material-icons-outlined">location_on</span>
                      {field.district || field.address}
                    </p>
                    <div className="card-footer">
                      <span className="field-type-badge">
                        {field.fieldType?.typeName || t('home.standardField')}
                      </span>
                      <span className="field-price">
                        {(field.hourlyPrice / 1000).toFixed(0)}k/slot
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="featured-fields-empty">
              <span className="material-icons-outlined">sports_soccer</span>
              <p>{t('home.noFieldsFound')}</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link to="/fields">
            <button className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-green-700 text-base font-medium rounded-xl text-gray-700 dark:text-white bg-white dark:bg-[#14532d] hover:bg-gray-50 dark:hover:bg-green-800 transition-colors">
              {t('home.viewMoreFields')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedFieldsSection;

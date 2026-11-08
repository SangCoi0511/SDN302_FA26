/**
 * @fileoverview FieldReviews - Component hiển thị đánh giá sân
 * Bao gồm review summary (rating breakdown) và review list
 *
 * BE Feedback schema: { _id, bookingDetailID, rate (1-5), content, createdAt }
 * Customer info is NOT populated — display anonymously.
 */

const FieldReviews = ({ feedbacks, averageRating, totalReviews, ratingBreakdown }) => {
  return (
    <div className="detail-section" id="reviews">
      <div className="reviews-header">
        <h3 className="section-title">Đánh giá & Bình luận</h3>
      </div>

      {/* Review Summary — only show when there are reviews */}
      {totalReviews > 0 ? (
        <div className="review-summary">
          <div className="summary-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="material-symbols-outlined star-filled">
                  {star <= Math.floor(averageRating)
                    ? 'star'
                    : star === Math.ceil(averageRating) && averageRating % 1 !== 0
                    ? 'star_half'
                    : 'star'}
                </span>
              ))}
            </div>
            <span className="rating-count">{totalReviews} đánh giá</span>
          </div>

          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="rating-row">
                <span className="rating-label">{star} sao</span>
                <div className="rating-bar">
                  <div className="rating-fill" style={{ width: `${ratingBreakdown[star]}%` }} />
                </div>
                <span className="rating-percent">{ratingBreakdown[star]}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Review List */}
      <div className="reviews-list">
        {feedbacks.length > 0 ? feedbacks.map((feedback, index) => {
          // BE field names: rate, content (not rating/comment)
          const rating = feedback.rate ?? feedback.rating ?? 0;
          const comment = feedback.content ?? feedback.comment ?? '';
          const date = feedback.createdAt
            ? new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric', month: 'long', day: 'numeric',
              })
            : '';

          // Customer info from populated path: bookingDetailID.bookingID.customerID
          const customer = feedback.bookingDetailID?.bookingID?.customerID;
          const authorName = customer?.name || `Khách hàng #${index + 1}`;
          const authorImage = customer?.image || null;

          return (
            <div key={feedback._id} className="review-item">
              {/* Avatar */}
              <div
                className="review-avatar"
                style={authorImage ? { backgroundImage: `url(${authorImage})` } : {}}
              >
                {!authorImage && (
                  <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>
                    person
                  </span>
                )}
              </div>

              <div className="review-content">
                <div className="review-header">
                  <div>
                    <h4 className="review-author">{authorName}</h4>
                    <div className="review-meta">
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`material-symbols-outlined ${star <= rating ? 'star-filled' : 'star-empty'}`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      {date && <span className="review-date">{date}</span>}
                    </div>
                  </div>
                </div>
                {comment && <p className="review-text">{comment}</p>}
              </div>
            </div>
          );
        }) : (
          /* Empty state — sân chưa có ai đánh giá */
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '3rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}
            >
              rate_review
            </span>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              Sân chưa có đánh giá nào
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Hãy đặt sân và chia sẻ trải nghiệm của bạn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldReviews;

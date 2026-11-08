/**
 * @fileoverview FieldImageGallery - Component hiển thị gallery ảnh sân
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const FieldImageGallery = ({ images }) => {
  const { t } = useTranslation();

  const safeImages = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbsRef = useRef(null);

  // Auto-scroll active thumb into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const container = thumbsRef.current;
    const activeThumb = container.querySelector('.carousel-thumb.is-active');
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndex]);

  // Dynamic preview ratio (option 3)

  // zoom overlay
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  // Real slide transition
  const [isSliding, setIsSliding] = useState(false);
  const [slideDir, setSlideDir] = useState('next'); // next | prev
  const slideTimerRef = useRef(null);

  const SLIDE_MS = 650;

  const beginSlide = (dir, nextIndex) => {
    if (safeImages.length <= 1) return;
    if (isSliding) return;

    setSlideDir(dir);
    setIsSliding(true);

    // commit active index after the track has slid
    if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
    slideTimerRef.current = window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsSliding(false);
    }, SLIDE_MS);
  };

  // Auto-play: advance every 5s (pause when zoom is open)
  useEffect(() => {
    if (zoomOpen) return;
    if (safeImages.length <= 1) return;

    const timer = window.setInterval(() => {
      const next = (activeIndex + 1) % safeImages.length;
      beginSlide('next', next);
    }, 5000);

    return () => window.clearInterval(timer);
    // activeIndex is intentionally included so autoplay uses current index
  }, [zoomOpen, safeImages.length, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
    setIsSliding(false);
  }, [safeImages.length]);

  useEffect(() => {
    return () => {
      if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!zoomOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (e.key === 'ArrowLeft') {
        const prev = (activeIndex - 1 + safeImages.length) % safeImages.length;
        setActiveIndex(prev);
      }
      if (e.key === 'ArrowRight') {
        const next = (activeIndex + 1) % safeImages.length;
        setActiveIndex(next);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomOpen, safeImages.length, activeIndex]);

  useEffect(() => {
    // reset zoom when switching image
    if (zoomOpen) {
      setZoomScale(1);
      setZoomOrigin({ x: 50, y: 50 });
    }
  }, [activeIndex, zoomOpen]);

  const handlePrev = () => {
    if (safeImages.length <= 1) return;
    const next = (activeIndex - 1 + safeImages.length) % safeImages.length;
    beginSlide('prev', next);
  };

  const handleNext = () => {
    if (safeImages.length <= 1) return;
    const next = (activeIndex + 1) % safeImages.length;
    beginSlide('next', next);
  };

  const handleThumbClick = (idx) => {
    if (idx === activeIndex) return;
    // thumb click updates immediately (no slide), keeps UX snappy
    setIsSliding(false);
    setActiveIndex(idx);
  };

  const openZoom = () => {
    setZoomOpen(true);
    setZoomScale(1);
    setZoomOrigin({ x: 50, y: 50 });
  };

  const closeZoom = () => setZoomOpen(false);

  const onZoomMouseMove = (e) => {
    // only calculate when zoomed in
    if (zoomScale <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
  };

  const zoomIn = () => setZoomScale((s) => clamp(Number((s + 0.5).toFixed(2)), 1, 3));
  const zoomOut = () => setZoomScale((s) => clamp(Number((s - 0.5).toFixed(2)), 1, 3));

  // Empty state
  if (!safeImages.length) {
    return (
      <div className="image-gallery-carousel image-gallery-carousel--empty">
        <div className="carousel-viewport">
          <div className="carousel-slide carousel-slide--empty">
            <span className="material-symbols-outlined">image</span>
            <p>{t('fieldDetail.gallery.empty', 'Chưa có ảnh')}</p>
          </div>
        </div>
      </div>
    );
  }

  const prevIndex = (activeIndex - 1 + safeImages.length) % safeImages.length;
  const nextIndex = (activeIndex + 1) % safeImages.length;

  // Track positions always render 3 slides to enable real translateX sliding.
  const leftSrc = safeImages[slideDir === 'prev' ? nextIndex : prevIndex];
  const centerSrc = safeImages[activeIndex];
  const rightSrc = safeImages[slideDir === 'prev' ? prevIndex : nextIndex];

  const trackTranslate = isSliding
    ? (slideDir === 'next' ? '-200%' : '0%')
    : '-100%';

  // Fixed preview ratio for stability (16:9)
  const previewRatio = 16 / 9;

  return (
    <>
      <div className="image-gallery-carousel image-gallery-carousel--shopee">
        {/* Main preview */}
        <div
          className="carousel-viewport"
          onClick={openZoom}
          role="button"
          tabIndex={0}
          aria-label={t('fieldDetail.gallery.openZoom', 'Mở ảnh phóng to')}
          style={{ aspectRatio: previewRatio }}
        >
          <div
            className="carousel-track"
            style={{
              transform: `translateX(${trackTranslate})`,
              transitionDuration: isSliding ? `${SLIDE_MS}ms` : '0ms',
            }}
          >
            <div className="carousel-track-slide" aria-hidden="true">
              <img className="carousel-preview-img" src={leftSrc} alt="" draggable={false} />
            </div>
            <div className="carousel-track-slide">
              <img
                className="carousel-preview-img"
                src={centerSrc}
                alt={t('fieldDetail.gallery.imageAlt', { index: activeIndex + 1, defaultValue: `Ảnh sân ${activeIndex + 1}` })}
                loading="eager"
                draggable={false}
              />
            </div>
            <div className="carousel-track-slide" aria-hidden="true">
              <img className="carousel-preview-img" src={rightSrc} alt="" draggable={false} />
            </div>
          </div>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                className="carousel-nav carousel-nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label={t('fieldDetail.gallery.prev', 'Ảnh trước')}
                disabled={isSliding}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                className="carousel-nav carousel-nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label={t('fieldDetail.gallery.next', 'Ảnh tiếp theo')}
                disabled={isSliding}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <div className="carousel-counter" aria-label={t('fieldDetail.gallery.counterLabel', 'Số thứ tự ảnh')}>
                {activeIndex + 1} / {safeImages.length}
              </div>
            </>
          )}

          <div className="carousel-zoom-hint" aria-hidden="true">
            <span className="material-symbols-outlined">zoom_in</span>
            {t('fieldDetail.gallery.zoomHint', 'Click để phóng to')}
          </div>
        </div>

        {/* Bottom thumbs (Horizontal scroll) */}
        {safeImages.length > 1 && (
          <div
            ref={thumbsRef}
            className="carousel-thumbs carousel-thumbs--bottom"
            role="tablist"
            aria-label={t('fieldDetail.gallery.chooseImage', 'Chọn ảnh')}
          >
            {safeImages.map((src, idx) => (
              <button
                key={`${src}-thumb-${idx}`}
                type="button"
                className={`carousel-thumb ${idx === activeIndex ? 'is-active' : ''}`}
                onClick={() => handleThumbClick(idx)}
                aria-label={t('fieldDetail.gallery.viewImage', { index: idx + 1, defaultValue: `Xem ảnh ${idx + 1}` })}
                aria-pressed={idx === activeIndex}
              >
                <img src={src} alt="" loading="lazy" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom overlay */}
      {zoomOpen && (
        <div className="gallery-zoom-overlay" role="dialog" aria-modal="true" onClick={closeZoom}>
          <div className="gallery-zoom-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gallery-zoom-close"
              onClick={closeZoom}
              aria-label={t('common.close', 'Đóng')}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="gallery-zoom-toolbar">
              <button
                type="button"
                className="gallery-zoom-btn"
                onClick={() => setActiveIndex((p) => (p - 1 + safeImages.length) % safeImages.length)}
                disabled={safeImages.length <= 1}
                aria-label={t('fieldDetail.gallery.prev', 'Ảnh trước')}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="gallery-zoom-counter">
                {activeIndex + 1} / {safeImages.length}
              </div>
              <button
                type="button"
                className="gallery-zoom-btn"
                onClick={() => setActiveIndex((p) => (p + 1) % safeImages.length)}
                disabled={safeImages.length <= 1}
                aria-label={t('fieldDetail.gallery.next', 'Ảnh tiếp theo')}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>

              <div className="gallery-zoom-spacer" />

              <button
                type="button"
                className="gallery-zoom-btn"
                onClick={zoomOut}
                disabled={zoomScale <= 1}
                aria-label={t('fieldDetail.gallery.zoomOut', 'Thu nhỏ')}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <div className="gallery-zoom-level">{Math.round(zoomScale * 100)}%</div>
              <button
                type="button"
                className="gallery-zoom-btn"
                onClick={zoomIn}
                disabled={zoomScale >= 3}
                aria-label={t('fieldDetail.gallery.zoomIn', 'Phóng to')}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            <div className="gallery-zoom-stage" onMouseMove={onZoomMouseMove}>
              <img
                className="gallery-zoom-img"
                src={safeImages[activeIndex]}
                alt={t('fieldDetail.gallery.imageAlt', { index: activeIndex + 1, defaultValue: `Ảnh sân ${activeIndex + 1}` })}
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }}
                draggable={false}
              />
            </div>

            {safeImages.length > 1 && (
              <div className="gallery-zoom-thumbs" aria-label={t('fieldDetail.gallery.chooseImage', 'Chọn ảnh')}>
                {safeImages.map((src, idx) => (
                  <button
                    key={`${src}-zoom-thumb-${idx}`}
                    type="button"
                    className={`gallery-zoom-thumb ${idx === activeIndex ? 'is-active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={t('fieldDetail.gallery.viewImage', { index: idx + 1, defaultValue: `Xem ảnh ${idx + 1}` })}
                  >
                    <img src={src} alt="" draggable={false} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FieldImageGallery;

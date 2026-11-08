import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/TermsPage.css';

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState('general-terms');
  const [navHidden, setNavHidden] = useState(false);
  const { t } = useTranslation();

  const tArray = (key) => {
    const value = t(key, { returnObjects: true });
    return Array.isArray(value) ? value : [];
  };

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

    // Watch navbar hidden state
    const checkNavbar = () => {
      const nav = document.querySelector('.header-nav');
      if (nav) {
        setNavHidden(nav.classList.contains('header-hidden'));
      }
    };

    const navObserver = new MutationObserver(checkNavbar);
    const nav = document.querySelector('.header-nav');
    if (nav) {
      navObserver.observe(nav, { attributes: true, attributeFilter: ['class'] });
    }

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
      navObserver.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const sidebarLinks = [
    { id: 'general-terms', icon: 'gavel', label: t('terms.section1Label') },
    { id: 'booking-policy', icon: 'event_available', label: t('terms.section2Label') },
    { id: 'refund-policy', icon: 'payments', label: t('terms.section3Label') },
    { id: 'privacy-policy', icon: 'verified_user', label: t('terms.section4Label') },
    { id: 'community-rules', icon: 'groups', label: t('terms.section5Label') },
  ];

  return (
    <main className="terms-page">
      

      {/* Page Header */}
      <div className="terms-header">
        <h1 className="terms-title" style={{ color: '#1e8d38ff' }}>{t('terms.pageTitle')}</h1>
        <p className="terms-meta">
          <span className="material-symbols-outlined terms-meta-icon">calendar_today</span>
          {t('terms.lastUpdated')}
        </p>
      </div>

      <div className="terms-container">
        {/* Sidebar Navigation */}
        <aside className={`terms-sidebar ${navHidden ? 'nav-hidden' : ''}`}>
          <div className="terms-sidebar-sticky">
            <p className="terms-sidebar-label">{t('terms.tableOfContents')}</p>
            <nav className="terms-nav-list">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`terms-nav-link ${activeSection === link.id ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined terms-nav-icon">{link.icon}</span>
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <article className="terms-content">
          {/* Section 1: Điều khoản chung */}
          <section id="general-terms" className="terms-section">
            <h2 className="terms-section-title">
              <span className="material-icons-outlined terms-section-icon">info</span>
              {t('terms.section1Title')}
            </h2>
            <div className="terms-section-content">
              <p>
                {t('terms.content.general.intro')}
              </p>
              <ul>
                {tArray('terms.content.general.bullets').map((text, idx) => (
                  <li key={idx}>{text}</li>
                ))}
              </ul>
            </div>
          </section>

          <hr className="terms-section-divider" />

          {/* Section 2: Booking Policy */}
          <section id="booking-policy" className="terms-section">
            <h2 className="terms-section-title">
              <span className="terms-section-icon-wrapper green">
                <span className="material-symbols-outlined">event_available</span>
              </span>
              {t('terms.section2Title')}
            </h2>
            <div className="terms-section-body">
              <p>
                {t('terms.content.bookingPolicy.intro')}
              </p>

              <h3 className="terms-subsection-title">
                {t('terms.content.bookingPolicy.processTitle')}
              </h3>
              <ul>
                {tArray('terms.content.bookingPolicy.processBullets').map((text, idx) => (
                  <li key={idx}>{text}</li>
                ))}
              </ul>

              <h3 className="terms-subsection-title">
                {t('terms.content.bookingPolicy.responsibilityTitle')}
              </h3>
              <p>
                {t('terms.content.bookingPolicy.responsibilityText')}
              </p>
            </div>
          </section>

          {/* Section 3: Thanh toán & Hoàn phí */}
          <section id="refund-policy" className="terms-section">
            <h2 className="terms-section-title">
              <span className="terms-section-icon-wrapper orange">
                <span className="material-symbols-outlined">payments</span>
              </span>
              {t('terms.section3Title')}
            </h2>
            <div className="terms-section-body">
              <p>
                {t('terms.content.refund.intro')}
              </p>

              <div className="terms-refund-cards">
                <div className="terms-refund-card">
                  <p className="terms-refund-time">{t('terms.content.refund.card1Time')}</p>
                </div>
              </div>
              <p className="terms-note">
                <em>
                  {t('terms.content.refund.note')}
                </em>
              </p>
            </div>
          </section>

          {/* Section 4: An toàn & Bảo mật */}
          <section id="privacy-policy" className="terms-section">
            <h2 className="terms-section-title">
              <span className="terms-section-icon-wrapper purple">
                <span className="material-symbols-outlined">verified_user</span>
              </span>
              {t('terms.section4Title')}
            </h2>
            <div className="terms-section-body">
              <p>
                {t('terms.content.security.intro')}
              </p>

              <h3 className="terms-subsection-title">
                {t('terms.content.security.collectTitle')}
              </h3>
              <p>
                {t('terms.content.security.collectText')}
              </p>

              <h3 className="terms-subsection-title">
                {t('terms.content.security.useTitle')}
              </h3>
              <ul>
                {tArray('terms.content.security.useBullets').map((text, idx) => (
                  <li key={idx}>{text}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 5: Quy tắc cộng đồng */}
          <section id="community-rules" className="terms-section">
            <h2 className="terms-section-title">
              <span className="terms-section-icon-wrapper teal">
                <span className="material-symbols-outlined">groups</span>
              </span>
              {t('terms.section5Title')}
            </h2>
            <div className="terms-section-body">
              <p>
                {t('terms.content.community.intro')}
              </p>
              <ul className="terms-bullet-list">
                {tArray('terms.content.community.bullets').map((text, idx) => (
                  <li key={idx}>{text}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Contact Info */}
          <div className="terms-highlight">
            <p className="terms-highlight-content">
              <span className="material-icons-outlined" style={{ fontSize: '1.25rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>info</span>
              {t('terms.contactNote')}{' '}
              <span className="terms-contact-link">1900 1234</span> {t('terms.contactOr')}{' '}
              <span className="terms-contact-link">legal@sansieutoc.vn</span>.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
};

export default TermsPage;

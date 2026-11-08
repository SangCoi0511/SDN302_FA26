import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { t } = useTranslation();

  const tArray = (key) => {
    const value = t(key, { returnObjects: true });
    return Array.isArray(value) ? value : [];
  };

  const tObj = (key) => {
    const value = t(key, { returnObjects: true });
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  };

  const overview = tObj('privacy.content.overview');
  const dataCollection = tObj('privacy.content.dataCollection');
  const dataUsage = tObj('privacy.content.dataUsage');
  const dataSecurity = tObj('privacy.content.dataSecurity');
  const userRights = tObj('privacy.content.userRights');
  const cookies = tObj('privacy.content.cookies');

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

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
    { id: 'overview', icon: 'info', label: t('privacy.section1Label') },
    { id: 'data-collection', icon: 'storage', label: t('privacy.section2Label') },
    { id: 'data-usage', icon: 'settings', label: t('privacy.section3Label') },
    { id: 'data-security', icon: 'security', label: t('privacy.section4Label') },
    { id: 'user-rights', icon: 'account_circle', label: t('privacy.section5Label') },
    { id: 'cookies', icon: 'cookie', label: t('privacy.section6Label') },
  ];

  return (
    <main className="privacy-page">
      {/* Page Header */}
      <div className="privacy-header">
        <h1 className="privacy-title">
          {t('privacy.pageTitle')}
        </h1>
        <p className="privacy-meta">
          {t('privacy.effectiveDate')}
        </p>
      </div>

      <div className="privacy-container">
        {/* Sidebar Navigation */}
        <aside className="privacy-sidebar">
          <div className="privacy-sidebar-sticky">
            <h3 className="privacy-sidebar-title">{t('privacy.tableOfContents')}</h3>
            <nav>
              <ul className="privacy-nav-list">
                {sidebarLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className={`privacy-nav-link ${activeSection === link.id ? 'active' : ''}`}
                    >
                      <span className="material-icons-outlined">{link.icon}</span>
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="privacy-mobile-nav">
          <select
            value={activeSection}
            onChange={(e) => scrollToSection(e.target.value)}
            className="privacy-mobile-select"
          >
            {sidebarLinks.map((link) => (
              <option key={link.id} value={link.id}>
                {link.label}
              </option>
            ))}
          </select>
        </div>

        {/* Main Content */}
        <article className="privacy-content">
          {/* Section 1: Overview */}
          <section id="overview" className="privacy-section">
            <h2 className="privacy-section-title">
              <span className="material-icons-outlined privacy-section-icon">info</span>
              {t('privacy.section1Title')}
            </h2>
            <div className="privacy-section-content">
              <p>{overview.p1}</p>
              <p>{overview.p2}</p>

              <div className="privacy-info-box">
                <p className="privacy-info-title">
                  <span className="material-icons-outlined">verified_user</span>
                  {overview?.commitment?.title}
                </p>
                <p className="privacy-info-content">
                  {overview?.commitment?.text}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Data Collection */}
          <section id="data-collection" className="privacy-section">
            <h2 className="privacy-section-title">
              <span className="material-icons-outlined privacy-section-icon">storage</span>
              {t('privacy.section2Title')}
            </h2>
            <div className="privacy-section-content">
              <p>{dataCollection.intro}</p>

              <h3>{dataCollection?.personal?.title}</h3>
              <p>{dataCollection?.personal?.intro}</p>
              <ul>
                {tArray('privacy.content.dataCollection.personal.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3>{dataCollection?.automatic?.title}</h3>
              <p>{dataCollection?.automatic?.intro}</p>
              <ul>
                {tArray('privacy.content.dataCollection.automatic.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3>{dataCollection?.thirdParty?.title}</h3>
              <p>{dataCollection?.thirdParty?.intro}</p>
              <ul>
                {tArray('privacy.content.dataCollection.thirdParty.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <div className="privacy-data-table">
                <table>
                  <thead>
                    <tr>
                      {tArray('privacy.content.dataCollection.table.headers').map((h, idx) => (
                        <th key={idx}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tArray('privacy.content.dataCollection.table.rows').map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.type}</td>
                        <td>{row.purpose}</td>
                        <td>{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3: Data Usage */}
          <section id="data-usage" className="privacy-section">
            <h2 className="privacy-section-title">
              <span className="material-icons-outlined privacy-section-icon">settings</span>
              {t('privacy.section3Title')}
            </h2>
            <div className="privacy-section-content">
              <p>{dataUsage.intro}</p>

              <h3>{dataUsage?.provideService?.title}</h3>
              <ul>
                {tArray('privacy.content.dataUsage.provideService.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3>{dataUsage?.improveExperience?.title}</h3>
              <ul>
                {tArray('privacy.content.dataUsage.improveExperience.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3>{dataUsage?.securityCompliance?.title}</h3>
              <ul>
                {tArray('privacy.content.dataUsage.securityCompliance.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <div className="privacy-warning-box">
                <p className="privacy-warning-title">
                  <span className="material-icons-outlined">warning</span>
                  {dataUsage?.thirdPartySharing?.title}
                </p>
                <p className="privacy-warning-content">
                  {dataUsage?.thirdPartySharing?.text}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Data Security */}
          <section id="data-security" className="privacy-section">
            <h2 className="privacy-section-title">
              <span className="material-icons-outlined privacy-section-icon">security</span>
              {t('privacy.section4Title')}
            </h2>
            <div className="privacy-section-content">
              <p>{dataSecurity.intro}</p>

              <div className="privacy-security-box">
                <p className="privacy-security-title">
                  <span className="material-icons-outlined">lock</span>
                  {dataSecurity?.technical?.title}
                </p>
                <ul className="privacy-security-content">
                  {tArray('privacy.content.dataSecurity.technical.items').map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <h3>{dataSecurity?.accessControl?.title}</h3>
              <ul>
                {tArray('privacy.content.dataSecurity.accessControl.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h3>{dataSecurity?.incidentResponse?.title}</h3>
              <p>{dataSecurity?.incidentResponse?.intro}</p>
              <ul>
                {tArray('privacy.content.dataSecurity.incidentResponse.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 5: User Rights */}
          <section id="user-rights" className="privacy-section">
            <h2 className="privacy-section-title">
              <span className="material-icons-outlined privacy-section-icon">account_circle</span>
              {t('privacy.section5Title')}
            </h2>
            <div className="privacy-section-content">
              <p>{userRights.intro}</p>

              <div className="privacy-rights-grid">
                {tArray('privacy.content.userRights.cards').map((card, idx) => (
                  <div className="privacy-rights-card" key={idx}>
                    <div className="privacy-rights-card-icon">
                      <span className="material-icons-outlined">{card.icon}</span>
                    </div>
                    <h4 className="privacy-rights-card-title">{card.title}</h4>
                    <p className="privacy-rights-card-desc">{card.desc}</p>
                  </div>
                ))}
              </div>

              <p>
                {userRights.contactText}{' '}
                <a href="mailto:privacy@sansieutoc.vn" className="privacy-contact-link">
                  privacy@sansieutoc.vn
                </a>
              </p>
            </div>
          </section>

          {/* Section 6: Cookies */}
          <section id="cookies" className="privacy-section">
            <h2 className="privacy-section-title">
              <span className="material-icons-outlined privacy-section-icon">cookie</span>
              {t('privacy.section6Title')}
            </h2>
            <div className="privacy-section-content">
              <p>{cookies.intro}</p>

              <h3>{cookies?.types?.title}</h3>
              <ul>
                {tArray('privacy.content.cookies.types.items').map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.title}:</strong> {item.desc}
                  </li>
                ))}
              </ul>

              <h3>{cookies?.manage?.title}</h3>
              <p>{cookies?.manage?.intro}</p>
              <ul>
                {tArray('privacy.content.cookies.manage.items').map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <div className="privacy-info-box">
                <p className="privacy-info-title">
                  <span className="material-icons-outlined">info</span>
                  {cookies?.note?.title}
                </p>
                <p className="privacy-info-content">
                  {cookies?.note?.text}
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <div className="privacy-contact-section">
            <div className="privacy-contact-icon">
              <span className="material-icons-outlined">support_agent</span>
            </div>
            <h3 className="privacy-contact-title">{t('privacy.contactTitle')}</h3>
            <p className="privacy-contact-desc">
              {t('privacy.contactDesc')}
            </p>
            <a href="mailto:privacy@sansieutoc.vn" className="privacy-contact-btn">
              <span className="material-icons-outlined">email</span>
              {t('privacy.contactBtn')}
            </a>
          </div>

          {/* Footer */}
          <div className="privacy-footer">
            <p className="privacy-footer-text">
              {t('privacy.footerText')}
            </p>
          </div>
        </article>
      </div>

      {/* Back to Top Button */}
      <button className="privacy-back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t('privacy.backToTop')}>
        <span className="material-icons-outlined">arrow_upward</span>
      </button>
    </main>
  );
};

export default PrivacyPolicyPage;

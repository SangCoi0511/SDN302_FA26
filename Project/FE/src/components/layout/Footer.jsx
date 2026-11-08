import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/images/logo.png';
import '../../styles/Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid footer-grid-3">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo-wrapper">
              <img
                alt="Sân Siêu Tốc Logo"
                className="footer-logo"
                src={logo}
              />
              <span className="footer-brand-name">
                Sân Siêu Tốc
              </span>
            </div>
            <p className="footer-brand-desc">
              {t('footer.brandDesc')}
            </p>
            <div className="footer-socials">
              <a
                className="footer-social-link"
                href="#"
                aria-label="Facebook"
              >
                <i className="material-icons-outlined">facebook</i>
              </a>
              <a
                className="footer-social-link"
                href="#"
                aria-label="Instagram"
              >
                <i className="material-icons-outlined">camera_alt</i>
              </a>
            </div>
          </div>

          {/* About Us */}
          <div className="footer-section">
            <h3 className="footer-section-title">{t('footer.aboutUs')}</h3>
            <ul className="footer-section-list">
              <li>
                <Link className="footer-link" to="/about">
                  {t('footer.introduction')}
                </Link>
              </li>
              <li>
                <Link className="footer-link" to="/terms">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link className="footer-link" to="/privacy">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-section-title">{t('footer.contact')}</h3>
            <ul className="footer-section-list">
              <li className="footer-contact-item">
                <span className="material-icons-outlined">email</span>
                support@sansieutoc.vn
              </li>
              <li className="footer-contact-item">
                <span className="material-icons-outlined">phone</span>
                1900 1234
              </li>
              <li className="footer-contact-item">
                <span className="material-icons-outlined">place</span>
                Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            {t('footer.copyright')}
          </p>
          <div className="footer-powered">
            <span className="footer-powered-text">{t('footer.poweredBy')}</span>
            <span className="footer-powered-brand">
              Tailwind CSS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

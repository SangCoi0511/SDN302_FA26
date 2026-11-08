import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        <div className="notfound-icon">
          <span className="material-symbols-outlined">search_off</span>
        </div>
        <h1 className="notfound-title">{t('notFound.title')}</h1>
        <p className="notfound-message">{t('notFound.message')}</p>
        <p className="notfound-sub">{t('notFound.sub')}</p>
        <div className="notfound-actions">
          <button
            type="button"
            className="notfound-button-back"
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {t('notFound.goBack')}
          </button>
          <Link to="/" className="notfound-button">
            <span className="material-symbols-outlined">home</span>
            {t('notFound.goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

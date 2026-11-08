/**
 * SettingsTab Component
 * Tab cài đặt: bảo mật, ngôn ngữ
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PasswordChangeModal from './PasswordChangeModal';

const SettingsTab = () => {
  const { t } = useTranslation();

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <h2 className="user-dashboard-page-title">{t('settings.title')}</h2>

      {/* Security Section */}
      <section className="user-dashboard-settings-section">
        <div className="user-dashboard-settings-section-header">
          <h3 className="user-dashboard-settings-section-title">
            <span className="material-symbols-outlined">security</span>
            {t('settings.security')}
          </h3>
          <p className="user-dashboard-settings-section-desc">
            {t('settings.securityDesc')}
          </p>
        </div>
        <div className="user-dashboard-settings-section-body">
          <div className="user-dashboard-settings-toggle-row">
            <div>
              <p className="user-dashboard-settings-toggle-label">{t('settings.password')}</p>
              <p className="user-dashboard-settings-toggle-desc">
                {t('settings.passwordDesc')}
              </p>
            </div>
            <button
              className="user-dashboard-settings-btn-outline"
              onClick={() => setShowPasswordModal(true)}
            >
              {t('settings.changePassword')}
            </button>
          </div>
        </div>
      </section>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};

export default SettingsTab;

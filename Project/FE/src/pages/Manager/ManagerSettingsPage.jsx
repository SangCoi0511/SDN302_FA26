/**
 * ManagerSettingsPage
 * Trang cài đặt riêng cho Manager: thông tin cá nhân, ảnh đại diện, QR, đổi mật khẩu, giao diện
 */
import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import authService from '../../services/authService';
import { getUserAvatar } from '../../utils/defaultAvatar';
import '../../styles/ManagerSettingsPage.css';

// ─── Password Field with toggle ────────────────────────────────────────────
const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="ms-form-field">
      <label className="ms-form-label">{label}</label>
      <div className="ms-input-wrapper">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="ms-input"
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          className="ms-toggle-password"
          onClick={() => setShow((s) => !s)}
        >
          <span className="material-symbols-outlined">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const ManagerSettingsPage = () => {
  const { user, updateUser } = useAuth();
  const notification = useNotification();

  // ── Profile form state ──
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // ── Avatar state ──
  const [avatarPreview, setAvatarPreview] = useState(null);   // base64 preview
  const [avatarBase64, setAvatarBase64] = useState(null);     // base64 to send
  const avatarInputRef = useRef(null);

  // ── QR state ──
  const [qrPreview, setQrPreview] = useState(user?.imageQR || null);
  const [qrBase64, setQrBase64] = useState(null);
  const qrInputRef = useRef(null);

  // ── Password form state ──
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Helpers: file → base64 ──
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ── Avatar handlers ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notification.error('Chỉ chấp nhận file ảnh (jpg, png, webp…)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notification.error('Ảnh không được vượt quá 5MB');
      return;
    }
    const b64 = await fileToBase64(file);
    setAvatarPreview(b64);
    setAvatarBase64(b64);
  };

  // ── QR handlers ──
  const handleQrChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notification.error('Chỉ chấp nhận file ảnh cho mã QR');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      notification.error('Ảnh QR không được vượt quá 3MB');
      return;
    }
    const b64 = await fileToBase64(file);
    setQrPreview(b64);
    setQrBase64(b64);
  };

  const handleRemoveQr = () => {
    setQrPreview(null);
    setQrBase64('');         // gửi chuỗi rỗng → xóa QR trên BE
    if (qrInputRef.current) qrInputRef.current.value = '';
  };

  // ── Profile submit ──
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (!profileForm.name.trim()) {
      setProfileError('Tên không được để trống.');
      return;
    }
    if (!String(user?.email || '').trim()) {
      setProfileError('Email không được để trống.');
      return;
    }
    if (!profileForm.phone.trim()) {
      setProfileError('Số điện thoại không được để trống.');
      return;
    }
    if (!/^(0|\+84)[3-9]\d{8}$/.test(profileForm.phone.trim())) {
      setProfileError('Số điện thoại không hợp lệ (VD: 0901234567).');
      return;
    }

    setProfileLoading(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        email: String(user?.email || '').trim(),
      };
      // Chỉ gửi image/imageQR nếu user đã chọn file mới
      if (avatarBase64 !== null) payload.image = avatarBase64;
      if (qrBase64 !== null)     payload.imageQR = qrBase64;

      const response = await authService.updateManagerProfile(payload);

      if (!response.success) {
        setProfileError(response.message || 'Cập nhật thất bại.');
        return;
      }

      // Cập nhật AuthContext — giữ nguyên role và các trường gốc, chỉ merge dữ liệu mới
      if (response.data?.manager) {
        const updatedManager = response.data.manager;
        updateUser({
          ...user,                                          // giữ role, id, và các trường hiện tại
          name:     updatedManager.name    ?? user?.name,
          phone:    updatedManager.phone   ?? user?.phone,
          image:    updatedManager.image   ?? user?.image,
          imageQR:  updatedManager.imageQR ?? user?.imageQR ?? null,
          // KHÔNG override role — tránh mất quyền manager → redirect login
        });
      }

      // Reset dirty state
      setAvatarBase64(null);
      setQrBase64(null);
      notification.success('Cập nhật thông tin thành công!');
    } catch (err) {
      setProfileError(err.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
    setPwError('');
    setPwSuccess(false);
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNewPassword) {
      setPwError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(pwForm.newPassword)) {
      setPwError('Mật khẩu mới phải có chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&#).');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setPwLoading(true);
    try {
      const response = await authService.changePasswordManager({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmNewPassword: pwForm.confirmNewPassword,
      });

      if (!response.success) {
        setPwError(response.message || 'Đổi mật khẩu thất bại.');
        return;
      }

      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      notification.success('Đổi mật khẩu thành công!');
    } catch (err) {
      setPwError(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Current avatar src ──
  const currentAvatarSrc = avatarPreview || getUserAvatar(user?.image, user?.name);

  return (
    <div className="ms-page">
      <div className="ms-grid">

        {/* ── Edit Profile Card ── */}
        <section className="ms-card">
          <div className="ms-card-header">
            <span className="material-symbols-outlined ms-card-icon">manage_accounts</span>
            <h2 className="ms-card-title">Chỉnh sửa thông tin cá nhân</h2>
          </div>

          {profileError && (
            <div className="ms-error-banner">
              <span className="material-symbols-outlined">error</span>
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="ms-profile-form">
            {/* ── Avatar + QR row ── */}
            <div className="ms-media-row">
              {/* Avatar upload */}
              <div className="ms-media-block">
                <p className="ms-media-label">Ảnh đại diện</p>
                <div className="ms-avatar-wrap">
                  <img
                    src={currentAvatarSrc}
                    alt={user?.name}
                    className="ms-avatar-preview"
                  />
                  {avatarBase64 && (
                    <span className="ms-media-badge">Mới</span>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="ms-file-hidden"
                  onChange={handleAvatarChange}
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="ms-btn-upload">
                  <span className="material-symbols-outlined">upload</span>
                  Chọn ảnh
                </label>
                <p className="ms-media-hint">JPG, PNG, WebP · Tối đa 5MB</p>
              </div>

              {/* QR upload */}
              <div className="ms-media-block">
                <p className="ms-media-label">Mã QR thanh toán</p>
                <div className="ms-qr-wrap">
                  {qrPreview ? (
                    <>
                      <img src={qrPreview} alt="QR Code" className="ms-qr-preview" />
                      <button
                        type="button"
                        className="ms-qr-remove"
                        onClick={handleRemoveQr}
                        title="Xóa mã QR"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </>
                  ) : (
                    <div className="ms-qr-placeholder">
                      <span className="material-symbols-outlined">qr_code_2</span>
                      <span>Chưa có mã QR</span>
                    </div>
                  )}
                </div>
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  className="ms-file-hidden"
                  onChange={handleQrChange}
                  id="qr-upload"
                />
                <label htmlFor="qr-upload" className="ms-btn-upload">
                  <span className="material-symbols-outlined">qr_code</span>
                  {qrPreview ? 'Thay QR mới' : 'Tải lên QR'}
                </label>
                <p className="ms-media-hint">Ảnh QR chuyển khoản · Tối đa 3MB</p>
              </div>
            </div>

            {/* ── Text fields ── */}
            <div className="ms-fields-row">
              <div className="ms-form-field" style={{ gridColumn: '1 / -1' }}>
                <label className="ms-form-label">Họ và tên *</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="ms-input"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="ms-form-field">
                <label className="ms-form-label">Email *</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="ms-input ms-input-readonly"
                  readOnly
                  title="Email không thể thay đổi"
                />
              </div>
              <div className="ms-form-field">
                <label className="ms-form-label">Số điện thoại *</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="ms-input"
                  placeholder="0901234567"
                  required
                />
              </div>
            </div>

            <div className="ms-pw-actions">
              <button
                type="button"
                className="ms-btn-cancel"
                onClick={() => {
                  setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
                  setAvatarPreview(null);
                  setAvatarBase64(null);
                  setQrPreview(user?.imageQR || null);
                  setQrBase64(null);
                  setProfileError('');
                  if (avatarInputRef.current) avatarInputRef.current.value = '';
                  if (qrInputRef.current) qrInputRef.current.value = '';
                }}
              >
                Hủy thay đổi
              </button>
              <button type="submit" className="ms-btn-submit" disabled={profileLoading}>
                {profileLoading ? (
                  <><span className="ms-spinner" /> Đang lưu...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>save</span> Lưu thông tin</>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ── Change Password Card ── */}
        <section className="ms-card">
          <div className="ms-card-header">
            <span className="material-symbols-outlined ms-card-icon">lock</span>
            <h2 className="ms-card-title">Đổi mật khẩu</h2>
          </div>
          <p className="ms-card-desc">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
          </p>

          {pwSuccess && (
            <div className="ms-success-banner">
              <span className="material-symbols-outlined">check_circle</span>
              Mật khẩu đã được cập nhật thành công!
            </div>
          )}
          {pwError && (
            <div className="ms-error-banner">
              <span className="material-symbols-outlined">error</span>
              {pwError}
            </div>
          )}

          <form onSubmit={handlePwSubmit} className="ms-pw-form">
            <PasswordInput
              label="Mật khẩu hiện tại"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              placeholder="Nhập mật khẩu hiện tại"
            />
            <PasswordInput
              label="Mật khẩu mới"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              placeholder="Ít nhất 8 ký tự"
            />
            <PasswordInput
              label="Xác nhận mật khẩu mới"
              name="confirmNewPassword"
              value={pwForm.confirmNewPassword}
              onChange={handlePwChange}
              placeholder="Nhập lại mật khẩu mới"
            />
            <div className="ms-pw-actions">
              <button
                type="button"
                className="ms-btn-cancel"
                onClick={() => {
                  setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                  setPwError('');
                  setPwSuccess(false);
                }}
              >
                Hủy
              </button>
              <button type="submit" className="ms-btn-submit" disabled={pwLoading}>
                {pwLoading ? (
                  <><span className="ms-spinner" /> Đang xử lý...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>save</span> Cập nhật mật khẩu</>
                )}
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
};

export default ManagerSettingsPage;
import React, { useRef, useState } from 'react';
import { User, UserPreferences } from '../../types';
import {
  User as UserIcon, Bell, Shield, LogOut, HelpCircle, ChevronRight,
  Camera, Smartphone, Globe, Mail, MessageSquare, Eye, EyeOff, Check, Trash2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/swal';
import { useLanguage } from '../../lib/i18n';

const Settings: React.FC<{ user: User; section?: 'profile' | 'security' | 'language' }> = ({ user, section = 'profile' }) => {
  const { logout, setUser } = useAuthStore();
  const { lang, setLang, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeTab = section;
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone_number || '');

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  // Notification prefs state
  const [prefs, setPrefs] = useState<UserPreferences>({
    push: user.preferences?.push ?? true,
    email: user.preferences?.email ?? true,
    sms: user.preferences?.sms ?? true,
  });

  const tabs = [
    { id: 'profile', name: t('profile'), icon: <UserIcon size={20} /> },
    { id: 'security', name: 'Password Reset', icon: <Shield size={20} /> },
    { id: 'language', name: t('language'), icon: <Globe size={20} /> },
  ];

  const handleSaveProfile = async () => {
    if (!fullName.trim()) { showToast('Full name is required', 'error'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email', 'error'); return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), email: email.trim(), phone_number: phone.trim() })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      showToast(error.message || 'Failed to save profile', 'error');
    } else {
      showToast('Profile updated successfully', 'success');
      setUser({ ...user, full_name: fullName.trim(), email: email.trim(), phone_number: phone.trim() });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPwd(false);
    if (error) {
      showToast(error.message || 'Failed to change password', 'error');
    } else {
      showToast('Password changed successfully', 'success');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSavePrefs = async (key: keyof UserPreferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    const mergedPreferences = { ...((user.preferences as any) || {}), ...updated };
    await supabase.from('profiles').update({ preferences: mergedPreferences }).eq('id', user.id);
    setUser({ ...user, preferences: mergedPreferences as any });
    showToast('Preference saved', 'success');
  };

  const isMissingAvatarColumnError = (error: any) => {
    const message = String(error?.message || '').toLowerCase();
    return message.includes("could not find the 'avatar_url' column") || message.includes('schema cache');
  };

  const persistAvatarUrl = async (avatarUrl: string | null) => {
    const updatedPreferences = { ...((user.preferences as any) || {}) };

    if (avatarUrl) {
      updatedPreferences.avatar_url = avatarUrl;
    } else {
      delete updatedPreferences.avatar_url;
    }

    const { error: directError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl as any })
      .eq('id', user.id);

    if (directError && !isMissingAvatarColumnError(directError)) {
      throw directError;
    }

    if (!directError) {
      setUser({ ...user, avatar_url: avatarUrl || undefined, preferences: updatedPreferences as any });
      return;
    }

    const { error: prefError } = await supabase
      .from('profiles')
      .update({ preferences: updatedPreferences })
      .eq('id', user.id);

    if (prefError) throw prefError;
    setUser({ ...user, avatar_url: avatarUrl || undefined, preferences: updatedPreferences as any });
  };

  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read selected image'));
      reader.readAsDataURL(file);
    });

  const handleAvatarPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      event.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    try {
      const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${user.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });

      let avatarUrl = '';

      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = data.publicUrl;
      } else {
        avatarUrl = await readAsDataUrl(file);
      }

      await persistAvatarUrl(avatarUrl);

      showToast('Profile image updated successfully', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Failed to update profile image', 'error');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    const hasAvatar = !!(user.avatar_url || (user.preferences as any)?.avatar_url);
    if (!hasAvatar || uploadingAvatar) return;

    setUploadingAvatar(true);
    try {
      await persistAvatarUrl(null);
      showToast('Profile image removed', 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      showToast(error?.message || 'Failed to remove profile image', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const inputClass =
    'w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all';

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">
          {activeTab === 'profile' ? t('edit_profile') : activeTab === 'security' ? t('password_reset') : t('select_language')}
        </h1>
        <p className="text-slate-500 font-bold text-[9px] md:text-[10px] tracking-widest mt-1">
          {activeTab === 'profile' ? t('update_info') : activeTab === 'security' ? t('change_password') : t('choose_language')}
        </p>
      </div>

      <div className="space-y-4 md:space-y-8" key={activeTab}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl md:rounded-[3rem] p-4 md:p-10 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 mb-6 md:mb-12 pb-6 md:pb-12 border-b border-slate-50">
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-xl">
                    {(user.avatar_url || (user.preferences as any)?.avatar_url) ? (
                      <img
                        src={user.avatar_url || (user.preferences as any)?.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={48} className="md:hidden" />
                    )}
                    {!(user.avatar_url || (user.preferences as any)?.avatar_url) && <UserIcon size={64} className="hidden md:block" />}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleAvatarPick}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 w-9 h-9 md:w-10 md:h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-60"
                  >
                    {uploadingAvatar ? <i className="fas fa-circle-notch fa-spin text-xs"></i> : <Camera size={16} />}
                  </button>
                  {(user.avatar_url || (user.preferences as any)?.avatar_url) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="absolute -top-2 -right-2 w-8 h-8 md:w-9 md:h-9 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-colors disabled:opacity-60"
                      title="Remove profile image"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight truncate">{user.full_name}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
                    {user.role} Account •{' '}
                    {user.created_at
                      ? `Since ${new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`
                      : 'Parent'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={inputClass}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Admission Number</label>
                  <input
                    type="text"
                    defaultValue={user.admission_number || user.admissionNumber || '—'}
                    className={`${inputClass} text-slate-400 cursor-not-allowed`}
                    disabled
                  />
                </div>
              </div>

              <div className="mt-6 md:mt-12 sticky md:static bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] md:bottom-auto -mx-4 md:mx-0 px-4 md:px-0 pt-3 pb-3 md:py-0 bg-white md:bg-transparent border-t md:border-0 border-slate-100 z-10 flex md:justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full md:w-auto bg-primary text-white px-6 md:px-10 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <i className="fas fa-circle-notch fa-spin"></i> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Password Reset Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-10 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Password Reset</h3>
              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClass} ${
                        confirmPassword && confirmPassword !== newPassword ? 'border-red-300 focus:ring-red-100' : ''
                      }`}
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-4">Passwords do not match</p>
                  )}
                </div>
                <div className="sticky md:static bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] md:bottom-auto -mx-5 md:mx-0 px-5 md:px-0 pt-3 pb-3 md:py-0 bg-white md:bg-transparent border-t md:border-0 border-slate-100 z-10">
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPwd || !newPassword || newPassword !== confirmPassword}
                    className="w-full md:w-auto bg-primary text-white px-6 md:px-10 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {changingPwd ? <i className="fas fa-circle-notch fa-spin"></i> : <Shield size={16} />}
                    {changingPwd ? 'Changing...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="bg-white rounded-2xl md:rounded-[3rem] p-5 md:p-10 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                {[
                  { code: 'en', flag: '🇬🇧', name: 'English', sub: 'Default', available: true },
                  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी', sub: 'Hindi', available: true },
                  { code: 'es', flag: '🇪🇸', name: 'Español', sub: 'Spanish', available: false },
                  { code: 'fr', flag: '🇫🇷', name: 'Français', sub: 'French', available: false },
                  { code: 'ar', flag: '🇸🇦', name: 'العربية', sub: 'Arabic', available: false },
                  { code: 'pt', flag: '🇧🇷', name: 'Português', sub: 'Portuguese', available: false },
                  { code: 'zh', flag: '🇨🇳', name: '中文', sub: 'Chinese', available: false },
                  { code: 'ja', flag: '🇯🇵', name: '日本語', sub: 'Japanese', available: false },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => l.available && setLang(l.code as any)}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 active:scale-95 ${
                      lang === l.code
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                        : l.available
                        ? 'border-slate-100 hover:border-primary/30 hover:-translate-y-0.5'
                        : 'border-slate-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <div className="text-left flex-1">
                      <p className="font-black text-sm text-slate-800">{l.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                        {l.available ? l.sub : `${l.sub} — Coming soon`}
                      </p>
                    </div>
                    {lang === l.code && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>

    </div>
  );
};

export default Settings;

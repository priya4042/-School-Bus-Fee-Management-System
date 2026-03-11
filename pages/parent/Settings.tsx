import React, { useRef, useState } from 'react';
import { User, UserPreferences } from '../../types';
import {
  User as UserIcon, Bell, Shield, LogOut, HelpCircle, ChevronRight,
  Camera, Smartphone, Globe, Mail, MessageSquare, Eye, EyeOff, Check, Trash2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/swal';

const Settings: React.FC<{ user: User }> = ({ user }) => {
  const { logout, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
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
    { id: 'profile', name: 'Profile', icon: <UserIcon size={20} /> },
    { id: 'notifications', name: 'Alerts', icon: <Bell size={20} /> },
    { id: 'security', name: 'Security', icon: <Shield size={20} /> },
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Preferences</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Manage Account & System Settings
          </p>
        </div>
        <button
          onClick={logout}
          className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar nav */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Navigation</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Support Hub</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                    <HelpCircle size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Help Center</span>
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
              </button>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Language</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">English</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-8 mb-12 pb-12 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-xl">
                    {(user.avatar_url || (user.preferences as any)?.avatar_url) ? (
                      <img
                        src={user.avatar_url || (user.preferences as any)?.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={64} />
                    )}
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
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
                  >
                    {uploadingAvatar ? <i className="fas fa-circle-notch fa-spin"></i> : <Camera size={18} />}
                  </button>
                  {(user.avatar_url || (user.preferences as any)?.avatar_url) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="absolute -top-2 -right-2 w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                      title="Remove profile image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{user.full_name}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                    {user.role} Account •{' '}
                    {user.created_at
                      ? `Since ${new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`
                      : 'Parent'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              <div className="mt-12 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-800 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {saving ? <i className="fas fa-circle-notch fa-spin"></i> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">Alert Preferences</h3>
              <div className="space-y-6">
                {[
                  { key: 'push' as keyof UserPreferences, title: 'Push Notifications', desc: 'Receive real-time alerts on your mobile device', icon: <Smartphone /> },
                  { key: 'email' as keyof UserPreferences, title: 'Email Summaries', desc: 'Weekly reports of student activity and fees', icon: <Mail /> },
                  { key: 'sms' as keyof UserPreferences, title: 'SMS Alerts', desc: 'Critical alerts for bus delays and emergencies', icon: <MessageSquare /> },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSavePrefs(item.key, !prefs[item.key])}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                        prefs[item.key] ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                          prefs[item.key] ? 'right-1' : 'left-1'
                        }`}
                      ></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-10">Change Password</h3>
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
                <button
                  onClick={handleChangePassword}
                  disabled={changingPwd || !newPassword || newPassword !== confirmPassword}
                  className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-800 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {changingPwd ? <i className="fas fa-circle-notch fa-spin"></i> : <Shield size={16} />}
                  {changingPwd ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

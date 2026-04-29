
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../lib/swal';
import api from '../lib/api';
import { ENV } from '../config/env';

const sanitizeMetaValue = (value: string) => String(value || '').replace(/[\[\]]/g, '').trim();

const Profile: React.FC<{ user: User }> = ({ user }) => {
  const { setUser } = useAuthStore();
  const [preferences, setPreferences] = useState({
    sms: true,
    email: true,
    push: true
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    phoneNumber: '',
    secondaryPhoneNumber: '',
    fleetSecurityToken: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setPreferences(user.preferences || { sms: true, email: true, push: true });
      setProfileData({
        fullName: user.fullName || user.full_name || '',
        phoneNumber: user.phoneNumber || '',
        secondaryPhoneNumber: user.secondaryPhoneNumber || '',
        fleetSecurityToken: user.fleetSecurityToken || '',
        location: user.location || 'Sector 45, Green Valley Apartments, Wing B, Flat 402, Gurugram, Haryana'
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const currentName = (user.fullName || user.full_name || '').trim();
      const requestedName = (profileData.fullName || '').trim();
      const nameChanged = requestedName.length > 0 && requestedName !== currentName;

      const profileUpdatePayload: Record<string, any> = {
        phone_number: profileData.phoneNumber,
        secondary_phone_number: profileData.secondaryPhoneNumber,
        fleet_security_token: profileData.fleetSecurityToken,
        location: profileData.location,
      };

      if (user.role !== UserRole.PARENT && nameChanged) {
        profileUpdatePayload.full_name = requestedName;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdatePayload)
        .eq('id', user.id);

      if (error) throw error;

      if (user.role === UserRole.PARENT && nameChanged) {
        const { data: admins, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['ADMIN', 'SUPER_ADMIN']);

        if (adminError) throw adminError;

        const adminNotifs = (admins || []).map((admin: any) => ({
          user_id: admin.id,
          title: 'Parent Name Change Request',
          message: `[PROFILE_UPDATE_REQUEST][PARENT_ID:${sanitizeMetaValue(String(user.id))}][CURRENT_NAME:${sanitizeMetaValue(currentName || 'N/A')}][REQUESTED_NAME:${sanitizeMetaValue(requestedName)}][PARENT_EMAIL:${sanitizeMetaValue(user.email || '')}]`,
          type: 'PROFILE_UPDATE_REQUEST',
          is_read: false,
        }));

        if (adminNotifs.length > 0) {
          const { error: notifError } = await supabase.from('notifications').insert(adminNotifs);
          if (notifError) throw notifError;
        }
      }

      setUser({
        ...user,
        full_name: user.role === UserRole.PARENT && nameChanged ? currentName : (requestedName || currentName),
        fullName: user.role === UserRole.PARENT && nameChanged ? currentName : (requestedName || currentName),
        phoneNumber: profileData.phoneNumber,
        phone_number: profileData.phoneNumber,
        secondaryPhoneNumber: profileData.secondaryPhoneNumber,
        fleetSecurityToken: profileData.fleetSecurityToken,
        fleet_security_token: profileData.fleetSecurityToken,
        location: profileData.location
      });

      if (user.role === UserRole.PARENT && nameChanged) {
        setMessage('Profile updated. Name change request sent to admin for approval.');
      } else {
        setMessage('Profile updated successfully');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const togglePref = async (key: keyof typeof preferences) => {
    if (!user) return;
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: newPrefs })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, preferences: newPrefs });
      setMessage('Preferences updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setPreferences(preferences);
      setMessage('Failed to update preferences');
    } finally {
      setUpdating(false);
    }
  };

  const getInitial = () => {
    const name = user?.fullName || user?.full_name || 'User';
    return name.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    return user?.fullName || user?.full_name || 'User';
  };

  const getIdentityBadge = () => {
    if (user?.role === UserRole.PARENT) {
      return {
        label: 'PARENT ID',
        value: String(user.id || '').slice(0, 8).toUpperCase()
      };
    }

    const admissionId = user?.admissionNumber || user?.admission_number;
    if (!admissionId) return null;

    return {
      label: 'ID',
      value: admissionId
    };
  };

  const identityBadge = getIdentityBadge();

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you absolutely sure? This action is permanent and will delete all your data from our systems.');
    if (!confirmed) return;

    setUpdating(true);
    try {
      // Use serverless function for account deletion
      await api.delete('/users/delete', { data: { userId: user.id, action: 'delete-user' } });
      showToast('Account deleted successfully', 'success');
      await useAuthStore.getState().logout();
      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to delete account', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 pb-6 md:pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">My Profile</h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-0.5">Manage account & contact details</p>
        </div>
        <button
          onClick={handleDeleteAccount}
          disabled={updating}
          className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl border border-red-100 disabled:opacity-50 self-start sm:self-auto active:scale-95 transition-all"
        >
          Delete Account
        </button>
      </div>

      {message && (
        <div className="p-3 md:p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <i className="fas fa-check-circle"></i>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-4 md:p-8 flex items-center gap-3 md:gap-6 border-b border-slate-100">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl font-bold shadow-lg shadow-primary/20 rotate-3 flex-shrink-0">
                {getInitial()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-xl font-black text-slate-800 truncate">{getFullName()}</h3>
                <p className="text-slate-500 text-[11px] md:text-sm truncate">{user.email}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase rounded-full">
                    {user.role}
                  </span>
                  {identityBadge && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-black uppercase rounded-full truncate max-w-[160px]">
                      {identityBadge.label}: {identityBadge.value}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Secondary Contact</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={profileData.secondaryPhoneNumber}
                    onChange={(e) => setProfileData({...profileData, secondaryPhoneNumber: e.target.value})}
                    placeholder="Emergency alternative"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Residential Address</label>
                  <textarea
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 md:pt-6 border-t border-slate-100">
                <button
                  onClick={handleSaveProfile}
                  disabled={updating}
                  className="w-full md:w-auto md:ml-auto md:flex bg-primary text-white font-black uppercase tracking-widest text-[10px] py-3.5 md:py-3 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <><i className="fas fa-circle-notch fa-spin"></i> Saving</>
                  ) : (
                    <>Save Information</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="font-black text-sm md:text-base text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
                <i className="fas fa-bell text-primary"></i>
                Notification Preferences
             </h4>

             <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-3">
                   <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold text-slate-700">SMS Alerts</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-medium truncate">Fee due & overdue SMS</p>
                   </div>
                   <button
                     disabled={updating}
                     onClick={() => togglePref('sms')}
                     className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${preferences.sms ? 'bg-success' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                   >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.sms ? 'translate-x-6' : ''}`}></div>
                   </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-3">
                   <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold text-slate-700">Email Notifications</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-medium truncate">Receipts & detailed reports</p>
                   </div>
                   <button
                     disabled={updating}
                     onClick={() => togglePref('email')}
                     className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${preferences.email ? 'bg-success' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                   >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.email ? 'translate-x-6' : ''}`}></div>
                   </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl gap-3">
                   <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold text-slate-700">Push Notifications</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-medium truncate">Instant FCM mobile alerts</p>
                   </div>
                   <button
                     disabled={updating}
                     onClick={() => togglePref('push')}
                     className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${preferences.push ? 'bg-success' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                   >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.push ? 'translate-x-6' : ''}`}></div>
                   </button>
                </div>
             </div>

             <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-2 md:gap-3">
                   <i className="fas fa-info-circle text-primary mt-0.5 flex-shrink-0"></i>
                   <p className="text-[10px] md:text-xs text-primary leading-relaxed font-medium">
                      Critical alerts like emergency broadcasts and overdue notices cannot be completely disabled.
                   </p>
                </div>
             </div>
          </div>

          <div className="bg-slate-800 p-4 md:p-6 rounded-2xl text-white">
             <h4 className="font-black text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
                <i className="fas fa-shield-alt text-success"></i>
                Security
             </h4>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95">
                <i className="fas fa-key text-[10px]"></i>
                Change Password
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

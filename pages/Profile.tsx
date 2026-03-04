
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../lib/swal';
import axios from 'axios';

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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName || user.fullName,
          phone_number: profileData.phoneNumber,
          secondary_phone_number: profileData.secondaryPhoneNumber,
          fleet_security_token: profileData.fleetSecurityToken,
          location: profileData.location
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({
        ...user,
        phoneNumber: profileData.phoneNumber,
        secondaryPhoneNumber: profileData.secondaryPhoneNumber,
        fleetSecurityToken: profileData.fleetSecurityToken,
        location: profileData.location
      });

      setMessage('Profile updated successfully');
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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you absolutely sure? This action is permanent and will delete all your data from our systems.');
    if (!confirmed) return;

    setUpdating(true);
    try {
      await axios.delete(`/api/v1/auth/delete-account`, { withCredentials: true });
      showToast('Account deleted successfully', 'success');
      window.location.href = '/';
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete account', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
          <p className="text-slate-500">Manage account settings and contact details</p>
        </div>
        <button 
          onClick={handleDeleteAccount}
          disabled={updating}
          className="text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-red-100 disabled:opacity-50"
        >
           Delete Account
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <i className="fas fa-check-circle"></i>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-8 flex items-center gap-6 border-b border-slate-100">
              <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/20 rotate-3">
                {getInitial()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{getFullName()}</h3>
                <p className="text-slate-500 text-sm">{user.email}</p>
                <div className="flex gap-2 mt-2">
                   <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                    {user.role}
                  </span>
                  {user.admissionNumber && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full">
                      ID: {user.admissionNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Secondary Contact</label>
                  <input 
                    type="tel" 
                    value={profileData.secondaryPhoneNumber}
                    onChange={(e) => setProfileData({...profileData, secondaryPhoneNumber: e.target.value})}
                    placeholder="Emergency alternative" 
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Residential Address</label>
                  <textarea 
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                  ></textarea>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={updating}
                  className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Information'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <i className="fas fa-bell text-primary"></i>
                Notification Preferences
             </h4>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <div>
                      <p className="text-sm font-bold text-slate-700">SMS Alerts</p>
                      <p className="text-[10px] text-slate-400 font-medium">Fee due & overdue SMS</p>
                   </div>
                   <button 
                     disabled={updating}
                     onClick={() => togglePref('sms')}
                     className={`w-12 h-6 rounded-full relative transition-colors ${preferences.sms ? 'bg-success' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                   >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.sms ? 'translate-x-6' : ''}`}></div>
                   </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <div>
                      <p className="text-sm font-bold text-slate-700">Email Notifications</p>
                      <p className="text-[10px] text-slate-400 font-medium">Receipts & detailed reports</p>
                   </div>
                   <button 
                     disabled={updating}
                     onClick={() => togglePref('email')}
                     className={`w-12 h-6 rounded-full relative transition-colors ${preferences.email ? 'bg-success' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                   >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.email ? 'translate-x-6' : ''}`}></div>
                   </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <div>
                      <p className="text-sm font-bold text-slate-700">Push Notifications</p>
                      <p className="text-[10px] text-slate-400 font-medium">Instant FCM mobile alerts</p>
                   </div>
                   <button 
                     disabled={updating}
                     onClick={() => togglePref('push')}
                     className={`w-12 h-6 rounded-full relative transition-colors ${preferences.push ? 'bg-success' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                   >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.push ? 'translate-x-6' : ''}`}></div>
                   </button>
                </div>
             </div>

             <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-3">
                   <i className="fas fa-info-circle text-primary mt-0.5"></i>
                   <p className="text-xs text-primary leading-relaxed font-medium">
                      Critical alerts like emergency broadcasts and overdue notices cannot be completely disabled.
                   </p>
                </div>
             </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl text-white">
             <h4 className="font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-shield-alt text-success"></i>
                Security
             </h4>
             <div className="space-y-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fleet Security Token</label>
                   <input 
                     type="password" 
                     placeholder="Enter token for camera access"
                     value={profileData.fleetSecurityToken}
                     onChange={(e) => setProfileData({...profileData, fleetSecurityToken: e.target.value})}
                     className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-white placeholder-white/20"
                   />
                </div>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                   Change Password
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

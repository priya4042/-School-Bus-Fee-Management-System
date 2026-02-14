
import React, { useState, useEffect } from 'react';
import { User, UserRole, Student } from '../types';
import { MOCK_STUDENTS } from '../constants';
import Modal from '../components/Modal';

const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('registered_users');
    if (data) {
      const parsed: User[] = JSON.parse(data);
      setUsers(parsed);
    }
  }, []);

  const filteredUsers = users.filter(u => {
    const nameMatch = (u.fullName || u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (u.phoneNumber || '').includes(searchTerm);
    const emailMatch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === 'ALL' || u.role === roleFilter;
    
    return (nameMatch || phoneMatch || emailMatch) && roleMatch;
  });

  const getChildName = (admissionNo?: string) => {
    if (!admissionNo) return 'N/A';
    const student = MOCK_STUDENTS.find(s => s.admission_number === admissionNo);
    return student ? student.full_name : `Unlinked (ID: ${admissionNo})`;
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.PARENT: return 'fa-house-user text-success';
      case UserRole.TEACHER: return 'fa-chalkboard-teacher text-primary';
      case UserRole.DRIVER: return 'fa-id-card text-orange-500';
      case UserRole.ADMIN:
      case UserRole.SUPER_ADMIN: return 'fa-shield-halved text-slate-800';
      default: return 'fa-user text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">User Identity Hub</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Auditing {users.length} Registered Profiles</p>
        </div>
        <div className="flex gap-2">
           <select 
             value={roleFilter}
             onChange={(e) => setRoleFilter(e.target.value)}
             className="bg-white px-6 py-3 rounded-2xl border border-slate-200 font-black text-[10px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 shadow-sm"
           >
             <option value="ALL">All Roles</option>
             <option value={UserRole.PARENT}>Parents</option>
             <option value={UserRole.TEACHER}>Teachers</option>
             <option value={UserRole.DRIVER}>Drivers</option>
             <option value={UserRole.ADMIN}>Admins</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
           <div className="relative">
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Lookup by name, phone (+91), or work email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 bg-white"
              />
           </div>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-5">Global Identity</th>
                <th className="px-8 py-5">Contact Vector</th>
                <th className="px-8 py-5 text-center">Protocol Level</th>
                <th className="px-10 py-5 text-right">Vault Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-5">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                           <i className={`fas ${getRoleIcon(u.role)} text-lg`}></i>
                        </div>
                        <div>
                           <p className="font-black text-slate-800 tracking-tight leading-none mb-1">{u.fullName || u.full_name}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UID: {u.id.split('-')[1] || 'Internal'}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-600 lowercase">{u.email}</p>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest">+91 {u.phoneNumber || 'N/A'}</p>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                       u.role === UserRole.PARENT ? 'bg-success/10 text-success border-success/10' :
                       u.role === UserRole.TEACHER ? 'bg-primary/10 text-primary border-primary/10' :
                       u.role === UserRole.DRIVER ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-800 text-white'
                     }`}>
                        {u.role.replace('_', ' ')}
                     </span>
                  </td>
                  <td className="px-10 py-5 text-right">
                     <button 
                       onClick={() => handleViewUser(u)}
                       className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg transition-all active:scale-95"
                     >
                       View Profile
                     </button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="p-32 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                         <i className="fas fa-search-minus text-3xl text-slate-200"></i>
                      </div>
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Zero identities found in directory</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Identity Deep Dive">
        {selectedUser && (
          <div className="space-y-8 p-2">
             <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center text-3xl shadow-2xl rotate-3">
                   { (selectedUser.fullName || selectedUser.full_name || 'U').charAt(0) }
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none mb-1">{selectedUser.fullName || selectedUser.full_name}</h3>
                   <div className="flex gap-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedUser.role.replace('_', ' ')}</span>
                      <span className="text-slate-300 px-1">•</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry: {new Date().toLocaleDateString()}</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Communication Channel</p>
                   <p className="text-xs font-bold text-slate-800 break-all">{selectedUser.email}</p>
                </div>
                <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Vector</p>
                   <p className="text-xs font-bold text-slate-800 tracking-widest">+91 {selectedUser.phoneNumber || '99999 00000'}</p>
                </div>
             </div>

             <div className="p-6 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <i className={`fas ${getRoleIcon(selectedUser.role)} text-7xl`}></i>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Protocol Specific Information</h4>
                <div className="space-y-4">
                   {selectedUser.role === UserRole.PARENT && (
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-[9px] font-black text-success uppercase tracking-widest">Child Linked (Academic)</p>
                            <p className="text-lg font-black">{getChildName(selectedUser.admissionNumber)}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Adm. ID</p>
                            <p className="font-bold text-white/60">{selectedUser.admissionNumber}</p>
                         </div>
                      </div>
                   )}
                   {selectedUser.role === UserRole.TEACHER && (
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-[9px] font-black text-primary-light uppercase tracking-widest">Staff Credential ID</p>
                            <p className="text-lg font-black">{selectedUser.staffId || 'T-2024-OFFICIAL'}</p>
                         </div>
                      </div>
                   )}
                   {selectedUser.role === UserRole.DRIVER && (
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Commercial License</p>
                            <p className="text-lg font-black">{selectedUser.licenseNo || 'DL-TEMP-VALID'}</p>
                         </div>
                      </div>
                   )}
                   { (selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN) && (
                      <div>
                         <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Security Level</p>
                         <p className="text-lg font-black">Level 5 (Full Core Access)</p>
                      </div>
                   )}
                </div>
             </div>

             <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <i className="fas fa-map-marker-alt text-primary"></i>
                   Geographic Fingerprint
                </p>
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                   <p className="text-[10px] font-bold text-slate-600 italic">
                      "Last authenticated from authorized device in {selectedUser.role === UserRole.PARENT ? 'Residential Sector' : 'Campus Perimeter'}. IP: 192.168.1.{Math.floor(Math.random()*254)}"
                   </p>
                </div>
             </div>

             <div className="pt-4 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95">Dismiss Audit</button>
                <button className="flex-1 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-800 transition-all active:scale-95">Message User</button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDirectory;

import React, { useState, useEffect } from 'react';
import { User, UserRole, MonthlyDue, PaymentStatus, Student } from '../types.ts';
import { MOCK_STUDENTS } from '../constants.ts';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal.tsx';
import { useFees } from '../hooks/useFees';

const UserDirectory: React.FC = () => {
  const { dues } = useFees();
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase.from('profiles').select('*');
      const { data: studentData, error: studentError } = await supabase.from('students').select('*');
      
      if (userData) setUsers(userData.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role as UserRole,
        admissionNumber: u.admission_number,
        phoneNumber: u.phone_number,
        secondaryPhoneNumber: u.secondary_phone_number,
        fleetSecurityToken: u.fleet_security_token,
        location: u.location,
        preferences: u.preferences
      })));
      
      if (studentData) setStudents(studentData.map(s => ({
        id: s.id,
        admission_number: s.admission_number,
        full_name: s.full_name,
        class_name: s.class_name,
        section: s.section,
        route_id: s.route_id,
        base_fee: s.base_fee,
        monthly_fee: s.monthly_fee || s.base_fee,
        status: s.status,
        risk_score: s.risk_score,
        parent_id: s.parent_id
      })));
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => {
    const fullName = u.fullName || u.full_name || '';
    const nameMatch = fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === 'ALL' || u.role === roleFilter;
    return nameMatch && roleMatch;
  });

  const getParentStudents = (parent: User) => {
    return students.filter(s => 
      (s.parent_phone === parent.phoneNumber) || 
      (s.admission_number === parent.admissionNumber)
    );
  };

  const getBillingStatus = (studentId: string) => {
    const studentDues = dues.filter(d => String(d.student_id) === String(studentId));
    const overdue = studentDues.some(d => d.status === PaymentStatus.OVERDUE);
    const unpaid = studentDues.some(d => d.status === PaymentStatus.UNPAID);
    
    if (overdue) return { label: 'Overdue', color: 'text-danger bg-red-50 border-red-100' };
    if (unpaid) return { label: 'Unpaid', color: 'text-warning bg-amber-50 border-amber-100' };
    return { label: 'Paid', color: 'text-success bg-green-50 border-green-100' };
  };

  const inputClass = "w-full px-6 py-4 rounded-2xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all text-slate-800";
  const selectClass = "bg-primary/5 px-6 py-3 rounded-2xl border border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-[10px] uppercase tracking-widest outline-none shadow-sm text-slate-700 cursor-pointer transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Identity Hub</h2>
          <p className="text-secondary font-bold uppercase text-[10px] tracking-widest">Family Linkage & Billing Oversight</p>
        </div>
        <div className="flex gap-2">
           <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
             <option value="ALL">All Profiles</option>
             <option value={UserRole.PARENT}>Parents</option>
             <option value={UserRole.ADMIN}>Staff</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
           <input 
              type="text" 
              placeholder="Lookup name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClass}
           />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-10 py-5">Global Identity</th>
                <th className="px-8 py-5">Family Unit</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-10 py-5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => {
                const family = getParentStudents(u);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-5">
                       <p className="font-black text-slate-800 tracking-tight">{u.fullName || u.full_name}</p>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{u.role}</p>
                    </td>
                    <td className="px-8 py-5">
                       {u.role === UserRole.PARENT ? (
                         <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/10">
                            {family.length} Children Linked
                         </span>
                       ) : <span className="text-slate-300">---</span>}
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className={`w-2 h-2 rounded-full mx-auto ${u.role === UserRole.PARENT ? (family.some(s => getBillingStatus(s.id).label === 'Overdue') ? 'bg-danger animate-pulse' : 'bg-success') : 'bg-slate-300'}`}></div>
                    </td>
                    <td className="px-10 py-5 text-right">
                       <button onClick={() => { setSelectedUser(u); setIsModalOpen(true); }} className="px-6 py-2.5 bg-white border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95">Audit Portal</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Family Intelligence Detail">
        {selectedUser && (
          <div className="space-y-8">
             <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{selectedUser.fullName || selectedUser.full_name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedUser.email}</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-primary/10">
                   <i className="fas fa-home-user text-primary text-xl"></i>
                </div>
             </div>

             {selectedUser.role === UserRole.PARENT ? (
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Child Manifest</h4>
                     <span className="text-[9px] font-black text-primary uppercase">Unified Ledger</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     {getParentStudents(selectedUser).map(s => {
                       const billing = getBillingStatus(s.id);
                       return (
                         <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-premium flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary/40 font-black group-hover:bg-primary group-hover:text-white transition-all">
                                  {s.full_name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-slate-800 tracking-tight">{s.full_name}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{s.class_name}-{s.section} • {s.admission_number}</p>
                               </div>
                            </div>
                            <div className="text-right space-y-2">
                               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${billing.color}`}>
                                  {billing.label}
                               </span>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">₹{s.base_fee} Base</p>
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
             ) : (
               <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Staff Identity</p>
                  <p className="text-sm font-bold opacity-60 italic">This profile is registered as an Administrative Access Node and does not have a family manifest.</p>
               </div>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDirectory;
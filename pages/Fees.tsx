import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { showToast, showLoading, closeSwal, showAlert, showConfirm } from '../lib/swal';
import { MONTHS } from '../constants';

const Fees: React.FC = () => {
  const [dues, setDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('dues');
      setDues(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  const generateDues = async () => {
    const confirmed = await showConfirm('Generate Dues?', 'This will generate monthly dues for all active students for the current month.', 'Generate');
    if (confirmed) {
      showLoading('Generating Dues...');
      try {
        await api.post('dues/generate');
        showToast('Dues generated successfully', 'success');
        fetchDues();
      } catch (err: any) {
        showAlert('Error', err.message || 'Failed to generate dues', 'error');
      } finally {
        closeSwal();
      }
    }
  };

  const filteredDues = dues.filter(d => 
    d.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.students?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fee Management</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Monitor collections and generate monthly dues</p>
        </div>
        <button 
          onClick={generateDues}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-primary/20"
        >
          <i className="fas fa-magic"></i>
          Generate Monthly Dues
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-premium">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search by student name or admission number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-2xl border border-primary/20 bg-primary/5 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        <div className="responsive-table-container">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80">
              <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
            </div>
          ) : (
            <table className="w-full text-left responsive-table">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Student</th>
                  <th className="px-8 py-5">Month/Year</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDues.map((due) => (
                  <tr key={due.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 tracking-tight text-sm">{due.students?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Adm: {due.students?.admission_number}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-600 uppercase">{MONTHS[due.month-1]} {due.year}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-800">₹{due.amount + (due.late_fine || 0)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        due.status === 'PAID' ? 'bg-success/10 text-success border-success/10' : 'bg-danger/10 text-danger border-danger/10'
                      }`}>
                        {due.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-500">{due.paid_at ? new Date(due.paid_at).toLocaleDateString() : '---'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fees;

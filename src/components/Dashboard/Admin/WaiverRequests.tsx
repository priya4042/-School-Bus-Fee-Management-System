import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WaiverRequest {
  id: string;
  payment_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  payments: {
    amount: number;
    fine_amount: number;
    billing_month: string;
    students: {
      full_name: string;
      admission_number: string;
    };
  };
  parents: {
    profiles: {
      full_name: string;
      phone_number: string;
    };
  };
}

export default function WaiverRequests({ isDarkMode }: { isDarkMode: boolean }) {
  const [requests, setRequests] = useState<WaiverRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/waiver-requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/waiver-requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        toast.success(`Request ${action}d successfully`);
        fetchRequests();
      } else {
        toast.error(`Failed to ${action} request`);
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Fee Waiver Requests</h2>
          <p className="text-zinc-500 text-sm">Manage requests for late fee waivers</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl font-bold text-xs uppercase tracking-wider">
          <AlertCircle size={16} />
          {requests.filter(r => r.status === 'pending').length} Pending
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Student / Parent</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Fee Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Reason</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-indigo-500 mb-2" size={32} />
                    <p className="text-zinc-500">Loading requests...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No waiver requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{request.payments?.students?.full_name}</p>
                        <p className="text-xs text-zinc-500">{request.payments?.students?.admission_number}</p>
                        <p className="text-xs text-indigo-500 mt-1">{request.parents?.profiles?.full_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-bold text-zinc-900 dark:text-white">{request.payments?.billing_month}</p>
                        <p className="text-zinc-500">Fee: ₹{request.payments?.amount}</p>
                        <p className="text-red-500 font-bold">Fine: ₹{request.payments?.fine_amount}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 italic">"{request.reason}"</p>
                        <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        request.status === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' :
                        'bg-amber-100 text-amber-600 dark:bg-amber-900/20'
                      }`}>
                        {request.status === 'approved' ? <CheckCircle2 size={12} /> : 
                         request.status === 'rejected' ? <XCircle size={12} /> : 
                         <Clock size={12} />}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {request.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(request.id, 'approve')}
                            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 rounded-xl transition-all"
                            title="Approve Waiver"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button 
                            onClick={() => handleAction(request.id, 'reject')}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl transition-all"
                            title="Reject Request"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

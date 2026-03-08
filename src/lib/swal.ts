
import Swal from 'sweetalert2';

export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    background: '#fff',
    color: '#1e293b',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-slate-100',
    }
  });

  Toast.fire({
    icon: type,
    title: message,
  });
};

export const showConfirm = async (title: string, text: string) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#f1f5f9',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    background: '#fff',
    color: '#1e293b',
    customClass: {
      popup: 'rounded-[3rem] p-10 shadow-2xl border border-slate-100',
      title: 'text-2xl font-black uppercase tracking-tight text-slate-900',
      htmlContainer: 'text-sm font-bold text-slate-500 uppercase tracking-widest',
      confirmButton: 'px-10 py-4 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95',
      cancelButton: 'px-10 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95',
    }
  });

  return result.isConfirmed;
};

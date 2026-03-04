
declare const Swal: any;

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  Swal.fire({
    title,
    icon,
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#ffffff',
    customClass: {
      popup: 'rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md'
    }
  });
};

// Added missing showAlert function
export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Understood',
    customClass: {
      popup: 'rounded-[2rem] p-10',
      confirmButton: 'bg-primary text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest'
    }
  });
};

export const showConfirm = async (title: string, text: string, confirmButtonText = 'Confirm Action') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Abort',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-[2rem] p-10',
      confirmButton: 'bg-primary text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest',
      cancelButton: 'bg-slate-100 text-slate-500 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest'
    }
  });
  return result.isConfirmed;
};

export const showLoading = (title: string = 'Establishing Connection...') => {
  Swal.fire({
    title,
    html: `
      <div class="flex flex-col items-center gap-4 py-8">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Cloud Sync In Progress</p>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: 'rounded-[3rem]'
    }
  });
};

export const closeSwal = () => Swal.close();

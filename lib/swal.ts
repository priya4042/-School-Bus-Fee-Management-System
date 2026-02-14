
declare const Swal: any;

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  Swal.fire({
    title,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showConfirm = async (title: string, text: string, confirmButtonText = 'Yes, Proceed') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });
  return result.isConfirmed;
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Understood'
  });
};

export const showLoading = (title: string = 'Processing...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeSwal = () => {
  Swal.close();
};

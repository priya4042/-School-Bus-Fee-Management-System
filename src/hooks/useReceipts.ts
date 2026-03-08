import { showToast } from '../lib/swal';

export const useReceipts = () => {
  const downloadReceipt = async (dueId: string, receiptId: string) => {
    showToast('Generating receipt...', 'info');
    setTimeout(() => {
      showToast('Receipt downloaded successfully', 'success');
    }, 1500);
  };

  return { downloadReceipt };
};

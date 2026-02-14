
import { useState } from 'react';
import api from '../lib/api';
import { showAlert } from '../lib/swal';

export const useReceipts = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReceipt = async (paymentId: string | number, txnId: string) => {
    setDownloading(String(paymentId));
    try {
      const response = await api.get(`/receipts/${paymentId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${txnId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      showAlert('Vault Error', 'We could not generate the PDF receipt at this moment. Please try again later.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return { downloadReceipt, downloading };
};

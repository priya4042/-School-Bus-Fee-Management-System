
import { useState } from 'react';
import api from '../lib/api';

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
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not download receipt. Please try again later.');
    } finally {
      setDownloading(null);
    }
  };

  return { downloadReceipt, downloading };
};

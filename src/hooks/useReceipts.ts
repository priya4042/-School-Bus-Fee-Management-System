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
      
      // Ensure we have data before proceeding
      if (!response.data) {
        throw new Error('No receipt data received from vault.');
      }

      // Ensure data is wrapped in a Blob properly for URL construction
      const blob = response.data instanceof Blob 
        ? response.data 
        : new Blob([response.data], { type: 'application/pdf' });

      // Check if Blob is valid size
      if (blob.size === 0) {
        throw new Error('Generated receipt file is empty.');
      }

      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${txnId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup to prevent memory leaks and handle link lifecycle
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err: any) {
      console.error('Download failed:', err);
      const errorMsg = err?.message || 'We could not generate the PDF receipt at this moment. Please try again later.';
      showAlert('Vault Error', errorMsg, 'error');
    } finally {
      setDownloading(null);
    }
  };

  return { downloadReceipt, downloading };
};
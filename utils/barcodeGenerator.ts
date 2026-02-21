import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

/**
 * Generate barcode image (Base64)
 */
export const generateBarcodeImage = (value: string): string => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true
  });
  return canvas.toDataURL("image/png");
};

/**
 * Generate QR code image (Base64)
 */
export const generateQRCodeImage = async (value: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(value);
  } catch (err) {
    console.error(err);
    return '';
  }
};

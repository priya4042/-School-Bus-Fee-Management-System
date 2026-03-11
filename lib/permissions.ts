import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { showToast } from './swal';

export const requestLocationPermission = async () => {
  try {
    const status = await Geolocation.requestPermissions();
    if (status.location === 'granted') {
      return true;
    } else {
      showToast('Location permission is required for real-time tracking.', 'warning');
      return false;
    }
  } catch (err) {
    console.error('Permission error:', err);
    return false;
  }
};

export const requestCameraPermission = async () => {
  try {
    const status = await Camera.requestPermissions();
    if (status.camera === 'granted') {
      return true;
    } else {
      showToast('Camera permission is required for live interior viewing.', 'warning');
      return false;
    }
  } catch (err) {
    console.error('Permission error:', err);
    return false;
  }
};

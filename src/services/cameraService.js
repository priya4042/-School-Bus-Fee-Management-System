import axios from 'axios';
import { ENV } from '../config/env';

export const cameraService = {
  /**
   * Get the camera stream configuration and URL for a specific bus
   * @param {string} busId - The ID of the bus
   * @returns {Promise<Object>} The camera streaming configuration
   */
  getCameraStream: async (busId) => {
    try {
      // Use the backend API to fetch camera configuration
      const response = await axios.get(`${ENV.API_BASE_URL}/api/bus-cameras/${busId}`);
      const cameras = response.data;

      if (cameras && cameras.length > 0) {
        const camera = cameras[0];
        return {
          success: true,
          streamUrl: camera.stream_url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          rtsp_url: camera.rtsp_url,
          username: camera.username,
          password: camera.password,
          port: camera.port || 554,
          status: 'live'
        };
      }

      // Fallback if no camera found in DB
      console.warn(`No camera found for bus ${busId}. Using fallback simulated stream.`);
      return { 
        success: true, 
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        rtsp_url: `rtsp://mock-camera.local:554/stream/${busId}`,
        username: 'admin',
        password: 'password123',
        port: 554,
        status: 'simulated'
      };
    } catch (error) {
      console.error(`Failed to get camera stream for bus ${busId}:`, error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
};

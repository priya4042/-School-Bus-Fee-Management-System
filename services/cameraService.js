import axios from 'axios';
import { ENV } from '../config/env';

export const cameraService = {
  /**
   * Get the camera stream configuration and URL for a specific bus
   * @param {string} busId - The ID of the bus
   * @returns {Promise<Object>} The camera streaming configuration
   */
  getCameraStream: async (busId) => {
    if (!ENV.CAMERA_STREAM_BASE_URL) {
      console.warn('CAMERA_STREAM_BASE_URL is missing in env.js. Using fallback simulated stream.');
      return { 
        success: true, 
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        rtsp_url: `rtsp://mock-camera.local:554/stream/${busId}`,
        username: 'admin',
        password: 'password123',
        port: 554,
        status: 'simulated'
      };
    }

    try {
      // In a real application, you would fetch the specific camera credentials 
      // and stream URL for the requested bus from your backend.
      // This ensures credentials aren't exposed directly to all clients.
      
      // const response = await axios.get(`/api/v1/buses/${busId}/camera`, { withCredentials: true });
      // return { success: true, ...response.data };

      console.log(`Fetching camera stream configuration for bus ${busId}`);
      
      // Constructing the stream URL based on the environment base URL
      const streamUrl = `${ENV.CAMERA_STREAM_BASE_URL}/stream/${busId}.m3u8`;
      const rtspUrl = `rtsp://${ENV.CAMERA_STREAM_BASE_URL.replace(/^https?:\/\//, '')}:554/stream/${busId}`;

      return { 
        success: true, 
        streamUrl: streamUrl,
        rtsp_url: rtspUrl,
        username: 'admin', // Ideally fetched from backend per bus
        password: 'password123', // Ideally fetched from backend per bus
        port: 554,
        status: 'live'
      };
    } catch (error) {
      console.error(`Failed to get camera stream for bus ${busId}:`, error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
};

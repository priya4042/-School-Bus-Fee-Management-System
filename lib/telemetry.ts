import { supabase } from './supabase';

// Custom Event Names
export const TELEMETRY_EVENT = 'busway_gps_update';
export const ARRIVAL_EVENT = 'busway_arrival_notice';
export const PAYMENT_EVENT = 'busway_payment_success';

export const PaymentTelemetry = {
  notifyPayment: async (studentName: string, amount: number, txnId: string, userId?: string) => {
    const data = { studentName, amount, txnId, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(PAYMENT_EVENT, { detail: data }));
    
    // Log into Supabase notifications
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Fee Payment Received',
        message: `Payment of ₹${Number(amount || 0).toLocaleString()} received for ${studentName}. Transaction ID: ${txnId}`,
        type: 'SUCCESS'
      });
    }
  }
};

export const BusTelemetry = {
  broadcastLocation: async (busId: string, lat: number, lng: number, speed: number) => {
    const data = { busId, lat, lng, speed, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail: data }));
    
    // Persist for page refreshes locally
    localStorage.setItem(`live_pos_${busId}`, JSON.stringify(data));

    // Production: Update Supabase bus_locations table
    try {
      const { error } = await supabase
        .from('bus_locations')
        .upsert({ 
          bus_id: busId, 
          latitude: lat, 
          longitude: lng, 
          speed, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'bus_id' });
      
      if (error) console.error('Supabase Telemetry Error:', error);
    } catch (err) {
      console.error('Telemetry Sync Failed:', err);
    }
  },
  notifyArrival: async (busId: string, busPlate: string, adminId?: string) => {
    const data = { busId, busPlate, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(ARRIVAL_EVENT, { detail: data }));
    
    // Log into Supabase notifications
    if (adminId) {
      await supabase.from('notifications').insert({
        user_id: adminId,
        title: 'Bus Arrived',
        message: `Bus ${busPlate} has successfully reached the school campus.`,
        type: 'SUCCESS'
      });
    }
  }
};

import express from 'express';
import { supabase } from '../services/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Update GPS location (Called by GPS device or Admin)
router.post('/update', authenticate, authorize(['admin']), async (req: any, res) => {
  const { busId, latitude, longitude, speed } = req.body;

  if (!busId || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { error } = await supabase.from('bus_locations').insert({
      bus_id: busId,
      latitude,
      longitude,
      speed,
      timestamp: new Date().toISOString()
    });

    if (error) throw error;

    res.json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update GPS' });
  }
});

// Get latest location for a bus
router.get('/latest/:busId', authenticate, async (req, res) => {
  const { busId } = req.params;

  try {
    const { data, error } = await supabase
      .from('bus_locations')
      .select('*')
      .eq('bus_id', busId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

export default router;

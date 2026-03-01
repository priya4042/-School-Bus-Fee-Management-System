import express from 'express';
import { supabase } from '../services/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// --- Get Detailed Student Data ---
router.get('/student-details', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const parentId = (req as any).user.id;

    // Fetch student linked to this parent
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        *,
        buses (
          id,
          bus_number,
          model
        ),
        routes (
          id,
          route_name,
          start_point,
          end_point
        )
      `)
      .eq('parent_id', parentId)
      .is('deleted_at', null)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
});

// --- Live Bus Tracking ---
router.get('/bus-location/:busId', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const { busId } = req.params;
    
    // Security check: Ensure this parent's child is assigned to this bus
    const { data: student } = await supabase
      .from('students')
      .select('bus_id')
      .eq('parent_id', (req as any).user.id)
      .eq('bus_id', busId)
      .single();

    if (!student) {
      return res.status(403).json({ error: 'Access denied to this bus tracking' });
    }

    const { data: location, error } = await supabase
      .from('bus_locations')
      .select('*')
      .eq('bus_id', busId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bus location' });
  }
});

// --- Camera Monitoring ---
router.get('/camera-config/:busId', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const { busId } = req.params;

    // Security check
    const { data: student } = await supabase
      .from('students')
      .select('bus_id')
      .eq('parent_id', (req as any).user.id)
      .eq('bus_id', busId)
      .single();

    if (!student) {
      return res.status(403).json({ error: 'Access denied to this camera' });
    }

    const { data: camera, error } = await supabase
      .from('camera_configs')
      .select('*')
      .eq('bus_id', busId)
      .eq('is_active', true)
      .single();

    if (error) return res.status(404).json({ error: 'Camera not found' });
    res.json(camera);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch camera config' });
  }
});

// --- Boarding Point Change Request ---
router.post('/boarding-point/request', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const { studentId, requestedPoint, currentPoint } = req.body;
    const parentId = (req as any).user.id;

    const { data, error } = await supabase
      .from('boarding_requests')
      .insert({
        student_id: studentId,
        parent_id: parentId,
        requested_boarding_point: requestedPoint,
        current_boarding_point: currentPoint,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Fee Waiver Request ---
router.post('/fee/waiver-request', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const parentId = (req as any).user.id;

    const { data, error } = await supabase
      .from('waiver_requests')
      .insert({
        payment_id: paymentId,
        parent_id: parentId,
        reason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Support Ticket (Chat) ---
router.post('/support/ticket', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const { subject, message } = req.body;
    const parentId = (req as any).user.id;

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        parent_id: parentId,
        subject,
        message,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/support/tickets', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('parent_id', (req as any).user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Notifications ---
router.get('/notifications', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', (req as any).user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Payment History ---
router.get('/payments', authenticate, authorize(['parent']), async (req, res) => {
  try {
    const parentId = (req as any).user.id;

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, students(full_name, admission_number)')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

export default router;

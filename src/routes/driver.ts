import express from 'express';
import { supabase } from '../services/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendWhatsAppMessage } from '../services/notification.js';

const router = express.Router();

// Get Driver's assigned bus and students
router.get('/assigned-bus', authenticate, authorize(['driver']), async (req: any, res) => {
  try {
    const { data: bus, error: busError } = await supabase
      .from('buses')
      .select('*, routes(*)')
      .eq('driver_id', req.user.id)
      .single();

    if (busError || !bus) {
      return res.status(404).json({ error: 'No bus assigned to this driver' });
    }

    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('bus_id', bus.id);

    if (studentError) throw studentError;

    res.json({ bus, students });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assigned bus details' });
  }
});

// Mark Attendance (Pickup/Drop)
router.post('/attendance', authenticate, authorize(['driver']), async (req: any, res) => {
  const { studentId, type, status } = req.body; // type: 'pickup' | 'drop', status: 'present' | 'absent'

  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, profiles(phone_number, full_name)')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Insert attendance record
    const { error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        student_id: studentId,
        driver_id: req.user.id,
        type,
        status,
        recorded_at: new Date().toISOString()
      });

    if (attendanceError) throw attendanceError;

    // Send notification to parent
    if (status === 'present' && student.profiles?.phone_number) {
      const action = type === 'pickup' ? 'boarded' : 'dropped from';
      const message = `Bus Alert: ${student.full_name} has ${action} the bus successfully.`;
      await sendWhatsAppMessage(student.profiles.phone_number, message);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Update Bus Location
router.post('/location', authenticate, authorize(['driver']), async (req: any, res) => {
  const { busId, latitude, longitude } = req.body;

  try {
    const { error } = await supabase
      .from('bus_locations')
      .upsert({
        bus_id: busId,
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      }, { onConflict: 'bus_id' });

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

export default router;

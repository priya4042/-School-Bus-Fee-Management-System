const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// Get attendance
router.get('/', async (req, res) => {
  const { date, type } = req.query;
  try {
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*, students(full_name)')
      .eq('date', date)
      .eq('type', type);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance
router.post('/', async (req, res) => {
  try {
    const { student_id, type, status, marked_by, timestamp } = req.body;
    const date = timestamp.split('T')[0];
    
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .upsert({
        student_id,
        type,
        status,
        marked_by,
        date,
        timestamp
      }, { onConflict: 'student_id,date,type' })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// Get all students
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('students').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a student
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('students').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin.from('students').update(req.body).eq('id', id).select().single();
    if (error) throw error;

    // Send route assignment SMS if route_id changed
    if (req.body.route_id) {
      try {
        const { data: route } = await supabaseAdmin
          .from('routes')
          .select('route_name')
          .eq('id', req.body.route_id)
          .single();

        if (route) {
          const { data: parent } = await supabaseAdmin
            .from('profiles')
            .select('phone')
            .eq('id', data.parent_id)
            .single();

          if (parent?.phone) {
            const { sendSMS } = require('../utils/sms');
            await sendSMS(parent.phone, `Bus route assigned for ${data.full_name}: ${route.route_name}.`);
          }
        }
      } catch (smsErr) {
        console.error('Failed to send route assignment SMS:', smsErr);
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('students').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

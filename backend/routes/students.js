const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// Get all students with parent info
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('students')
      .select(`
        *,
        parent:profiles!students_parent_id_fkey(
          id,
          full_name,
          phone_number
        )
      `);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a student
router.post('/', async (req, res) => {
  try {
    const { admission_number } = req.body;

    // Check if parent already registered with same admission number
    const { data: parent } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('admission_number', admission_number)
      .eq('role', 'PARENT')
      .maybeSingle();

    const studentData = {
      ...req.body,
      parent_id: parent ? parent.id : null
    };

    const { data, error } = await supabaseAdmin
      .from('students')
      .insert(studentData)
      .select()
      .single();

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

    const { data, error } = await supabaseAdmin
      .from('students')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send route assignment SMS if route_id changed
    if (req.body.route_id) {
      try {
        const { data: route } = await supabaseAdmin
          .from('routes')
          .select('route_name')
          .eq('id', req.body.route_id)
          .single();

        if (route && data.parent_id) {
          const { data: parent } = await supabaseAdmin
            .from('profiles')
            .select('phone_number')
            .eq('id', data.parent_id)
            .single();

          if (parent?.phone_number) {
            const { sendSMS } = require('../utils/sms');

            await sendSMS(
              parent.phone_number,
              `Bus route assigned for ${data.full_name}: ${route.route_name}.`
            );
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

    const { error } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
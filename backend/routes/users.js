const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// Get all users (with optional role filter)
router.get('/', async (req, res) => {
  const { role_types } = req.query;
  try {
    let query = supabaseAdmin.from('profiles').select('*');
    
    if (role_types) {
      const roles = role_types.split(',');
      query = query.in('role', roles);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

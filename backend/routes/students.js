const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// =============================
// Get all students with parent info
// =============================
router.get('/', async (req, res) => {
  try {

    const { data, error } = await supabaseAdmin
      .from('students')
      .select(`
        *,
        profiles:parent_id (
          full_name,
          phone_number
        ),
        routes (
          route_name
        ),
        buses (
          plate
        )
      `);

    if (error) throw error;

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// Create Student
// =============================
router.post('/', async (req, res) => {

  try {

    const {
      full_name,
      admission_number,
      grade,
      section,
      route_id,
      bus_id,
      parent_name,
      parent_phone,
      boarding_point,
      monthly_fee
    } = req.body;

    // Check duplicate admission number
    const { data: existingStudent } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('admission_number', admission_number)
      .maybeSingle();

    if (existingStudent) {
      return res.status(400).json({
        error: 'Duplicate admission number not allowed'
      });
    }

    let parentId = null;

    if (parent_phone) {

      const parentEmail = `parent.${parent_phone}@school.com`;
      const defaultPassword = parent_phone.slice(-6);

      // Check if parent already exists
      const { data: existingParent } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('phone_number', parent_phone)
        .eq('role', 'PARENT')
        .maybeSingle();

      if (existingParent) {

        parentId = existingParent.id;

      } else {

        // Create Supabase Auth user
        const { data: authUser, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: parentEmail,
            password: defaultPassword,
            email_confirm: true,
            user_metadata: {
              full_name: parent_name,
              role: 'PARENT'
            }
          });

        if (authError) throw authError;

        parentId = authUser.user.id;

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: parentId,
            full_name: parent_name,
            email: parentEmail,
            phone_number: parent_phone,
            role: 'PARENT'
          });

        if (profileError) throw profileError;
      }
    }

    // Insert student
    const { data, error } = await supabaseAdmin
      .from('students')
      .insert({
        full_name,
        admission_number,
        grade,
        section,
        route_id,
        bus_id,
        boarding_point,
        monthly_fee,
        parent_id: parentId
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// Update Student
// =============================
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


    // Send SMS when route assigned
    if (req.body.route_id && data.parent_id) {

      try {

        const { data: route } = await supabaseAdmin
          .from('routes')
          .select('route_name')
          .eq('id', req.body.route_id)
          .single();

        const { data: parent } = await supabaseAdmin
          .from('profiles')
          .select('phone_number')
          .eq('id', data.parent_id)
          .single();

        if (parent?.phone_number && route?.route_name) {

          const { sendSMS } = require('../utils/sms');

          await sendSMS(
            parent.phone_number,
            `Bus route assigned for ${data.full_name}: ${route.route_name}.`
          );
        }

      } catch (smsErr) {

        console.error('SMS error:', smsErr);

      }
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// Delete Student
// =============================
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
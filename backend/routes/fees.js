const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// Get all dues
router.get('/dues', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('monthly_dues')
      .select('*, students(full_name, admission_number)');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get defaulters
router.get('/defaulters', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('monthly_dues')
      .select('*, students(full_name, admission_number)')
      .eq('status', 'PENDING')
      .lt('due_date', new Date().toISOString());
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a fee
router.post('/add', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('monthly_dues').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a fee
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin.from('monthly_dues').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a fee
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('monthly_dues').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate monthly bills
router.post('/generate-monthly', async (req, res) => {
  try {
    // Logic to generate bills for all active students
    const { data: students, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, monthly_fee')
      .eq('status', 'ACTIVE');
    
    if (studentError) throw studentError;

    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const dueDate = new Date();
    dueDate.setDate(10); // Due on 10th of current month

    const bills = students.map(student => ({
      student_id: student.id,
      amount: student.monthly_fee,
      month: month,
      due_date: dueDate.toISOString(),
      status: 'PENDING'
    }));

    const { error: insertError } = await supabaseAdmin.from('monthly_dues').insert(bills);
    if (insertError) throw insertError;

    res.json({ success: true, message: `Generated ${bills.length} bills for ${month}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Waive late fee
router.post('/waive/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('monthly_dues')
      .update({ late_fee: 0 })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as paid
router.post('/mark-paid/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('monthly_dues')
      .update({ status: 'PAID', paid_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notify
router.post('/notify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Logic to send notification (SMS/Email)
    const { data: due } = await supabaseAdmin
      .from('monthly_dues')
      .select('*, students(full_name, parent_id)')
      .eq('id', id)
      .single();

    if (due && due.students?.parent_id) {
      const { data: parent } = await supabaseAdmin
        .from('profiles')
        .select('phone')
        .eq('id', due.students.parent_id)
        .single();

      if (parent?.phone) {
        const { sendSMS } = require('../utils/sms');
        await sendSMS(parent.phone, `Reminder: Bus fee of ₹${due.amount} for ${due.students.full_name} is due for ${due.month}. Please pay by ${new Date(due.due_date).toLocaleDateString()}.`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

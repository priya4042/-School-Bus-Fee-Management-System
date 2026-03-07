const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');
const { sendSMS } = require('../utils/sms');

// Broadcast notification
router.post('/broadcast', async (req, res) => {
  const { message, type, target } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    let query = supabaseAdmin.from('profiles').select('phone, role');

    // Filter based on target
    if (target === 'parents') {
      query = query.eq('role', 'PARENT');
    } else if (target === 'drivers') {
      query = query.eq('role', 'DRIVER');
    } else if (target === 'staff') {
      query = query.eq('role', 'STAFF');
    } else if (target === 'all') {
      // No filter, get all with phone
      query = query.not('phone', 'is', null);
    } 
    // Note: 'route-a' logic would require joining students/routes tables, skipping for now or treating as 'all' with warning

    const { data: profiles, error } = await query;

    if (error) throw error;

    if (!profiles || profiles.length === 0) {
      return res.json({ success: true, recipients: 0, message: 'No recipients found' });
    }

    // Send SMS to all recipients
    // In a real app, this should be a background job or batched
    let sentCount = 0;
    const prefix = type === 'emergency' ? '🚨 URGENT: ' : '📢 ';
    const smsBody = `${prefix}${message}`;

    const promises = profiles
      .filter(p => p.phone && p.phone.length >= 10)
      .map(p => sendSMS(p.phone, smsBody).then(res => res ? sentCount++ : null));

    await Promise.all(promises);

    // Log the broadcast
    await supabaseAdmin.from('audit_logs').insert({
      action: 'BROADCAST_SENT',
      entity_type: 'NOTIFICATION',
      entity_id: 'BROADCAST',
      new_values: JSON.stringify({ message, type, target, recipients: sentCount })
    });

    res.json({ success: true, recipients: sentCount, message: 'Broadcast initiated' });

  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

import express from 'express';
import { supabase } from '../services/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendWhatsAppMessage } from '../services/notification.js';

const router = express.Router();

// --- Dashboard Stats ---
router.get('/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { count: studentsCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).is('deleted_at', null);
    const { count: activeStudentsCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null);
    const { count: busesCount } = await supabase.from('buses').select('*', { count: 'exact', head: true }).is('deleted_at', null);
    const { count: routesCount } = await supabase.from('routes').select('*', { count: 'exact', head: true }).is('deleted_at', null);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Revenue Stats
    const { data: payments } = await supabase.from('payments').select('amount, status, billing_month').eq('billing_month', currentMonth);
    const totalRevenue = payments?.filter(p => p.status === 'captured').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
    const pendingRevenue = payments?.filter(p => p.status === 'pending').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
    const overdueRevenue = payments?.filter(p => p.status === 'overdue').reduce((acc, p) => acc + Number(p.amount), 0) || 0;

    // Chart Data: Revenue (Last 6 Months)
    const { data: revenueHistory } = await supabase
      .from('payments')
      .select('amount, billing_month')
      .eq('status', 'captured')
      .order('billing_month', { ascending: true });
    
    const revenueMap = new Map();
    revenueHistory?.forEach(p => {
      const month = p.billing_month;
      revenueMap.set(month, (revenueMap.get(month) || 0) + Number(p.amount));
    });
    
    const revenueData = Array.from(revenueMap.entries()).slice(-6).map(([name, revenue]) => ({ name, revenue }));

    // Chart Data: Bus Occupancy
    const { data: buses } = await supabase
      .from('buses')
      .select('bus_number, students(count)')
      .is('deleted_at', null);
    
    const busOccupancyData = buses?.map(b => ({
      bus: b.bus_number,
      students: b.students?.[0]?.count || 0
    })) || [];

    // Chart Data: Payment Status Distribution
    const paymentStatusCounts = {
      Paid: payments?.filter(p => p.status === 'captured').length || 0,
      Pending: payments?.filter(p => p.status === 'pending').length || 0,
      Overdue: payments?.filter(p => p.status === 'overdue').length || 0
    };
    
    const totalPayments = Object.values(paymentStatusCounts).reduce((a, b) => a + b, 0);
    const paymentStatusData = [
      { name: 'Paid', value: totalPayments ? Math.round((paymentStatusCounts.Paid / totalPayments) * 100) : 0 },
      { name: 'Pending', value: totalPayments ? Math.round((paymentStatusCounts.Pending / totalPayments) * 100) : 0 },
      { name: 'Overdue', value: totalPayments ? Math.round((paymentStatusCounts.Overdue / totalPayments) * 100) : 0 }
    ];

    res.json({
      totalStudents: studentsCount || 0,
      activeStudents: activeStudentsCount || 0,
      totalBuses: busesCount || 0,
      totalRoutes: routesCount || 0,
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      revenueData,
      busOccupancyData,
      paymentStatusData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- Student Management ---
router.get('/students', authenticate, authorize(['admin']), async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, buses(bus_number), routes(route_name)')
    .is('deleted_at', null);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/students', authenticate, authorize(['admin']), async (req, res) => {
  const { admissionNumber, fullName, grade, section, busId, routeId, monthlyFee, parentPhone, parentEmail, parentName, boardingPoint } = req.body;
  
  try {
    // 1. Create Student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        admission_number: admissionNumber,
        full_name: fullName,
        grade,
        section,
        bus_id: busId,
        route_id: routeId,
        monthly_fee: monthlyFee,
        parent_phone: parentPhone,
        parent_email: parentEmail,
        parent_name: parentName,
        boarding_point: boardingPoint,
        status: 'active'
      })
      .select()
      .single();
    
    if (studentError) return res.status(500).json({ error: studentError.message });

    // 2. Create Parent Profile/User if email provided
    if (parentEmail) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: parentEmail,
        password: 'Password123!', // Default password
        email_confirm: true,
        user_metadata: {
          full_name: parentName,
          role: 'parent',
          admission_number: admissionNumber
        }
      });

      if (!authError && authData.user) {
        await supabase.from('students').update({ parent_id: authData.user.id }).eq('id', student.id);
      }
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/students/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { admissionNumber, fullName, grade, section, busId, routeId, monthlyFee, parentPhone, parentEmail, parentName, boardingPoint } = req.body;
  
  const updates = {
    admission_number: admissionNumber,
    full_name: fullName,
    grade,
    section,
    bus_id: busId || null,
    route_id: routeId || null,
    monthly_fee: monthlyFee,
    parent_phone: parentPhone,
    parent_email: parentEmail,
    parent_name: parentName,
    boarding_point: boardingPoint
  };

  const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/students/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('students').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Fee Management ---
router.post('/fees/generate', authenticate, authorize(['admin']), async (req, res) => {
  const { month, dueDate } = req.body; // Format: YYYY-MM
  
  try {
    const { data: students, error: studentError } = await supabase.from('students').select('*').is('deleted_at', null).eq('status', 'active');
    if (studentError) throw studentError;

    const feeRecords = students.map(s => ({
      student_id: s.id,
      parent_id: s.parent_id,
      amount: s.monthly_fee,
      total_amount: s.monthly_fee,
      billing_month: month,
      due_date: dueDate || `${month}-10`, // Default to 10th of the month
      status: 'pending'
    }));

    const { error: feeError } = await supabase.from('payments').insert(feeRecords);
    if (feeError) throw feeError;

    res.json({ success: true, count: feeRecords.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments/:id/mark-paid', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'captured',
        payment_method: 'cash',
        paid_at: new Date().toISOString(),
        receipt_id: `RCPT-${Date.now()}`
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Settings ---
router.get('/settings', authenticate, authorize(['admin']), async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/settings', authenticate, authorize(['admin']), async (req, res) => {
  const { key, value } = req.body;
  const { data, error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- Bus Management ---
router.get('/buses', authenticate, authorize(['admin']), async (req, res) => {
  const { data, error } = await supabase
    .from('buses')
    .select('*')
    .is('deleted_at', null);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/buses', authenticate, authorize(['admin']), async (req, res) => {
  const { busNumber, model, capacity, status } = req.body;
  const { data, error } = await supabase
    .from('buses')
    .insert({
      bus_number: busNumber,
      model,
      capacity,
      status
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/buses/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { busNumber, model, capacity, status } = req.body;
  const { data, error } = await supabase.from('buses').update({
    bus_number: busNumber,
    model,
    capacity,
    status
  }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/buses/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('buses').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Route Management ---
router.get('/routes', authenticate, authorize(['admin']), async (req, res) => {
  const { data, error } = await supabase
    .from('routes')
    .select('*, stops(*)');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/routes', authenticate, authorize(['admin']), async (req, res) => {
  const { routeName, startPoint, endPoint, stops } = req.body;
  
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .insert({ route_name: routeName, start_point: startPoint, end_point: endPoint })
    .select()
    .single();
  
  if (routeError) return res.status(500).json({ error: routeError.message });

  if (stops && stops.length > 0) {
    const stopsWithRoute = stops.map((s: any, idx: number) => ({
      ...s,
      route_id: route.id,
      sequence_order: idx
    }));
    await supabase.from('stops').insert(stopsWithRoute);
  }

  res.json(route);
});

router.put('/routes/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { routeName, startPoint, endPoint, stops } = req.body;
  
  const { data, error } = await supabase.from('routes').update({
    route_name: routeName,
    start_point: startPoint,
    end_point: endPoint
  }).eq('id', id).select().single();
  
  if (error) return res.status(500).json({ error: error.message });

  if (stops) {
    // Delete existing stops
    await supabase.from('stops').delete().eq('route_id', id);
    
    // Insert new stops
    if (stops.length > 0) {
      const stopsWithRoute = stops.map((s: any, idx: number) => ({
        ...s,
        route_id: id,
        sequence_order: idx
      }));
      await supabase.from('stops').insert(stopsWithRoute);
    }
  }

  res.json(data);
});

router.delete('/routes/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('routes').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Camera Monitoring ---
router.get('/cameras', authenticate, authorize(['admin']), async (req, res) => {
  const { data, error } = await supabase
    .from('camera_configs')
    .select('*, buses(bus_number)');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- Payment Management ---
router.get('/payments', authenticate, authorize(['admin']), async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*, students(full_name, admission_number)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/payments/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Waiver Requests ---
router.get('/waiver-requests', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('waiver_requests')
      .select('*, payments(*, students(full_name, admission_number)), parents(profiles(full_name, phone_number))')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/waiver-requests/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get the request
    const { data: request, error: reqError } = await supabase
      .from('waiver_requests')
      .select('*, payments(*)')
      .eq('id', id)
      .single();
    
    if (reqError || !request) return res.status(404).json({ error: 'Request not found' });

    // 2. Update Payment (Remove fine)
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        fine_amount: 0,
        total_amount: request.payments.amount // Reset total to base amount
      })
      .eq('id', request.payment_id);

    if (paymentError) throw paymentError;

    // 3. Update Request Status
    const { data, error } = await supabase
      .from('waiver_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/waiver-requests/:id/reject', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('waiver_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Send Fee Reminders ---
router.post('/notifications/send-reminders', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Find parents with pending payments for current month
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('*, parents(id, profiles(id, phone_number, full_name))')
      .eq('status', 'pending')
      .eq('billing_month', currentMonth);

    if (!pendingPayments || pendingPayments.length === 0) {
      return res.json({ message: 'No pending payments found for this month.' });
    }

    const notifications = [];
    
    for (const payment of pendingPayments) {
      if (payment.parents?.profiles?.id) {
        // Create Notification
        notifications.push({
          user_id: payment.parents.profiles.id,
          title: 'Fee Payment Reminder',
          message: `Dear Parent, the transport fee of ₹${payment.amount} for ${payment.billing_month} is pending. Please pay by the due date to avoid late fines.`,
          type: 'payment',
          is_read: false
        });

        // Send WhatsApp/SMS (Mocked or Real if configured)
        if (payment.parents.profiles.phone_number) {
          // await sendWhatsAppMessage(payment.parents.profiles.phone_number, `Reminder: Transport fee of ₹${payment.amount} is due.`);
        }
      }
    }

    if (notifications.length > 0) {
      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;
    }

    res.json({ success: true, count: notifications.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

export default router;

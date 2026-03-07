const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// Create a receipt
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('receipts').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download receipt (PDF generation would normally happen here)
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: receipt, error } = await supabaseAdmin.from('receipts').select('*').eq('id', id).single();
    if (error) throw error;

    // For now, return a mock PDF or just some text that can be treated as a blob
    // In a real app, use a library like PDFKit or puppeteer to generate the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt_${receipt.transaction_id}.pdf`);
    res.send('Mock PDF Content for Receipt ' + receipt.transaction_id);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

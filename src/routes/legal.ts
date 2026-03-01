import express from 'express';

const router = express.Router();

router.get('/privacy', (req, res) => {
  res.send(`
    <html>
      <head><title>Privacy Policy - BusWay Pro</title></head>
      <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1>Privacy Policy</h1>
        <p>Last updated: February 28, 2026</p>
        <p>At BusWay Pro, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
        
        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Location Data:</strong> We collect real-time GPS data from school buses to provide tracking services to parents.</li>
          <li><strong>Contact Information:</strong> We collect phone numbers and names for authentication and account management.</li>
          <li><strong>Student Data:</strong> We store student names and admission numbers to link them to their parents and assigned buses.</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <p>We use the collected data to provide real-time bus tracking, manage school transportation, and process fee payments via Stripe.</p>

        <h2>3. Data Security</h2>
        <p>All data is transmitted over encrypted HTTPS connections. We use industry-standard security measures to protect your information.</p>

        <h2>4. Account Deletion</h2>
        <p>Users can delete their accounts at any time via the app settings. Deleting an account will remove all associated personal data from our active databases.</p>
      </body>
    </html>
  `);
});

router.get('/terms', (req, res) => {
  res.send(`
    <html>
      <head><title>Terms & Conditions - BusWay Pro</title></head>
      <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1>Terms & Conditions</h1>
        <p>By using BusWay Pro, you agree to the following terms:</p>
        <ul>
          <li>The service is provided "as is" for school transportation management.</li>
          <li>Real-time tracking accuracy depends on GPS hardware and network conditions.</li>
          <li>Parents are responsible for maintaining the confidentiality of their login credentials.</li>
          <li>Payments are processed securely via Stripe and are subject to their terms of service.</li>
        </ul>
      </body>
    </html>
  `);
});

export default router;

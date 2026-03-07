const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/otp', require('./routes/otp'));

// Health check
app.get('/', (req, res) => {
  res.send('School Bus Fee Management System API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

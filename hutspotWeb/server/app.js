const express = require('express');
const cors = require('express-cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

// Database initialization
const { initializeDatabase } = require('./database/init');
initializeDatabase();

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const servicesRoutes = require('./routes/services');
const venuesRoutes = require('./routes/venues');
const paymentRoutes = require('./routes/payments');
const promoRoutes = require('./routes/promos');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`HutSpot EBMS Server running on http://localhost:${PORT}`);
});

module.exports = app;

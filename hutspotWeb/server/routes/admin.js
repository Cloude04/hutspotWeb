const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get All Bookings (Admin)
router.get('/bookings', (req, res) => {
  db.all(
    `SELECT b.*, u.name, u.email, u.phone FROM bookings b
     JOIN users u ON b.user_id = u.id
     ORDER BY b.created_at DESC`,
    [],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
      }

      res.json({ success: true, bookings: bookings || [] });
    }
  );
});

// Get Booking Details with Payment & Services (Admin)
router.get('/bookings/:booking_id', (req, res) => {
  const { booking_id } = req.params;

  db.get(
    `SELECT b.*, u.name, u.email, u.phone FROM bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.id = ?`,
    [booking_id],
    (err, booking) => {
      if (err || !booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Get services
      db.all(
        `SELECT bs.*, s.name FROM booking_services bs
         JOIN services s ON bs.service_id = s.id
         WHERE bs.booking_id = ?`,
        [booking_id],
        (err, services) => {
          // Get payment
          db.get(
            `SELECT * FROM payments WHERE booking_id = ?`,
            [booking_id],
            (err, payment) => {
              res.json({
                success: true,
                booking: {
                  ...booking,
                  services: services || [],
                  payment: payment || null
                }
              });
            }
          );
        }
      );
    }
  );
});

// Update Booking Status (Admin)
router.put('/bookings/:booking_id/status', (req, res) => {
  const { booking_id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  db.run(
    `UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, booking_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Status update failed' });
      }

      res.json({ success: true, message: 'Booking status updated' });
    }
  );
});

// Mark Date as Reserved
router.post('/reserve-date', (req, res) => {
  const { date, venue_id, booking_id, notes } = req.body;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date required' });
  }

  const reserveId = uuidv4();

  db.run(
    `INSERT INTO reserved_dates (id, date, venue_id, booking_id, status, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [reserveId, date, venue_id || null, booking_id || null, 'booked', notes || null],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Reserve failed' });
      }

      res.json({ success: true, message: 'Date reserved successfully' });
    }
  );
});

// Get Dashboard Stats
router.get('/dashboard/stats', (req, res) => {
  const stats = {};

  db.get(`SELECT COUNT(*) as total FROM bookings`, [], (err, bookings) => {
    if (!err) stats.total_bookings = bookings.total;

    db.get(`SELECT COUNT(*) as total FROM bookings WHERE status = 'confirmed'`, [], (err, confirmed) => {
      if (!err) stats.confirmed_bookings = confirmed.total;

      db.get(`SELECT SUM(amount) as total FROM payments WHERE status = 'paid'`, [], (err, revenue) => {
        if (!err) stats.total_revenue = revenue.total || 0;

        db.get(`SELECT COUNT(DISTINCT user_id) as total FROM bookings`, [], (err, users) => {
          if (!err) stats.total_users = users.total;

          res.json({ success: true, stats });
        });
      });
    });
  });
});

module.exports = router;

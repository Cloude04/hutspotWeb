const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Create Booking
router.post('/create', (req, res) => {
  const {
    user_id,
    event_type,
    event_date,
    event_time,
    venue_id,
    number_of_guests,
    special_request,
    services
  } = req.body;

  if (!user_id || !event_type || !event_date || !event_time) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const bookingId = uuidv4();

  db.run(
    `INSERT INTO bookings (id, user_id, event_type, event_date, event_time, venue_id, number_of_guests, special_request, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bookingId, user_id, event_type, event_date, event_time, venue_id || null, number_of_guests || null, special_request || null, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Booking creation failed' });
      }

      // Add services to booking if provided
      if (services && Array.isArray(services)) {
        services.forEach((service) => {
          const serviceId = uuidv4();
          db.run(
            `INSERT INTO booking_services (id, booking_id, service_id, quantity, price)
             VALUES (?, ?, ?, ?, ?)`,
            [serviceId, bookingId, service.service_id, service.quantity || 1, service.price]
          );
        });
      }

      res.json({
        success: true,
        message: 'Booking created successfully',
        booking_id: bookingId
      });
    }
  );
});

// Get User Bookings
router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;

  db.all(
    `SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC`,
    [user_id],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
      }

      res.json({ success: true, bookings: bookings || [] });
    }
  );
});

// Get Booking Details
router.get('/:booking_id', (req, res) => {
  const { booking_id } = req.params;

  db.get(`SELECT * FROM bookings WHERE id = ?`, [booking_id], (err, booking) => {
    if (err || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    db.all(
      `SELECT bs.*, s.name FROM booking_services bs
       JOIN services s ON bs.service_id = s.id
       WHERE bs.booking_id = ?`,
      [booking_id],
      (err, services) => {
        res.json({
          success: true,
          booking: { ...booking, services: services || [] }
        });
      }
    );
  });
});

// Update Booking
router.put('/:booking_id', (req, res) => {
  const { booking_id } = req.params;
  const { event_date, event_time, number_of_guests, special_request } = req.body;

  db.run(
    `UPDATE bookings SET event_date = ?, event_time = ?, number_of_guests = ?, special_request = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [event_date, event_time, number_of_guests, special_request, booking_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Update failed' });
      }

      res.json({ success: true, message: 'Booking updated successfully' });
    }
  );
});

// Cancel Booking
router.delete('/:booking_id', (req, res) => {
  const { booking_id } = req.params;

  db.run(
    `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [booking_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Cancellation failed' });
      }

      res.json({ success: true, message: 'Booking cancelled successfully' });
    }
  );
});

module.exports = router;

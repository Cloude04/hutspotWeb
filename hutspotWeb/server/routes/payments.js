const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Create Payment
router.post('/create', (req, res) => {
  const { booking_id, amount, payment_method, down_payment } = req.body;

  if (!booking_id || !amount) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const paymentId = uuidv4();
  const remaining = amount - (down_payment || 0);

  db.run(
    `INSERT INTO payments (id, booking_id, amount, down_payment, remaining_balance, payment_method, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [paymentId, booking_id, amount, down_payment || 0, remaining, payment_method || null, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Payment creation failed' });
      }

      res.json({
        success: true,
        message: 'Payment record created',
        payment_id: paymentId,
        down_payment: down_payment || 0,
        remaining_balance: remaining
      });
    }
  );
});

// Get Payment Details
router.get('/:payment_id', (req, res) => {
  const { payment_id } = req.params;

  db.get(
    `SELECT * FROM payments WHERE id = ?`,
    [payment_id],
    (err, payment) => {
      if (err || !payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      res.json({ success: true, payment });
    }
  );
});

// Get Booking Payment
router.get('/booking/:booking_id', (req, res) => {
  const { booking_id } = req.params;

  db.get(
    `SELECT * FROM payments WHERE booking_id = ?`,
    [booking_id],
    (err, payment) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch payment' });
      }

      res.json({ success: true, payment: payment || null });
    }
  );
});

// Update Payment Status & Upload Proof
router.put('/:payment_id', (req, res) => {
  const { payment_id } = req.params;
  const { status, proof_image_url } = req.body;

  db.run(
    `UPDATE payments SET status = ?, proof_image_url = ?, payment_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status || 'pending', proof_image_url || null, payment_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Update failed' });
      }

      res.json({ success: true, message: 'Payment updated successfully' });
    }
  );
});

module.exports = router;

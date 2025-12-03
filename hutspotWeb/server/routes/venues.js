const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get All Venues
router.get('/', (req, res) => {
  db.all(
    `SELECT * FROM venues WHERE is_active = 1 ORDER BY name`,
    [],
    (err, venues) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch venues' });
      }

      res.json({ success: true, venues: venues || [] });
    }
  );
});

// Get Venue Details
router.get('/:venue_id', (req, res) => {
  const { venue_id } = req.params;

  db.get(
    `SELECT * FROM venues WHERE id = ? AND is_active = 1`,
    [venue_id],
    (err, venue) => {
      if (err || !venue) {
        return res.status(404).json({ success: false, message: 'Venue not found' });
      }

      res.json({ success: true, venue });
    }
  );
});

// Get Available Dates for Venue
router.get('/availability/:venue_id', (req, res) => {
  const { venue_id } = req.params;

  db.all(
    `SELECT date, status FROM reserved_dates WHERE venue_id = ? ORDER BY date`,
    [venue_id],
    (err, reservedDates) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch availability' });
      }

      res.json({ success: true, reserved_dates: reservedDates || [] });
    }
  );
});

// Create Venue (Admin)
router.post('/create', (req, res) => {
  const { name, description, capacity, price_per_hour, price_per_day, amenities } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Venue name required' });
  }

  const venueId = uuidv4();

  db.run(
    `INSERT INTO venues (id, name, description, capacity, price_per_hour, price_per_day, amenities, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [venueId, name, description || null, capacity || null, price_per_hour || 0, price_per_day || 0, amenities || null],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Venue creation failed' });
      }

      res.json({
        success: true,
        message: 'Venue created successfully',
        venue_id: venueId
      });
    }
  );
});

// Update Venue (Admin)
router.put('/:venue_id', (req, res) => {
  const { venue_id } = req.params;
  const { name, description, capacity, price_per_hour, price_per_day, amenities, is_active } = req.body;

  db.run(
    `UPDATE venues SET name = ?, description = ?, capacity = ?, price_per_hour = ?, price_per_day = ?, amenities = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, capacity, price_per_hour, price_per_day, amenities, is_active !== undefined ? is_active : 1, venue_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Update failed' });
      }

      res.json({ success: true, message: 'Venue updated successfully' });
    }
  );
});

// Delete Venue (Admin)
router.delete('/:venue_id', (req, res) => {
  const { venue_id } = req.params;

  db.run(
    `UPDATE venues SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [venue_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Deletion failed' });
      }

      res.json({ success: true, message: 'Venue deleted successfully' });
    }
  );
});

module.exports = router;

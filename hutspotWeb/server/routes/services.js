const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get All Services
router.get('/', (req, res) => {
  db.all(
    `SELECT * FROM services WHERE is_active = 1 ORDER BY category, name`,
    [],
    (err, services) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch services' });
      }

      res.json({ success: true, services: services || [] });
    }
  );
});

// Create Service (Admin)
router.post('/create', (req, res) => {
  const { name, description, price, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Name and price required' });
  }

  const serviceId = uuidv4();

  db.run(
    `INSERT INTO services (id, name, description, price, category, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [serviceId, name, description || null, price, category || null],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Service creation failed' });
      }

      res.json({
        success: true,
        message: 'Service created successfully',
        service_id: serviceId
      });
    }
  );
});

// Update Service (Admin)
router.put('/:service_id', (req, res) => {
  const { service_id } = req.params;
  const { name, description, price, category, is_active } = req.body;

  db.run(
    `UPDATE services SET name = ?, description = ?, price = ?, category = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, price, category, is_active !== undefined ? is_active : 1, service_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Update failed' });
      }

      res.json({ success: true, message: 'Service updated successfully' });
    }
  );
});

// Delete Service (Admin)
router.delete('/:service_id', (req, res) => {
  const { service_id } = req.params;

  db.run(
    `UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [service_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Deletion failed' });
      }

      res.json({ success: true, message: 'Service deleted successfully' });
    }
  );
});

module.exports = router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Get All Active Promos
router.get('/', (req, res) => {
  db.all(
    `SELECT * FROM promos WHERE is_active = 1 AND (expiry_date IS NULL OR expiry_date > CURRENT_TIMESTAMP) ORDER BY created_at DESC`,
    [],
    (err, promos) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch promos' });
      }

      res.json({ success: true, promos: promos || [] });
    }
  );
});

// Validate Promo Code
router.post('/validate', (req, res) => {
  const { code, amount } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Promo code required' });
  }

  db.get(
    `SELECT * FROM promos WHERE code = ? AND is_active = 1 AND (expiry_date IS NULL OR expiry_date > CURRENT_TIMESTAMP)`,
    [code.toUpperCase()],
    (err, promo) => {
      if (err || !promo) {
        return res.status(404).json({ success: false, message: 'Invalid or expired promo code' });
      }

      // Check usage limit
      if (promo.max_uses && promo.current_uses >= promo.max_uses) {
        return res.status(400).json({ success: false, message: 'Promo code has reached max uses' });
      }

      // Check minimum amount
      if (promo.min_amount && amount < promo.min_amount) {
        return res.status(400).json({
          success: false,
          message: `Minimum amount required: ${promo.min_amount}`
        });
      }

      let discount = 0;
      if (promo.discount_type === 'percentage') {
        discount = (amount * promo.discount_value) / 100;
      } else if (promo.discount_type === 'fixed') {
        discount = promo.discount_value;
      }

      res.json({
        success: true,
        promo: {
          id: promo.id,
          code: promo.code,
          discount_type: promo.discount_type,
          discount_value: promo.discount_value,
          discount_amount: discount
        }
      });
    }
  );
});

// Create Promo (Admin)
router.post('/create', (req, res) => {
  const { code, description, discount_type, discount_value, min_amount, max_uses, expiry_date } = req.body;

  if (!code || !discount_type || !discount_value) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const promoId = uuidv4();

  db.run(
    `INSERT INTO promos (id, code, description, discount_type, discount_value, min_amount, max_uses, expiry_date, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [promoId, code.toUpperCase(), description || null, discount_type, discount_value, min_amount || 0, max_uses || null, expiry_date || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ success: false, message: 'Promo code already exists' });
        }
        return res.status(500).json({ success: false, message: 'Promo creation failed' });
      }

      res.json({
        success: true,
        message: 'Promo created successfully',
        promo_id: promoId
      });
    }
  );
});

// Update Promo (Admin)
router.put('/:promo_id', (req, res) => {
  const { promo_id } = req.params;
  const { description, discount_type, discount_value, min_amount, max_uses, expiry_date, is_active } = req.body;

  db.run(
    `UPDATE promos SET description = ?, discount_type = ?, discount_value = ?, min_amount = ?, max_uses = ?, expiry_date = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [description, discount_type, discount_value, min_amount, max_uses, expiry_date, is_active !== undefined ? is_active : 1, promo_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Update failed' });
      }

      res.json({ success: true, message: 'Promo updated successfully' });
    }
  );
});

module.exports = router;

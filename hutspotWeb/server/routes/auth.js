const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// User Registration
router.post('/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = uuidv4();

  db.run(
    `INSERT INTO users (id, name, email, password, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, name, email, hashedPassword, phone || null, address || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        return res.status(500).json({ success: false, message: 'Registration failed' });
      }

      res.json({
        success: true,
        message: 'User registered successfully',
        user: { id: userId, name, email }
      });
    }
  );
});

// User Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  });
});

// Admin Login
router.post('/admin-login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hutspot.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === adminEmail && password === adminPassword) {
    res.json({
      success: true,
      message: 'Admin login successful',
      token: 'admin_token_' + Date.now()
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
});

module.exports = router;

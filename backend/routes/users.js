const express = require('express');
const mysql = require('mysql2/promise');
const { authMiddleware } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
};

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const [users] = await connection.query(
      'SELECT id, firstName, lastName, email, role, state, phone, profilePicture FROM users WHERE id = ?',
      [req.params.id]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Get HR list
router.get('/list/hr', async (req, res) => {
  try {
    const connection = await getConnection();
    const [users] = await connection.query(
      'SELECT id, firstName, lastName, email, state FROM users WHERE role = "HR"'
    );

    await connection.end();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching HR list' });
  }
});

// Update user profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, state, profilePicture } = req.body;
    const connection = await getConnection();

    await connection.query(
      'UPDATE users SET firstName = ?, lastName = ?, phone = ?, state = ?, profilePicture = ? WHERE id = ?',
      [firstName, lastName, phone, state, profilePicture, req.params.id]
    );

    await connection.end();
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

module.exports = router;

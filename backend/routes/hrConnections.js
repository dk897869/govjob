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

// Send connection request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { hrId, requestMessage } = req.body;
    const userId = req.user.id;

    const connection = await getConnection();

    // Check if already requested
    const [existing] = await connection.query(
      'SELECT id FROM hrConnections WHERE userId = ? AND hrId = ?',
      [userId, hrId]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ success: false, message: 'Already requested' });
    }

    const [result] = await connection.query(
      `INSERT INTO hrConnections (userId, hrId, requestMessage, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [userId, hrId, requestMessage]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      message: 'Connection request sent',
      connectionId: result.insertId
    });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ success: false, message: 'Error sending request' });
  }
});

// Get pending requests (for HR)
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const connection = await getConnection();
    const [requests] = await connection.query(
      `SELECT hc.*, u.firstName, u.lastName, u.email FROM hrConnections hc
       JOIN users u ON hc.userId = u.id
       WHERE hc.hrId = ? AND hc.status = 'PENDING'
       ORDER BY hc.requestedAt DESC`,
      [req.user.id]
    );

    await connection.end();
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
});

// Accept/Reject connection
router.put('/:requestId/respond', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await getConnection();

    await connection.query(
      'UPDATE hrConnections SET status = ?, respondedAt = NOW() WHERE id = ?',
      [status, req.params.requestId]
    );

    await connection.end();

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error responding to request' });
  }
});

module.exports = router;

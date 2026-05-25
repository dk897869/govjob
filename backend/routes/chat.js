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

// Get conversation
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;

    const connection = await getConnection();
    const [messages] = await connection.query(
      `SELECT * FROM messages 
       WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
       ORDER BY createdAt ASC`,
      [senderId, receiverId, receiverId, senderId]
    );

    await connection.end();
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

// Send message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, message, fileUrl, fileName } = req.body;
    const senderId = req.user.id;

    const connection = await getConnection();
    const [result] = await connection.query(
      `INSERT INTO messages (senderId, receiverId, message, fileUrl, fileName)
       VALUES (?, ?, ?, ?, ?)`,
      [senderId, receiverId, message, fileUrl, fileName]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      message: 'Message sent',
      messageId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// Mark as read
router.put('/:messageId/read', authMiddleware, async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.query(
      'UPDATE messages SET isRead = true WHERE id = ?',
      [req.params.messageId]
    );

    await connection.end();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking message' });
  }
});

module.exports = router;

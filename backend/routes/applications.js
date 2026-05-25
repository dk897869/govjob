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

// Apply for a job
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { jobId, applicationFeeAmount } = req.body;
    const userId = req.user.id;

    const connection = await getConnection();

    // Check if already applied
    const [existing] = await connection.query(
      'SELECT id FROM applications WHERE jobId = ? AND userId = ?',
      [jobId, userId]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ success: false, message: 'Already applied for this job' });
    }

    const [result] = await connection.query(
      'INSERT INTO applications (jobId, userId, applicationFeeAmount, feeStatus) VALUES (?, ?, ?, "PENDING")',
      [jobId, userId, applicationFeeAmount]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      message: 'Application submitted',
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Error applying for job' });
  }
});

// Get user's applications
router.get('/user/applications', authMiddleware, async (req, res) => {
  try {
    const connection = await getConnection();
    const [applications] = await connection.query(
      `SELECT a.*, j.title, j.sector FROM applications a
       JOIN jobs j ON a.jobId = j.id
       WHERE a.userId = ? ORDER BY a.appliedAt DESC`,
      [req.user.id]
    );

    await connection.end();
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications' });
  }
});

// Update application status (HR/Admin)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await getConnection();

    await connection.query(
      'UPDATE applications SET applicationStatus = ? WHERE id = ?',
      [status, req.params.id]
    );

    await connection.end();
    res.json({ success: true, message: 'Application status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating application' });
  }
});

module.exports = router;

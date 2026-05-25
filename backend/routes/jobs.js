const express = require('express');
const mysql = require('mysql2/promise');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
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

// Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const { state, sector, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM jobs WHERE status = "OPEN"';
    const params = [];

    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }
    if (sector) {
      query += ' AND sector = ?';
      params.push(sector);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const connection = await getConnection();
    const [jobs] = await connection.query(query, params);
    const [[{ total }]] = await connection.query('SELECT COUNT(*) as total FROM jobs WHERE status = "OPEN"', []);
    
    await connection.end();

    res.json({
      success: true,
      jobs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching jobs' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const [jobs] = await connection.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    await connection.end();

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job: jobs[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching job' });
  }
});

// Create job (HR/Admin only)
router.post('/', authMiddleware, roleMiddleware('HR', 'ADMIN'), async (req, res) => {
  try {
    const {
      title, description, sector, jobCategory, state, city, salary,
      applicationFee, totalPositions, qualifications, eligibility,
      minAge, maxAge, examStartDate, examEndDate, applicationDeadline,
      minSkillMarks
    } = req.body;

    const connection = await getConnection();
    const [result] = await connection.query(
      `INSERT INTO jobs (
        title, description, sector, jobCategory, state, city, salary,
        applicationFee, totalPositions, qualifications, eligibility,
        minAge, maxAge, examStartDate, examEndDate, applicationDeadline,
        minSkillMarks, createdBy, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [
        title, description, sector, jobCategory, state, city, salary,
        applicationFee, totalPositions, qualifications, eligibility,
        minAge, maxAge, examStartDate, examEndDate, applicationDeadline,
        minSkillMarks, req.user.id
      ]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      jobId: result.insertId
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, message: 'Error creating job' });
  }
});

// Get states
router.get('/filters/states', async (req, res) => {
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];
  res.json({ success: true, states });
});

module.exports = router;

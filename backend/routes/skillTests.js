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

// Get test questions
router.get('/:testId/questions', authMiddleware, async (req, res) => {
  try {
    const connection = await getConnection();
    const [questions] = await connection.query(
      'SELECT id, question, optionA, optionB, optionC, optionD, marks FROM questions WHERE testId = ?',
      [req.params.testId]
    );

    const [test] = await connection.query('SELECT * FROM skillTests WHERE id = ?', [req.params.testId]);

    await connection.end();

    res.json({
      success: true,
      test: test[0],
      questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching questions' });
  }
});

// Submit test answers
router.post('/:testId/submit', authMiddleware, async (req, res) => {
  try {
    const { answers, duration, applicationId } = req.body;
    const userId = req.user.id;
    const testId = req.params.testId;

    const connection = await getConnection();

    // Create test attempt
    const [attempt] = await connection.query(
      `INSERT INTO testAttempts (testId, userId, applicationId, startTime, endTime, duration)
       VALUES (?, ?, ?, NOW(), NOW(), ?)`,
      [testId, userId, applicationId, duration]
    );

    let totalMarks = 0;
    let obtainedMarks = 0;
    let correctAnswers = 0;

    // Process answers
    for (const answer of answers) {
      const [question] = await connection.query(
        'SELECT correctAnswer, marks FROM questions WHERE id = ?',
        [answer.questionId]
      );

      const isCorrect = question[0].correctAnswer === answer.selectedAnswer;
      const marksObtained = isCorrect ? question[0].marks : 0;

      totalMarks += question[0].marks;
      obtainedMarks += marksObtained;
      if (isCorrect) correctAnswers++;

      await connection.query(
        `INSERT INTO answers (attemptId, questionId, selectedAnswer, isCorrect, marksObtained)
         VALUES (?, ?, ?, ?, ?)`,
        [attempt.insertId, answer.questionId, answer.selectedAnswer, isCorrect, marksObtained]
      );
    }

    const percentage = (obtainedMarks / totalMarks) * 100;
    const [test] = await connection.query('SELECT passingMarks FROM skillTests WHERE id = ?', [testId]);
    const passed = percentage >= test[0].passingMarks;

    await connection.query(
      'UPDATE testAttempts SET score = ?, totalMarks = ?, percentage = ?, passed = ? WHERE id = ?',
      [obtainedMarks, totalMarks, percentage, passed, attempt.insertId]
    );

    // Update application score
    if (applicationId) {
      await connection.query(
        'UPDATE applications SET skillTestScore = ? WHERE id = ?',
        [percentage, applicationId]
      );
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Test submitted successfully',
      result: {
        score: obtainedMarks,
        totalMarks,
        percentage,
        passed,
        correctAnswers
      }
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ success: false, message: 'Error submitting test' });
  }
});

// Get leaderboard
router.get('/:testId/leaderboard', async (req, res) => {
  try {
    const connection = await getConnection();
    const [leaderboard] = await connection.query(
      `SELECT u.id, u.firstName, u.lastName, ta.score, ta.percentage, ta.passed,
              RANK() OVER (ORDER BY ta.score DESC) as rank
       FROM testAttempts ta
       JOIN users u ON ta.userId = u.id
       WHERE ta.testId = ?
       ORDER BY ta.score DESC LIMIT 100`,
      [req.params.testId]
    );

    await connection.end();
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
});

module.exports = router;

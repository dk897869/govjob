const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();

    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Create Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        phone VARCHAR(20),
        role ENUM('STUDENT','TEACHER','HR','ADMIN') NOT NULL,
        state VARCHAR(100),
        city VARCHAR(100),
        profilePicture VARCHAR(255),
        isVerified BOOLEAN DEFAULT false,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Jobs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT NOT NULL,
        sector VARCHAR(100) NOT NULL,
        jobCategory VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        salary VARCHAR(100),
        applicationFee DECIMAL(10,2),
        totalPositions INT,
        qualifications VARCHAR(255),
        eligibility VARCHAR(255),
        minAge INT,
        maxAge INT,
        examStartDate DATETIME,
        examEndDate DATETIME,
        applicationDeadline DATETIME,
        resultDate DATETIME,
        minSkillMarks DECIMAL(5,2) DEFAULT 0,
        createdBy INT,
        status ENUM('OPEN','CLOSED','CANCELLED') DEFAULT 'OPEN',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )
    `);

    // Create Applications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        jobId INT NOT NULL,
        userId INT NOT NULL,
        applicationFeeAmount DECIMAL(10,2),
        feeStatus ENUM('PENDING','PAID','FAILED') DEFAULT 'PENDING',
        skillTestScore DECIMAL(5,2),
        applicationStatus ENUM('PENDING','SELECTED','REJECTED','WITHDRAWN') DEFAULT 'PENDING',
        appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_application (jobId, userId)
      )
    `);

    // Create Skill Tests table
    await db.query(`
      CREATE TABLE IF NOT EXISTS skillTests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        jobId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        totalQuestions INT DEFAULT 100,
        timeLimit INT DEFAULT 120,
        passingMarks DECIMAL(5,2) DEFAULT 40,
        totalMarks DECIMAL(5,2) DEFAULT 100,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // Create Questions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        testId INT NOT NULL,
        question LONGTEXT NOT NULL,
        optionA VARCHAR(255),
        optionB VARCHAR(255),
        optionC VARCHAR(255),
        optionD VARCHAR(255),
        correctAnswer CHAR(1),
        marks DECIMAL(3,1) DEFAULT 1,
        explanation VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (testId) REFERENCES skillTests(id) ON DELETE CASCADE
      )
    `);

    // Create Test Attempts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS testAttempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        testId INT NOT NULL,
        userId INT NOT NULL,
        applicationId INT,
        score DECIMAL(5,2),
        totalMarks DECIMAL(5,2),
        percentage DECIMAL(5,2),
        passed BOOLEAN,
        startTime DATETIME,
        endTime DATETIME,
        duration INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (testId) REFERENCES skillTests(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE SET NULL
      )
    `);

    // Create Answers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        attemptId INT NOT NULL,
        questionId INT NOT NULL,
        selectedAnswer CHAR(1),
        isCorrect BOOLEAN,
        marksObtained DECIMAL(3,1),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attemptId) REFERENCES testAttempts(id) ON DELETE CASCADE,
        FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);

    // Create HR Connections table
    await db.query(`
      CREATE TABLE IF NOT EXISTS hrConnections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        hrId INT NOT NULL,
        status ENUM('PENDING','ACCEPTED','REJECTED','BLOCKED') DEFAULT 'PENDING',
        requestMessage LONGTEXT,
        requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        respondedAt DATETIME,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hrId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_request (userId, hrId)
      )
    `);

    // Create Messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        senderId INT NOT NULL,
        receiverId INT NOT NULL,
        message LONGTEXT NOT NULL,
        fileUrl VARCHAR(255),
        fileName VARCHAR(255),
        isRead BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_conversation (senderId, receiverId)
      )
    `);

    // Create Leaderboard table
    await db.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        testId INT NOT NULL,
        score DECIMAL(5,2),
        rank INT,
        percentile DECIMAL(5,2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (testId) REFERENCES skillTests(id) ON DELETE CASCADE,
        UNIQUE KEY unique_leaderboard (userId, testId)
      )
    `);

    // Create Previous Papers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS previousPapers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        jobId INT NOT NULL,
        paperName VARCHAR(255),
        examYear INT,
        fileUrl VARCHAR(255),
        uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // Create Notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        type VARCHAR(50),
        title VARCHAR(255),
        message LONGTEXT,
        relatedId INT,
        isRead BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Results table
    await db.query(`
      CREATE TABLE IF NOT EXISTS results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        jobId INT NOT NULL,
        userId INT NOT NULL,
        rank INT,
        scoreObtained DECIMAL(5,2),
        totalScore DECIMAL(5,2),
        percentage DECIMAL(5,2),
        selectedStatus ENUM('SELECTED','WAITING','NOT_SELECTED'),
        documentVerificationStatus ENUM('PENDING','APPROVED','REJECTED'),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('All tables created successfully!');
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createDatabase();

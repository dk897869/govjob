const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:4200', methods: ['GET', 'POST', 'PUT'] }
});

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const PORT = process.env.PORT || 5000;
const SARKARI_SOURCE_URL = process.env.SARKARI_SOURCE_URL || 'https://www.sarkarijob.com/latest-jobs/';

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const hash = (password) => bcrypt.hashSync(password, 10);
let nextId = 20;
const id = () => nextId++;

const users = [
  { id: 1, firstName: 'Aarav', lastName: 'Sharma', email: 'student@govjob.in', phone: '9876543210', password: hash('Password@123'), role: 'STUDENT', state: 'Delhi', city: 'New Delhi', isVerified: true },
  { id: 2, firstName: 'Meera', lastName: 'Iyer', email: 'teacher@govjob.in', phone: '9876543211', password: hash('Password@123'), role: 'TEACHER', state: 'Tamil Nadu', city: 'Chennai', isVerified: true },
  { id: 3, firstName: 'Rohan', lastName: 'Verma', email: 'hr@govjob.in', phone: '9876543212', password: hash('Password@123'), role: 'HR', state: 'Maharashtra', city: 'Mumbai', isVerified: true },
  { id: 4, firstName: 'Admin', lastName: 'Officer', email: 'admin@govjob.in', phone: '9876543213', password: hash('Password@123'), role: 'ADMIN', state: 'Delhi', city: 'New Delhi', isVerified: true }
];

const jobs = [
  { id: 1, title: 'Railway RRB Technician CEN 02/2026 Recruitment', department: 'Railway Recruitment Board', sector: 'Railway', state: 'All India', city: 'Multiple Zones', salary: 'Rs. 29,200 - 56,100', applicationFee: 500, totalPositions: 6565, examStartDate: '2026-08-12', applicationDeadline: '2026-06-30', minSkillMarks: 55, description: 'Latest Sarkari recruitment for RRB Technician posts with CBT, document verification, and medical examination.', eligibility: '10th Pass / ITI in relevant trade as per official notification.', status: 'OPEN', createdBy: 3, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['Easily apply', 'Latest update'] },
  { id: 2, title: 'Bihar Police BPSSC ASI Technical Recruitment 2026', department: 'Bihar Police Subordinate Services Commission', sector: 'Police', state: 'Bihar', city: 'Patna', salary: 'Rs. 29,200 - 92,300', applicationFee: 700, totalPositions: 22, examStartDate: '2026-09-20', applicationDeadline: '2026-07-15', minSkillMarks: 58, description: 'Technical Assistant Sub Inspector recruitment for Bihar Police with written examination and document verification.', eligibility: 'Diploma qualification in relevant technical discipline.', status: 'OPEN', createdBy: 3, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['Urgently hiring'] },
  { id: 3, title: 'Navy SSC IT Online Form 2026', department: 'Indian Navy', sector: 'Defence', state: 'All India', city: 'Multiple Locations', salary: 'Rs. 56,100 - 1,77,500', applicationFee: 0, totalPositions: 15, examStartDate: '2026-10-05', applicationDeadline: '2026-07-05', minSkillMarks: 68, description: 'Short Service Commission IT officer entry for eligible graduate candidates.', eligibility: 'Graduate / engineering qualification in relevant computer or IT discipline.', status: 'OPEN', createdBy: 2, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['No fee'] },
  { id: 4, title: 'BPSC 72th Recruitment 2026', department: 'Bihar Public Service Commission', sector: 'State PSC', state: 'Bihar', city: 'Patna', salary: 'Rs. 56,100 - 1,77,500', applicationFee: 600, totalPositions: 1186, examStartDate: '2026-08-28', applicationDeadline: '2026-06-25', minSkillMarks: 62, description: 'BPSC combined competitive recruitment for administrative and allied state services.', eligibility: 'Graduate degree from a recognized university.', status: 'OPEN', createdBy: 3, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['Popular'] },
  { id: 5, title: 'SBI Trade Finance Officer Online Form 2026', department: 'State Bank of India', sector: 'Banking', state: 'All India', city: 'Multiple Branches', salary: 'Rs. 64,820 - 93,960', applicationFee: 750, totalPositions: 100, examStartDate: '2026-11-10', applicationDeadline: '2026-08-01', minSkillMarks: 64, description: 'Specialist officer recruitment for trade finance operations in State Bank of India.', eligibility: 'Graduate with trade finance or banking experience as per notification.', status: 'OPEN', createdBy: 4, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['Banking'] },
  { id: 6, title: 'Railway RRB ALP CEN 01/2026 Recruitment', department: 'Railway Recruitment Board', sector: 'Railway', state: 'All India', city: 'Multiple Zones', salary: 'Rs. 19,900 - 63,200', applicationFee: 500, totalPositions: 11127, examStartDate: '2026-09-14', applicationDeadline: '2026-07-22', minSkillMarks: 50, description: 'Assistant Loco Pilot recruitment with CBT, aptitude test, document verification, and medical standards.', eligibility: '10th Pass with ITI/Diploma qualification.', status: 'OPEN', createdBy: 3, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['High vacancy'] },
  { id: 7, title: 'Indian Army 10+2 TES 56 Online Form 2026', department: 'Indian Army', sector: 'Defence', state: 'All India', city: 'Training Academy', salary: 'Rs. 56,100 - 1,77,500', applicationFee: 0, totalPositions: 90, examStartDate: '2026-09-30', applicationDeadline: '2026-07-30', minSkillMarks: 70, description: 'Technical Entry Scheme for 10+2 candidates seeking officer entry in Indian Army.', eligibility: '12th Pass with PCM and JEE Main requirement as per notification.', status: 'OPEN', createdBy: 3, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['Defence'] },
  { id: 8, title: 'UPSSSC Cane Supervisor Recruitment 2026', department: 'Uttar Pradesh Subordinate Services Selection Commission', sector: 'Agriculture', state: 'Uttar Pradesh', city: 'Lucknow', salary: 'Rs. 25,500 - 81,100', applicationFee: 25, totalPositions: 1182, examStartDate: '2026-10-18', applicationDeadline: '2026-08-05', minSkillMarks: 56, description: 'Cane Supervisor recruitment for agriculture and sugarcane department functions.', eligibility: 'Graduate qualification with agriculture-related eligibility as per notification.', status: 'OPEN', createdBy: 3, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['State job'] },
  { id: 9, title: 'AFCAT 02/2026 Online Form', department: 'Indian Air Force', sector: 'Defence', state: 'All India', city: 'Multiple Centers', salary: 'Rs. 56,100 - 1,77,500', applicationFee: 550, totalPositions: 300, examStartDate: '2026-09-08', applicationDeadline: '2026-07-18', minSkillMarks: 66, description: 'Air Force Common Admission Test for flying branch and ground duty branches.', eligibility: 'Graduate / engineering qualification as per branch-specific criteria.', status: 'OPEN', createdBy: 3, sourceName: 'Sarkari Job', sourceUrl: SARKARI_SOURCE_URL, applyUrl: SARKARI_SOURCE_URL, tags: ['Officer entry'] }
];
let sourceStatus = { sourceUrl: SARKARI_SOURCE_URL, lastSyncedAt: null, mode: 'seeded', imported: jobs.length, error: null };

const applications = [
  { id: 1, jobId: 1, userId: 1, applicationFeeAmount: 100, feeStatus: 'PAID', skillTestScore: 76, applicationStatus: 'PENDING', appliedAt: new Date().toISOString() }
];
const skillTests = [{ id: 1, title: 'Government Aptitude Foundation', totalMarks: 100, passingMarks: 40, timeLimit: 60 }];
const questions = [
  { id: 1, testId: 1, correctAnswer: 'B' }, { id: 2, testId: 1, correctAnswer: 'A' }, { id: 3, testId: 1, correctAnswer: 'C' }, { id: 4, testId: 1, correctAnswer: 'D' }, { id: 5, testId: 1, correctAnswer: 'A' }
];
const connections = [{ id: 1, userId: 1, hrId: 3, status: 'ACCEPTED', requestMessage: 'Guidance for SSC and railway jobs.', requestedAt: new Date().toISOString() }];
const messages = [
  { id: 1, senderId: 3, receiverId: 1, senderName: 'Rohan Verma', message: 'Welcome. Share your target exam and latest marks.', createdAt: new Date().toISOString(), isRead: false },
  { id: 2, senderId: 1, receiverId: 3, senderName: 'Aarav Sharma', message: 'I am targeting SSC CGL and railway exams.', createdAt: new Date().toISOString(), isRead: true }
];
const notifications = [
  { id: 1, userId: 1, type: 'JOB_MATCH', title: 'New recommendation', message: 'SSC Graduate Level Officer matches your 76% skill score.', relatedId: 1, isRead: false, createdAt: new Date().toISOString() },
  { id: 2, userId: 1, type: 'ADMIT_CARD', title: 'Admit card reminder', message: 'Download window opens before the exam date.', relatedId: 1, isRead: false, createdAt: new Date().toISOString() }
];
const results = [{ id: 1, jobId: 1, userId: 1, rank: 412, scoreObtained: 76, totalScore: 100, percentage: 76, selectedStatus: 'WAITING', documentVerificationStatus: 'PENDING' }];
const previousPapers = [{ id: 1, jobId: 1, paperName: 'SSC CGL Previous Year Paper', examYear: 2025, fileUrl: '/uploads/sample-paper.pdf' }];
const resumes = [];
const otps = new Map();

const publicUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const sign = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const textOnly = (value = '') => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#8377;|&rsquo;/g, 'Rs.')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const fetchHtml = (url) => new Promise((resolve, reject) => {
  const request = https.get(url, { headers: { 'User-Agent': 'GovCareerBot/1.0 (+job aggregation for users)' }, timeout: 9000 }, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      response.resume();
      return resolve(fetchHtml(new URL(response.headers.location, url).toString()));
    }
    if (response.statusCode !== 200) {
      response.resume();
      return reject(new Error(`Source returned ${response.statusCode}`));
    }
    let html = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => { html += chunk; });
    response.on('end', () => resolve(html));
  });
  request.on('timeout', () => request.destroy(new Error('Source request timed out')));
  request.on('error', reject);
});

const inferSector = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('railway') || lower.includes('rrb')) return 'Railway';
  if (lower.includes('bank') || lower.includes('sbi')) return 'Banking';
  if (lower.includes('police')) return 'Police';
  if (lower.includes('army') || lower.includes('navy') || lower.includes('air force') || lower.includes('afcat')) return 'Defence';
  if (lower.includes('teacher')) return 'Education';
  if (lower.includes('bpsc') || lower.includes('upsssc')) return 'State PSC';
  return 'Government';
};

const normalizeSourceJobs = (html, sourceUrl) => {
  const rows = [...html.matchAll(/<tr[\s\S]*?<\/tr>/gi)]
    .map((match) => [...match[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => textOnly(cell[1])))
    .filter((cells) => cells.length >= 4 && !/job title/i.test(cells.join(' ')));
  const mappedRows = rows.slice(0, 25).map((cells) => {
    const title = cells[0];
    const state = cells[1] || 'All India';
    const qualification = cells[2] || 'As per notification';
    const salary = cells[3] || 'As per rules';
    const vacancies = Number(String(cells[4] || '').replace(/[^\d]/g, '')) || 1;
    return { title, state, qualification, salary, vacancies };
  });

  const headingJobs = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((match) => textOnly(match[1]))
    .filter((title) => title && !/latest|sarkari|government jobs/i.test(title))
    .slice(0, 25)
    .map((title) => ({ title, state: title.includes('Bihar') ? 'Bihar' : title.includes('UP') || title.includes('UPSSSC') ? 'Uttar Pradesh' : 'All India', qualification: 'As per notification', salary: 'As per rules', vacancies: 1 }));

  return (mappedRows.length ? mappedRows : headingJobs).filter((item) => item.title).map((item, index) => ({
    id: 10000 + index,
    title: item.title,
    department: item.title.split(' Recruitment')[0].split(' Online')[0],
    sector: inferSector(item.title),
    state: item.state,
    city: item.state === 'All India' ? 'Multiple Locations' : item.state,
    salary: item.salary,
    applicationFee: 0,
    totalPositions: item.vacancies,
    examStartDate: new Date(Date.now() + (45 + index * 3) * 86400000).toISOString().slice(0, 10),
    applicationDeadline: new Date(Date.now() + (20 + index * 2) * 86400000).toISOString().slice(0, 10),
    minSkillMarks: 45 + (index % 5) * 5,
    description: `${item.title} imported from Sarkari job source. Check the official notification before applying.`,
    eligibility: item.qualification,
    status: 'OPEN',
    createdBy: 4,
    sourceName: 'Sarkari Job Source',
    sourceUrl,
    applyUrl: sourceUrl,
    tags: ['Sarkari source', item.qualification]
  }));
};

const syncSarkariJobs = async () => {
  try {
    const html = await fetchHtml(SARKARI_SOURCE_URL);
    const imported = normalizeSourceJobs(html, SARKARI_SOURCE_URL);
    if (!imported.length) throw new Error('No jobs found in source markup');
    const seeded = jobs.filter((job) => job.id < 10000);
    jobs.splice(0, jobs.length, ...imported, ...seeded);
    sourceStatus = { sourceUrl: SARKARI_SOURCE_URL, lastSyncedAt: new Date().toISOString(), mode: 'live', imported: imported.length, error: null };
    return sourceStatus;
  } catch (error) {
    sourceStatus = { sourceUrl: SARKARI_SOURCE_URL, lastSyncedAt: new Date().toISOString(), mode: 'seeded-fallback', imported: jobs.length, error: error.message };
    return sourceStatus;
  }
};

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const roles = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Role not allowed' });
  next();
};

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', service: 'GovCareer API' }));
app.get('/api/source/status', (req, res) => res.json({ success: true, source: sourceStatus }));
app.post('/api/source/sync', auth, roles('ADMIN', 'HR'), async (req, res) => {
  const source = await syncSarkariJobs();
  res.json({ success: true, message: source.mode === 'live' ? 'Sarkari job source synced' : 'Using seeded Sarkari fallback data', source });
});

app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, role = 'STUDENT', state = 'Delhi' } = req.body;
  if (!email || !phone || !password) return res.status(400).json({ success: false, message: 'Email, mobile and password are required' });
  if (users.some((u) => u.email === email || u.phone === phone)) return res.status(409).json({ success: false, message: 'Email or mobile already registered' });
  const user = { id: id(), firstName, lastName, email, phone, password: await bcrypt.hash(password, 10), role, state, city: '', isVerified: true };
  users.push(user);
  notifications.push({ id: id(), userId: user.id, type: 'WELCOME', title: 'Profile created', message: 'Your government job profile is ready.', isRead: false, createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, message: 'Registration successful', token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, email, password } = req.body;
  const loginId = identifier || email;
  const user = users.find((u) => u.email === loginId || u.phone === loginId);
  if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ success: false, message: 'Invalid email/mobile or password' });
  res.json({ success: true, message: 'Login successful', token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Mobile number is required' });
  otps.set(phone, '123456');
  res.json({ success: true, message: 'OTP sent successfully', demoOtp: '123456' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otps.get(phone) !== otp) return res.status(401).json({ success: false, message: 'Invalid OTP' });
  let user = users.find((u) => u.phone === phone);
  if (!user) {
    user = { id: id(), firstName: 'Mobile', lastName: 'User', email: `${phone}@mobile.govjob.in`, phone, password: hash(`otp-${phone}`), role: 'STUDENT', state: 'Delhi', city: '', isVerified: true };
    users.push(user);
  }
  res.json({ success: true, message: 'OTP login successful', token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/social-login', (req, res) => {
  const provider = String(req.body.provider || 'google').toLowerCase();
  let user = users.find((u) => u.email === `${provider}@demo.govjob.in`);
  if (!user) {
    user = { id: id(), firstName: provider[0].toUpperCase() + provider.slice(1), lastName: 'Candidate', email: `${provider}@demo.govjob.in`, phone: `90000000${user?.id || 10}`, password: hash(provider), role: 'STUDENT', state: 'Delhi', city: '', isVerified: true };
    users.push(user);
  }
  res.json({ success: true, message: `${provider} login successful`, token: sign(user), user: publicUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  res.json({ success: true, user: publicUser(user) });
});

app.get('/api/jobs', (req, res) => {
  const { state = '', sector = '', search = '', page = 1, limit = 10 } = req.query;
  const filtered = jobs.filter((job) => {
    const stateMatch = !state || state === 'All India' || job.state === state || job.state === 'All India';
    const sectorMatch = !sector || job.sector === sector;
    const text = `${job.title} ${job.department} ${job.description} ${job.city}`.toLowerCase();
    return job.status === 'OPEN' && stateMatch && sectorMatch && text.includes(String(search).toLowerCase());
  });
  const start = (Number(page) - 1) * Number(limit);
  res.json({ success: true, jobs: filtered.slice(start, start + Number(limit)), pagination: { page: Number(page), limit: Number(limit), total: filtered.length }, total: filtered.length, source: sourceStatus });
});

app.get('/api/jobs/filters/states', (req, res) => res.json({ success: true, states: ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'] }));
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find((item) => item.id === Number(req.params.id));
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job, previousPapers: previousPapers.filter((paper) => paper.jobId === job.id) });
});

app.post('/api/jobs', auth, roles('HR', 'ADMIN', 'TEACHER'), (req, res) => {
  const job = { id: id(), status: 'OPEN', createdBy: req.user.id, examStartDate: '2026-10-15', applicationDeadline: '2026-08-15', applicationFee: 0, totalPositions: 1, minSkillMarks: 40, ...req.body };
  jobs.unshift(job);
  users.forEach((user) => notifications.push({ id: id(), userId: user.id, type: 'NEW_JOB', title: 'New job posted', message: `${job.title} is now open in ${job.state}.`, relatedId: job.id, isRead: false, createdAt: new Date().toISOString() }));
  res.status(201).json({ success: true, message: 'Job posted successfully', job });
});

app.get('/api/applications/me', auth, (req, res) => {
  const rows = applications.filter((app) => app.userId === req.user.id || req.user.role === 'HR' || req.user.role === 'ADMIN').map((app) => ({ ...app, ...jobs.find((job) => job.id === app.jobId) }));
  res.json({ success: true, applications: rows });
});

app.post('/api/applications', auth, (req, res) => {
  const job = jobs.find((item) => item.id === Number(req.body.jobId));
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  if (applications.some((app) => app.jobId === job.id && app.userId === req.user.id)) return res.status(409).json({ success: false, message: 'Already applied for this job' });
  const application = { id: id(), jobId: job.id, userId: req.user.id, applicationFeeAmount: job.applicationFee, feeStatus: job.applicationFee ? 'PENDING' : 'PAID', skillTestScore: null, applicationStatus: 'PENDING', appliedAt: new Date().toISOString() };
  applications.push(application);
  notifications.push({ id: id(), userId: req.user.id, type: 'APPLICATION', title: 'Application submitted', message: `Your application for ${job.title} was submitted.`, relatedId: job.id, isRead: false, createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, message: 'Application submitted successfully', application });
});

app.get('/api/skill-tests', (req, res) => res.json({ success: true, skillTests }));
app.post('/api/skill-tests/:id/submit', auth, (req, res) => {
  const answers = req.body.answers || [];
  const correct = answers.filter((answer) => questions.find((q) => q.id === answer.questionId)?.correctAnswer === answer.selectedAnswer).length;
  const score = correct * 20;
  const result = { testId: Number(req.params.id), userId: req.user.id, score, totalMarks: 100, percentage: score, passed: score >= 40 };
  applications.filter((app) => app.userId === req.user.id).forEach((app) => { app.skillTestScore = score; });
  notifications.push({ id: id(), userId: req.user.id, type: 'TEST_RESULT', title: 'Skill test completed', message: `You scored ${score}%. Recommendations are updated.`, isRead: false, createdAt: new Date().toISOString() });
  res.json({ success: true, result, recommendedJobs: jobs.filter((job) => score >= job.minSkillMarks) });
});

app.get('/api/hr-connections', auth, (req, res) => {
  const rows = connections.filter((c) => c.userId === req.user.id || c.hrId === req.user.id || req.user.role === 'ADMIN').map((c) => ({ ...c, userName: `${users.find((u) => u.id === c.userId)?.firstName || ''} ${users.find((u) => u.id === c.userId)?.lastName || ''}`, hrName: `${users.find((u) => u.id === c.hrId)?.firstName || ''} ${users.find((u) => u.id === c.hrId)?.lastName || ''}` }));
  res.json({ success: true, connections: rows });
});

app.post('/api/hr-connections', auth, (req, res) => {
  const connection = { id: id(), userId: req.user.id, hrId: Number(req.body.hrId || 3), status: 'PENDING', requestMessage: req.body.requestMessage || 'Connection request', requestedAt: new Date().toISOString() };
  connections.push(connection);
  res.status(201).json({ success: true, message: 'Connection request sent', connection });
});

app.get('/api/chat/messages/:userId', auth, (req, res) => {
  const otherId = Number(req.params.userId);
  const rows = messages.filter((m) => (m.senderId === req.user.id && m.receiverId === otherId) || (m.senderId === otherId && m.receiverId === req.user.id));
  res.json({ success: true, messages: rows });
});

app.post('/api/chat/messages', auth, (req, res) => {
  const sender = users.find((u) => u.id === req.user.id);
  const message = { id: id(), senderId: req.user.id, receiverId: Number(req.body.receiverId), senderName: `${sender.firstName} ${sender.lastName}`, message: req.body.message, createdAt: new Date().toISOString(), isRead: false };
  messages.push(message);
  io.to(`user_${message.receiverId}`).emit('receive_message', message);
  res.status(201).json({ success: true, message });
});

app.get('/api/notifications', auth, (req, res) => res.json({ success: true, notifications: notifications.filter((n) => n.userId === req.user.id).sort((a, b) => b.id - a.id) }));
app.put('/api/notifications/:id/read', auth, (req, res) => {
  const item = notifications.find((n) => n.id === Number(req.params.id) && n.userId === req.user.id);
  if (item) item.isRead = true;
  res.json({ success: true, notification: item });
});

app.get('/api/results', auth, (req, res) => res.json({ success: true, results: results.filter((r) => r.userId === req.user.id || req.user.role === 'ADMIN') }));
app.get('/api/admit-cards', auth, (req, res) => res.json({ success: true, admitCards: applications.filter((app) => app.userId === req.user.id).map((app) => ({ ...app, job: jobs.find((job) => job.id === app.jobId), downloadUrl: `/api/admit-cards/${app.id}/download` })) }));
app.get('/api/previous-papers', (req, res) => res.json({ success: true, previousPapers }));
app.post('/api/resumes', auth, (req, res) => {
  const resume = { id: id(), userId: req.user.id, ...req.body, updatedAt: new Date().toISOString() };
  resumes.push(resume);
  res.status(201).json({ success: true, message: 'Resume saved', resume });
});

app.get('/api/users', auth, roles('ADMIN', 'HR'), (req, res) => res.json({ success: true, users: users.map(publicUser) }));

io.on('connection', (socket) => {
  socket.on('join_user', (userId) => socket.join(`user_${userId}`));
  socket.on('join_room', (data) => socket.join(`chat_${data.conversationId}`));
  socket.on('send_message', (data) => io.to(`chat_${data.conversationId}`).emit('receive_message', data));
});

app.use((req, res) => res.status(404).json({ success: false, message: 'API route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

server.listen(PORT, () => {
  console.log(`GovCareer API running on http://localhost:${PORT}`);
});

syncSarkariJobs().then((source) => {
  console.log(`Job source mode: ${source.mode} (${source.imported} records)`);
});

module.exports = { app, server };

# GovCareer Deployment Guide

## Local development

1. Backend
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Frontend
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Open `http://localhost:4200`.

Demo users:
- `student@govjob.in` / `Password@123`
- `teacher@govjob.in` / `Password@123`
- `hr@govjob.in` / `Password@123`
- `admin@govjob.in` / `Password@123`
- OTP login uses demo OTP `123456`.

## MySQL production setup

1. Create the database:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```

2. Set production environment variables in `backend/.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-domain.com
   JWT_SECRET=replace-with-a-long-random-secret
   DB_HOST=your-mysql-host
   DB_USER=your-mysql-user
   DB_PASSWORD=your-mysql-password
   DB_NAME=govjob_portal
   ```

3. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

4. Serve `frontend/dist/govjob-frontend` with Nginx, Apache, S3/CloudFront, or any static host.

## Production notes

- Replace demo social login endpoints with OAuth credentials for Google, LinkedIn, and Facebook.
- Replace demo OTP with a provider such as MSG91, Twilio, or Firebase Auth.
- Store uploaded resumes, admit cards, and previous papers on S3-compatible storage.
- Put the Node API behind HTTPS and a reverse proxy.
- Use PM2 or Docker for process management.

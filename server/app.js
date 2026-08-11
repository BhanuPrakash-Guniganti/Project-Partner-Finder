const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const matchRoutes = require('./routes/matchRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Bulletproof CORS Middleware for Vercel, Render & Local Dev
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck Routes
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', name: 'Project Partner Finder API', timestamp: new Date().toISOString() });
});

// Mount Routes with BOTH /api/ prefix and root path to handle both frontend configurations
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/projects', '/projects'], projectRoutes);
app.use(['/api/matches', '/matches'], matchRoutes);
app.use(['/api/applications', '/applications'], applicationRoutes);
app.use(['/api/teams', '/teams'], teamRoutes);
app.use(['/api/tasks', '/tasks'], taskRoutes);
app.use(['/api/chat', '/chat'], chatRoutes);
app.use(['/api/notifications', '/notifications'], notificationRoutes);
app.use(['/api/resume', '/resume'], resumeRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;

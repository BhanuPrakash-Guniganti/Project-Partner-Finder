const express = require('express');
const router = express.Router();
const { createSupportTicket, getSupportTickets } = require('../controllers/supportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Optional auth: if token is present, attaches req.user, otherwise allows guest inquiries
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, createSupportTicket);
router.get('/', protect, adminOnly, getSupportTickets);

module.exports = router;

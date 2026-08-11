const express = require('express');
const router = express.Router();
const { getDirectMessages, getProjectMessages, sendMessage } = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.get('/direct/:userId', auth, getDirectMessages);
router.get('/project/:projectId', auth, getProjectMessages);
router.post('/send', auth, sendMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateOnboarding, searchCandidates, getUserById } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.put('/me/onboarding', auth, updateOnboarding);
router.get('/search', auth, searchCandidates);
router.get('/:id', auth, getUserById);

module.exports = router;

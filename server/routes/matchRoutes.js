const express = require('express');
const router = express.Router();
const { getRecommendedProjects, getRecommendedCandidates } = require('../controllers/matchController');
const { auth } = require('../middleware/auth');

router.get('/projects', auth, getRecommendedProjects);
router.get('/candidates/:projectId', auth, getRecommendedCandidates);

module.exports = router;

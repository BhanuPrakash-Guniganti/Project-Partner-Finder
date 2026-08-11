const express = require('express');
const router = express.Router();
const { applyToProject, inviteCandidate, getUserApplications, getProjectApplications, respondApplication } = require('../controllers/applicationController');
const { auth } = require('../middleware/auth');

router.post('/projects/:id/apply', auth, applyToProject);
router.post('/invite', auth, inviteCandidate);
router.get('/user', auth, getUserApplications);
router.get('/projects/:id', auth, getProjectApplications);
router.patch('/:id', auth, respondApplication);

module.exports = router;

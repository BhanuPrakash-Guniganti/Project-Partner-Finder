const express = require('express');
const router = express.Router();
const { getUserTeams, getTeamByProjectId, updateMemberRole } = require('../controllers/teamController');
const { auth } = require('../middleware/auth');

router.get('/user', auth, getUserTeams);
router.get('/project/:projectId', auth, getTeamByProjectId);
router.patch('/project/:projectId/members', auth, updateMemberRole);

module.exports = router;

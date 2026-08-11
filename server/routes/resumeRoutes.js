const express = require('express');
const router = express.Router();
const { analyzeResume, getHistory, getAnalysisById, deleteAnalysis, syncProfileSkills } = require('../controllers/resumeController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/analyze', auth, upload.single('resume'), analyzeResume);
router.get('/history', auth, getHistory);
router.get('/:id', auth, getAnalysisById);
router.delete('/:id', auth, deleteAnalysis);
router.post('/sync-profile', auth, syncProfileSkills);

module.exports = router;

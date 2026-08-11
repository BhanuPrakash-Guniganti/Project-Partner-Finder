const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject, getMyProjects } = require('../controllers/projectController');
const { auth } = require('../middleware/auth');

router.get('/', getProjects);
router.get('/my-projects', auth, getMyProjects);
router.get('/:id', getProjectById);
router.post('/', auth, createProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getTasks, createTask, updateTask, deleteTask,
  getMilestones, createMilestone, updateMilestone,
  getResources, createResource
} = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

// Tasks
router.get('/project/:projectId', auth, getTasks);
router.post('/', auth, createTask);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

// Milestones
router.get('/milestones/project/:projectId', auth, getMilestones);
router.post('/milestones', auth, createMilestone);
router.patch('/milestones/:id', auth, updateMilestone);

// Resources
router.get('/resources/project/:projectId', auth, getResources);
router.post('/resources', auth, createResource);

module.exports = router;

const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../config/socket');

// TASKS
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name avatar email')
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { projectId, title, description, assignedTo, priority, status, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required.' });
    }

    const task = await Task.create({
      projectId,
      createdBy: req.user.id,
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name avatar email')
      .populate('createdBy', 'name avatar');

    if (assignedTo && assignedTo.toString() !== req.user.id) {
      const notification = await Notification.create({
        userId: assignedTo,
        title: 'New Task Assignment',
        message: `You were assigned a new task: "${title}".`,
        type: 'task',
        link: `/workspace/${projectId}`
      });

      sendNotificationToUser(assignedTo, notification);
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    Object.assign(task, req.body);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name avatar email')
      .populate('createdBy', 'name avatar');

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

// MILESTONES
const getMilestones = async (req, res, next) => {
  try {
    const milestones = await Milestone.find({ projectId: req.params.projectId }).sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    next(error);
  }
};

const createMilestone = async (req, res, next) => {
  try {
    const { projectId, title, description, dueDate, status, progress } = req.body;
    const milestone = await Milestone.create({
      projectId,
      title,
      description: description || '',
      dueDate,
      status: status || 'Upcoming',
      progress: progress || 0
    });
    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
};

const updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(milestone);
  } catch (error) {
    next(error);
  }
};

// RESOURCES
const getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ projectId: req.params.projectId })
      .populate('addedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const { projectId, name, url, type } = req.body;
    const resource = await Resource.create({
      projectId,
      name,
      url,
      type: type || 'Other',
      addedBy: req.user.id
    });

    const populated = await Resource.findById(resource._id).populate('addedBy', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getMilestones,
  createMilestone,
  updateMilestone,
  getResources,
  createResource
};

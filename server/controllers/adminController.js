const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Application = require('../models/Application');
const Report = require('../models/Report');

const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalProjects = await Project.countDocuments();
    const activeTeams = await Team.countDocuments({ status: 'Active' });
    const totalApplications = await Application.countDocuments();
    const acceptedApplications = await Application.countDocuments({ status: 'Accepted' });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });

    res.json({
      totalUsers,
      activeUsers,
      totalProjects,
      activeTeams,
      totalApplications,
      acceptedApplications,
      pendingReports,
      teamFormationRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    const report = await Report.create({
      reporterId: req.user.id,
      targetType,
      targetId,
      reason,
      description: description || ''
    });
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    if (status) report.status = status;
    if (adminNote) report.adminNote = adminNote;

    await report.save();
    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  getProjects,
  getReports,
  createReport,
  updateReportStatus
};

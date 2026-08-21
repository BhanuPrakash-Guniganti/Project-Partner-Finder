const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');
const Notification = require('../models/Notification');
const { calculateMatchScore } = require('../services/matchingService');
const { sendNotificationToUser, sendApplicationToUser, emitApplicationStatusUpdate } = require('../config/socket');

const applyToProject = async (req, res, next) => {
  try {
    const { requestedRole, message } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.ownerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply to your own project.' });
    }

    // Capacity Check
    const team = await Team.findOne({ projectId });
    const currentMemberCount = team ? team.members.length : 0;
    const maxCapacity = project.teamSize || 4;

    if (currentMemberCount >= maxCapacity || project.status === 'Team Full' || project.status === 'Team Complete') {
      return res.status(400).json({ message: 'This project team is already full. Applications are closed.' });
    }

    const existing = await Application.findOne({
      projectId,
      applicantId: req.user.id,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this project.' });
    }

    const applicant = await User.findById(req.user.id);
    const match = calculateMatchScore(applicant.toObject(), project.toObject());

    const application = await Application.create({
      projectId,
      applicantId: req.user.id,
      requestedRole: requestedRole || 'Team Member',
      message: message || '',
      matchScore: match.matchScore,
      matchBreakdown: match.matchBreakdown,
      type: 'application',
      status: 'Pending'
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('applicantId', 'name avatar email bio skills experienceLevel availability preferredRoles')
      .populate({
        path: 'projectId',
        select: 'title category type ownerId teamSize'
      });

    // Send notification to project owner
    const notification = await Notification.create({
      userId: project.ownerId,
      title: 'New Project Application',
      message: `${applicant.name} applied to join ${project.title} as ${application.requestedRole} (${match.matchScore}% Match).`,
      type: 'application',
      link: `/projects/${project._id}`
    });

    sendNotificationToUser(project.ownerId, notification);
    sendApplicationToUser(project.ownerId, populatedApplication || application);

    res.status(201).json(populatedApplication || application);
  } catch (error) {
    next(error);
  }
};

const inviteCandidate = async (req, res, next) => {
  try {
    const { projectId, candidateId, role, message } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can invite candidates.' });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate user not found.' });

    const existing = await Application.findOne({
      projectId,
      applicantId: candidateId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'An active application or invitation already exists for this candidate.' });
    }

    const match = calculateMatchScore(candidate.toObject(), project.toObject());

    const invitation = await Application.create({
      projectId,
      applicantId: candidateId,
      requestedRole: role || 'Team Member',
      message: message || `Hi ${candidate.name}, we would love to invite you to join our project!`,
      matchScore: match.matchScore,
      matchBreakdown: match.matchBreakdown,
      type: 'invitation',
      status: 'Pending'
    });

    // Send notification to candidate
    const notification = await Notification.create({
      userId: candidateId,
      title: 'Project Team Invitation',
      message: `You were invited to join "${project.title}" as ${role || 'Team Member'}.`,
      type: 'invitation',
      link: `/invitations`
    });

    sendNotificationToUser(candidateId, notification);

    res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
};

const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate({
        path: 'projectId',
        populate: { path: 'ownerId', select: 'name avatar email' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const getProjectApplications = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    const applications = await Application.find({ projectId: req.params.id })
      .populate('applicantId', 'name avatar email bio skills experienceLevel availability preferredRoles')
      .sort({ matchScore: -1, createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const respondApplication = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Accepted', 'Rejected', 'Withdrawn', 'Declined'
    const application = await Application.findById(req.params.id).populate('projectId');

    if (!application) return res.status(404).json({ message: 'Application record not found.' });

    application.status = status;
    await application.save();

    if (status === 'Accepted') {
      // Add member to project team
      let team = await Team.findOne({ projectId: application.projectId._id });
      if (!team) {
        const creatorParticipates = application.projectId.creator?.participation !== false;
        const initialMembers = [];
        if (creatorParticipates) {
          initialMembers.push({
            userId: application.projectId.ownerId,
            role: application.projectId.creator?.role || 'Project Lead',
            isOwner: true
          });
        }
        team = await Team.create({
          projectId: application.projectId._id,
          members: initialMembers
        });
      }

      const maxCapacity = application.projectId.teamSize || 4;
      const exists = team.members.some(m => m.userId.toString() === application.applicantId.toString());

      if (!exists) {
        if (team.members.length >= maxCapacity) {
          return res.status(400).json({ 
            message: `Cannot accept application. Team has reached maximum capacity of ${maxCapacity} members.` 
          });
        }

        team.members.push({
          userId: application.applicantId,
          role: application.requestedRole || 'Team Member',
          isOwner: false
        });
        await team.save();
      }

      // Automatically transition status to Team Full if capacity reached
      const newStatus = team.members.length >= maxCapacity ? 'Team Full' : 'Team Forming';
      await Project.findByIdAndUpdate(application.projectId._id, { status: newStatus });

      // Send notification
      const notification = await Notification.create({
        userId: application.applicantId,
        title: 'Application Accepted!',
        message: `Congratulations! Your application to join "${application.projectId.title}" was accepted.`,
        type: 'acceptance',
        link: `/workspace/${application.projectId._id}`
      });

      sendNotificationToUser(application.applicantId, notification);
    } else if (status === 'Rejected') {
      const notification = await Notification.create({
        userId: application.applicantId,
        title: 'Application Update',
        message: `Your application to join "${application.projectId?.title || 'the project'}" was not selected.`,
        type: 'rejection',
        link: `/projects`
      });

      sendNotificationToUser(application.applicantId, notification);
    }

    // Emit real-time status update to applicant's room ONLY after DB persistence
    emitApplicationStatusUpdate(application.applicantId, {
      applicationId: application._id,
      projectId: application.projectId?._id || application.projectId,
      status: application.status,
      projectTitle: application.projectId?.title
    });

    res.json(application);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToProject,
  inviteCandidate,
  getUserApplications,
  getProjectApplications,
  respondApplication
};

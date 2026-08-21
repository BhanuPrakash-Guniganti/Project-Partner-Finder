const Team = require('../models/Team');
const Project = require('../models/Project');

const getUserTeams = async (req, res, next) => {
  try {
    const userOwnedProjects = await Project.find({ ownerId: req.user.id }).select('_id');
    const ownedProjectIds = userOwnedProjects.map(p => p._id);

    const teams = await Team.find({
      $or: [
        { 'members.userId': req.user.id },
        { projectId: { $in: ownedProjectIds } }
      ]
    })
      .populate('projectId')
      .populate('members.userId', 'name avatar email skills bio preferredRoles');

    res.json(teams);
  } catch (error) {
    next(error);
  }
};

const getTeamByProjectId = async (req, res, next) => {
  try {
    const team = await Team.findOne({ projectId: req.params.projectId })
      .populate('projectId')
      .populate('members.userId', 'name avatar email skills bio availability preferredRoles');

    if (!team) return res.status(404).json({ message: 'Team workspace not found.' });

    res.json(team);
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { memberUserId, newRole, action } = req.body;
    const team = await Team.findOne({ projectId: req.params.projectId });

    if (!team) return res.status(404).json({ message: 'Team workspace not found.' });

    const project = await Project.findById(req.params.projectId);
    const isProjectOwner = project && project.ownerId.toString() === req.user.id;
    const isTeamOwner = team.members.some(m => m.userId.toString() === req.user.id && m.isOwner);

    if (!isProjectOwner && !isTeamOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can manage team members.' });
    }

    if (action === 'remove') {
      team.members = team.members.filter(m => m.userId.toString() !== memberUserId);
    } else if (newRole) {
      const member = team.members.find(m => m.userId.toString() === memberUserId);
      if (member) member.role = newRole;
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('members.userId', 'name avatar email skills');

    res.json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserTeams,
  getTeamByProjectId,
  updateMemberRole
};

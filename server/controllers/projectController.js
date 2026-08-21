const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');

const createProject = async (req, res, next) => {
  try {
    const {
      title, description, category, type, requiredRoles,
      requiredSkills, optionalSkills, teamSize, duration,
      availability, deadline, visibility, status, creator
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const isParticipating = creator?.participation !== undefined ? Boolean(creator.participation) : true;
    const creatorRole = isParticipating ? (creator?.role?.trim() || 'Project Lead') : '';
    const creatorSkills = isParticipating && Array.isArray(creator?.skills) ? creator.skills : [];

    const project = await Project.create({
      ownerId: req.user.id,
      creator: {
        participation: isParticipating,
        role: creatorRole,
        skills: creatorSkills
      },
      title,
      description,
      category: category || 'Web Development',
      type: type || 'Side Project',
      requiredRoles: requiredRoles || [],
      requiredSkills: requiredSkills || [],
      optionalSkills: optionalSkills || [],
      teamSize: teamSize || 4,
      duration: duration || '1-3 months',
      availability: availability || '10-15 hrs/week',
      deadline,
      visibility: visibility || 'Public',
      status: status || 'Open'
    });

    // Auto-create Team for this project: add creator to team members only if participating
    const initialMembers = [];
    if (isParticipating) {
      initialMembers.push({
        userId: req.user.id,
        role: creatorRole || 'Project Lead',
        isOwner: true
      });
    }

    await Team.create({
      projectId: project._id,
      members: initialMembers
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { search, category, type, status, skill, role, sort } = req.query;

    const query = { visibility: 'Public' };

    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'Archived' };
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (skill) {
      query.requiredSkills = { $regex: skill, $options: 'i' };
    }

    if (role) {
      query['requiredRoles.title'] = { $regex: role, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'deadline') sortOptions = { deadline: 1 };

    const projects = await Project.find(query)
      .populate('ownerId', 'name avatar email skills bio')
      .sort(sortOptions);

    const projectIds = projects.map(p => p._id);
    const teams = await Team.find({ projectId: { $in: projectIds } }).select('projectId members');
    const teamMap = new Map();
    teams.forEach(t => {
      teamMap.set(t.projectId.toString(), t.members ? t.members.length : 0);
    });

    const projectsWithCounts = projects.map(p => {
      const pObj = p.toObject();
      pObj.currentMemberCount = teamMap.get(p._id.toString()) || 0;
      return pObj;
    });

    res.json(projectsWithCounts);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name avatar email bio skills links preferredRoles');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const team = await Team.findOne({ projectId: project._id }).populate('members.userId', 'name avatar email skills');

    res.json({
      ...project.toObject(),
      team,
      currentMemberCount: team?.members ? team.members.length : 0
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can update project settings.' });
    }

    Object.assign(project, req.body, { updatedAt: Date.now() });
    await project.save();

    res.json(project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action. Only project owner can delete this project.' });
    }

    const Application = require('../models/Application');
    const Task = require('../models/Task');
    const Message = require('../models/Message');

    await Project.findByIdAndDelete(req.params.id);
    await Team.deleteOne({ projectId: req.params.id });
    await Application.deleteMany({ projectId: req.params.id });
    await Task.deleteMany({ projectId: req.params.id });
    await Message.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project and all related workspace data deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const getMyProjects = async (req, res, next) => {
  try {
    const createdProjects = await Project.find({ ownerId: req.user.id }).sort({ createdAt: -1 });

    const joinedTeams = await Team.find({ 'members.userId': req.user.id }).populate('projectId');
    const joinedProjects = joinedTeams
      .filter(t => t.projectId && t.projectId.ownerId.toString() !== req.user.id)
      .map(t => t.projectId);

    const allProjIds = [...createdProjects.map(p => p._id), ...joinedProjects.map(p => p._id)];
    const teams = await Team.find({ projectId: { $in: allProjIds } }).select('projectId members');
    const teamMap = new Map();
    teams.forEach(t => {
      teamMap.set(t.projectId.toString(), t.members ? t.members.length : 0);
    });

    const populatedCreated = createdProjects.map(p => {
      const pObj = p.toObject();
      pObj.currentMemberCount = teamMap.get(p._id.toString()) || 0;
      return pObj;
    });

    const populatedJoined = joinedProjects.map(p => {
      const pObj = p.toObject();
      pObj.currentMemberCount = teamMap.get(p._id.toString()) || 0;
      return pObj;
    });

    res.json({
      created: populatedCreated,
      joined: populatedJoined
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects
};

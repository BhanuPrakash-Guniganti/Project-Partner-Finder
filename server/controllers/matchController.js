const User = require('../models/User');
const Project = require('../models/Project');
const { calculateMatchScore } = require('../services/matchingService');

const getRecommendedProjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User profile not found.' });

    const userObj = user.toObject();
    const projects = await Project.find({ ownerId: { $ne: req.user.id }, status: 'Open', visibility: 'Public' })
      .populate('ownerId', 'name avatar email bio');

    const recommended = projects.map(p => {
      const pObj = p.toObject();
      const match = calculateMatchScore(userObj, pObj);
      return {
        ...pObj,
        matchScore: match.matchScore,
        matchBreakdown: match.matchBreakdown,
        reasons: match.reasons
      };
    });

    recommended.sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommended);
  } catch (error) {
    next(error);
  }
};

const getRecommendedCandidates = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const candidates = await User.find({ _id: { $ne: req.user.id }, role: 'student', status: 'active' })
      .select('-passwordHash');

    const pObj = project.toObject();
    const recommended = candidates.map(c => {
      const cObj = c.toObject();
      const match = calculateMatchScore(cObj, pObj);
      return {
        ...cObj,
        matchScore: match.matchScore,
        matchBreakdown: match.matchBreakdown,
        reasons: match.reasons
      };
    });

    recommended.sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommended);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedProjects,
  getRecommendedCandidates
};

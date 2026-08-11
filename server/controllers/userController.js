const User = require('../models/User');
const Project = require('../models/Project');
const { calculateMatchScore } = require('../services/matchingService');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      name, bio, avatar, skills, interests, availability,
      preferredRoles, projectPreferences, experienceLevel, links
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (skills) user.skills = skills;
    if (interests) user.interests = interests;
    if (availability) user.availability = availability;
    if (preferredRoles) user.preferredRoles = preferredRoles;
    if (projectPreferences) user.projectPreferences = projectPreferences;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (links) user.links = { ...user.links, ...links };

    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateOnboarding = async (req, res, next) => {
  try {
    const { skills, interests, availability, preferredRoles, projectPreferences, bio, links } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (skills) user.skills = skills;
    if (interests) user.interests = interests;
    if (availability) user.availability = availability;
    if (preferredRoles) user.preferredRoles = preferredRoles;
    if (projectPreferences) user.projectPreferences = projectPreferences;
    if (bio !== undefined) user.bio = bio;
    if (links) user.links = { ...user.links, ...links };
    user.onboardingCompleted = true;

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const searchCandidates = async (req, res, next) => {
  try {
    const { search, skill, role, experience, availability, projectId } = req.query;

    const query = { _id: { $ne: req.user.id }, role: 'student', status: 'active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }

    if (role) {
      query.preferredRoles = { $regex: role, $options: 'i' };
    }

    if (experience) {
      query.experienceLevel = experience;
    }

    if (availability) {
      query.availability = availability;
    }

    let users = await User.find(query).select('-passwordHash');

    // If projectId provided, compute match scores for each candidate
    let targetProject = null;
    if (projectId) {
      targetProject = await Project.findById(projectId);
    }

    const candidatesWithMatch = users.map(u => {
      const uObj = u.toObject();
      if (targetProject) {
        const match = calculateMatchScore(uObj, targetProject);
        return {
          ...uObj,
          matchScore: match.matchScore,
          matchBreakdown: match.matchBreakdown,
          reasons: match.reasons
        };
      }
      return uObj;
    });

    if (targetProject) {
      candidatesWithMatch.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.json(candidatesWithMatch);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Candidate not found.' });

    let matchResult = null;
    if (req.query.projectId) {
      const project = await Project.findById(req.query.projectId);
      if (project) {
        matchResult = calculateMatchScore(user.toObject(), project);
      }
    }

    res.json({
      ...user.toObject(),
      match: matchResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateOnboarding,
  searchCandidates,
  getUserById
};

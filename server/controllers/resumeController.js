const pdfParse = require('pdf-parse');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');
const Project = require('../models/Project');
const { analyzeResumeWithGrok } = require('../services/grokService');
const { calculateMatchScore } = require('../services/matchingService');

const analyzeResume = async (req, res, next) => {
  try {
    let resumeText = '';
    let fileName = 'Uploaded_Resume.pdf';

    if (req.file) {
      fileName = req.file.originalname;
      try {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } catch (err) {
        console.warn('[PDF Parsing Error]', err.message);
        return res.status(400).json({ message: 'Could not extract text from uploaded PDF file. Please ensure it is a valid PDF document.' });
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
      fileName = req.body.fileName || 'Sample_Resume.txt';
    } else {
      return res.status(400).json({ message: 'Please upload a PDF resume file or provide text content.' });
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(400).json({ message: 'Extracted text from resume is too short or empty.' });
    }

    const userProfile = await User.findById(req.user.id);
    const analysisResult = await analyzeResumeWithGrok(resumeText, fileName, userProfile);

    // Save to database
    const savedRecord = await ResumeAnalysis.create({
      userId: req.user.id,
      fileName,
      resumeText: resumeText.slice(0, 3000), // store up to 3000 chars snippet
      overallScore: analysisResult.overallScore || 80,
      scoreCategoryBreakdown: analysisResult.scoreCategoryBreakdown,
      skillsAnalysis: analysisResult.skillsAnalysis,
      projectAnalysis: analysisResult.projectAnalysis,
      experienceAnalysis: analysisResult.experienceAnalysis,
      atsAnalysis: analysisResult.atsAnalysis,
      recommendations: analysisResult.recommendations,
      missingProfileSkills: analysisResult.missingProfileSkills || []
    });

    // Also fetch project recommendations based on resume skills
    const resumeSkills = (analysisResult.skillsAnalysis?.strongSkills || [])
      .concat(analysisResult.skillsAnalysis?.mentionedSkills || []);
    
    // Create temporary user profile object with resume skills to match projects
    const tempProfileObj = {
      ...userProfile.toObject(),
      skills: resumeSkills.map(s => ({ name: s, proficiency: 'Intermediate' }))
    };

    const projects = await Project.find({ status: 'Open', visibility: 'Public' }).populate('ownerId', 'name avatar');
    const recommendedProjects = projects.map(p => {
      const match = calculateMatchScore(tempProfileObj, p.toObject());
      return {
        ...p.toObject(),
        matchScore: match.matchScore,
        matchBreakdown: match.matchBreakdown,
        reasons: match.reasons
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

    res.status(201).json({
      analysis: savedRecord,
      recommendedProjects
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await ResumeAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'Analysis record not found.' });

    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

const deleteAnalysis = async (req, res, next) => {
  try {
    await ResumeAnalysis.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resume analysis deleted.' });
  } catch (error) {
    next(error);
  }
};

const syncProfileSkills = async (req, res, next) => {
  try {
    const { skillsToAdd } = req.body; // array of skill strings
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const existingSkillNames = user.skills.map(s => s.name.toLowerCase());
    
    skillsToAdd.forEach(skillName => {
      if (!existingSkillNames.includes(skillName.toLowerCase())) {
        user.skills.push({ name: skillName, proficiency: 'Intermediate' });
      }
    });

    await user.save();

    res.json({
      message: `${skillsToAdd.length} skills synchronized to your profile!`,
      skills: user.skills
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  syncProfileSkills
};

const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  resumeText: { type: String, required: true },
  overallScore: { type: Number, required: true },
  scoreCategoryBreakdown: {
    skills: Number,
    projects: Number,
    experience: Number,
    education: Number,
    structure: Number,
    technicalDepth: Number,
    atsKeywords: Number,
    projectImpact: Number
  },
  skillsAnalysis: {
    strongSkills: [String],
    mentionedSkills: [String],
    missingRecommendedSkills: [String]
  },
  projectAnalysis: [{
    name: String,
    technologies: [String],
    score: Number,
    strengths: [String],
    improvements: [String]
  }],
  experienceAnalysis: [{
    role: String,
    company: String,
    duration: String,
    beforeWording: String,
    suggestedWording: String
  }],
  atsAnalysis: {
    coveragePercentage: Number,
    detectedKeywords: [String],
    recommendedKeywords: [String],
    weakPhrases: [String]
  },
  recommendations: [{
    priority: { type: String, enum: ['High', 'Medium', 'Low'] },
    title: String,
    problem: String,
    recommendation: String,
    whyItMatters: String,
    suggestedAction: String
  }],
  missingProfileSkills: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

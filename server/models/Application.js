const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedRole: { type: String, required: true },
  message: { type: String, default: '' },
  matchScore: { type: Number, default: 0 },
  matchBreakdown: {
    skillScore: { type: Number, default: 0 },
    roleScore: { type: Number, default: 0 },
    interestScore: { type: Number, default: 0 },
    availabilityScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 }
  },
  type: { type: String, enum: ['application', 'invitation'], default: 'application' },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn', 'Declined'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);

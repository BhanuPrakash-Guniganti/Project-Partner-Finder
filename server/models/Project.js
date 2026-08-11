const mongoose = require('mongoose');

const requiredRoleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  count: { type: Number, default: 1 },
  skills: [{ type: String }]
});

const projectSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Web Development' },
  type: { 
    type: String, 
    enum: ['Academic', 'Hackathon', 'Open Source', 'Research', 'Side Project', 'Startup', 'Other'], 
    default: 'Side Project' 
  },
  requiredRoles: [requiredRoleSchema],
  requiredSkills: [{ type: String }],
  optionalSkills: [{ type: String }],
  teamSize: { type: Number, default: 4 },
  duration: { type: String, default: '1-3 months' },
  availability: { type: String, default: '10-15 hrs/week' },
  deadline: { type: Date },
  visibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  status: { 
    type: String, 
    enum: ['Draft', 'Open', 'Team Forming', 'Team Complete', 'In Progress', 'Completed', 'Archived'], 
    default: 'Open' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);

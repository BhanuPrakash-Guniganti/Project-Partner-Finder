const mongoose = require('mongoose');

const requiredRoleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  count: { type: Number, default: 1 },
  skills: [{ type: String }]
});

const creatorSchema = new mongoose.Schema({
  participation: { type: Boolean, default: true },
  role: { type: String, default: 'Project Lead' },
  skills: [{ type: String }]
}, { _id: false });

const projectSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator: {
    type: creatorSchema,
    default: () => ({
      participation: true,
      role: 'Project Lead',
      skills: []
    })
  },
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
  startDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  phase: { 
    type: String, 
    enum: ['Ideation', 'Planning', 'MVP Development', 'Testing', 'Completed', 'Archived'], 
    default: 'Planning' 
  },
  projectGoals: { type: String, default: '' },
  goals: [{ type: String }],
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Intermediate' 
  },
  githubUrl: { type: String, default: '' },
  referenceUrl: { type: String, default: '' },
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

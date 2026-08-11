const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Upcoming', 'In Progress', 'Completed', 'Delayed'], 
    default: 'Upcoming' 
  },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Milestone', milestoneSchema);

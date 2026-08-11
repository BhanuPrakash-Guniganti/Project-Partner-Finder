const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['GitHub', 'Documentation', 'Google Drive', 'Research Paper', 'API', 'Other'], 
    default: 'Other' 
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);

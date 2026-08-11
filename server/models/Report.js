const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['User', 'Project'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { 
    type: String, 
    enum: ['Spam', 'Inappropriate content', 'Misleading information', 'Harassment', 'Other'],
    required: true 
  },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Reviewing', 'Resolved', 'Dismissed'], default: 'Pending' },
  adminNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);

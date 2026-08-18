const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Alias for backward compatibility
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For 1-on-1 direct message
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Alias for backward compatibility
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // For project group chat
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Alias for backward compatibility
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  message: { type: String },
  content: { type: String, required: true }, // Main message body text
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);

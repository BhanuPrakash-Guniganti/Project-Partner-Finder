const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open' 
  },
  emailSent: { type: Boolean, default: false },
  emailError: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

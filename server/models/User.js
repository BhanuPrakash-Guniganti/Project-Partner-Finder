const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    default: 'Intermediate' 
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  
  // Profile fields
  skills: [skillSchema],
  interests: [{ type: String }],
  availability: { type: String, default: '10-15 hrs/week' }, // e.g. '5-10 hrs/week', '10-15 hrs/week', '15-20 hrs/week', '20+ hrs/week'
  preferredRoles: [{ type: String }], // e.g. ['Frontend Developer', 'Backend Developer']
  projectPreferences: [{ type: String }], // e.g. ['Academic', 'Hackathon', 'Open Source', 'Startup']
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  
  links: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  
  onboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

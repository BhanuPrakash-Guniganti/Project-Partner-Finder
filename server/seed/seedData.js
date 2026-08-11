const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Resource = require('../models/Resource');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Report = require('../models/Report');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_partner_finder';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Application.deleteMany({}),
      Team.deleteMany({}),
      Task.deleteMany({}),
      Milestone.deleteMany({}),
      Resource.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      ResumeAnalysis.deleteMany({}),
      Report.deleteMany({})
    ]);

    console.log('[Seed] Cleared old data.');

    const passHash = await bcrypt.hash('Password123!', 10);

    // 1. Create Users
    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@student.edu',
      passwordHash: passHash,
      role: 'student',
      bio: 'Full-stack software engineering student passionate about React, Node.js, and clean web architecture.',
      skills: [
        { name: 'React', proficiency: 'Advanced' },
        { name: 'JavaScript', proficiency: 'Expert' },
        { name: 'Node.js', proficiency: 'Intermediate' },
        { name: 'MongoDB', proficiency: 'Intermediate' },
        { name: 'Tailwind CSS', proficiency: 'Advanced' }
      ],
      interests: ['Web Development', 'AI / ML', 'Open Source'],
      preferredRoles: ['Frontend Developer', 'Full Stack Developer'],
      availability: '10-15 hrs/week',
      experienceLevel: 'Intermediate',
      links: {
        github: 'https://github.com/alexrivera-dev',
        portfolio: 'https://alexrivera.dev'
      },
      onboardingCompleted: true
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@student.edu',
      passwordHash: passHash,
      role: 'student',
      bio: 'Computer Science student specializing in AI systems, backend microservices, and product development.',
      skills: [
        { name: 'Python', proficiency: 'Expert' },
        { name: 'Node.js', proficiency: 'Advanced' },
        { name: 'MongoDB', proficiency: 'Advanced' },
        { name: 'REST API', proficiency: 'Expert' },
        { name: 'FastAPI', proficiency: 'Intermediate' }
      ],
      interests: ['AI / ML', 'Startup', 'Research'],
      preferredRoles: ['Backend Developer', 'Machine Learning Engineer', 'Project Lead'],
      availability: '15-20 hrs/week',
      experienceLevel: 'Advanced',
      links: {
        github: 'https://github.com/sarahchen-ai'
      },
      onboardingCompleted: true
    });

    const marcus = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@student.edu',
      passwordHash: passHash,
      role: 'student',
      bio: 'UI/UX designer & frontend engineer creating sleek web applications and responsive interfaces.',
      skills: [
        { name: 'Figma', proficiency: 'Expert' },
        { name: 'React', proficiency: 'Advanced' },
        { name: 'Tailwind CSS', proficiency: 'Expert' },
        { name: 'TypeScript', proficiency: 'Intermediate' }
      ],
      interests: ['UI/UX', 'Hackathon', 'Web Development'],
      preferredRoles: ['UI/UX Designer', 'Frontend Developer'],
      availability: '10-15 hrs/week',
      experienceLevel: 'Intermediate',
      onboardingCompleted: true
    });

    const admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@partnerfinder.com',
      passwordHash: passHash,
      role: 'admin',
      bio: 'System Administrator & Content Moderator.',
      onboardingCompleted: true
    });

    console.log('[Seed] Created sample users (Alex, Sarah, Marcus, Admin).');

    // 2. Create Projects
    const projectAI = await Project.create({
      ownerId: sarah._id,
      title: 'AI Resume Analyzer & Matcher',
      description: 'Building an intelligent platform that parses PDF resumes using LLM APIs to match candidate profiles with tech project requirements and suggest profile enhancements.',
      category: 'Artificial Intelligence',
      type: 'Startup',
      requiredRoles: [
        { title: 'React Developer', count: 1, skills: ['React', 'Tailwind CSS', 'JavaScript'] },
        { title: 'Backend Developer', count: 1, skills: ['Node.js', 'Express', 'MongoDB'] },
        { title: 'ML Specialist', count: 1, skills: ['Python', 'LLM Prompt Engineering'] }
      ],
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Python', 'REST API'],
      optionalSkills: ['Tailwind CSS', 'Docker'],
      teamSize: 4,
      duration: '2-3 months',
      availability: '10-15 hrs/week',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Open'
    });

    const projectDev = await Project.create({
      ownerId: alex._id,
      title: 'DevSpace — Developer Portfolio Showcase',
      description: 'An open-source platform allowing student developers to showcase their projects, earn peer badges, and collaborate on open-source repositories.',
      category: 'Web Development',
      type: 'Open Source',
      requiredRoles: [
        { title: 'UI/UX Designer', count: 1, skills: ['Figma', 'UI Design'] },
        { title: 'Backend Developer', count: 1, skills: ['Node.js', 'PostgreSQL'] }
      ],
      requiredSkills: ['React', 'Tailwind CSS', 'Figma', 'JavaScript'],
      teamSize: 3,
      duration: '1-2 months',
      availability: '5-10 hrs/week',
      status: 'Open'
    });

    console.log('[Seed] Created sample projects.');

    // 3. Create Teams
    const teamAI = await Team.create({
      projectId: projectAI._id,
      members: [
        { userId: sarah._id, role: 'Project Lead / ML Specialist', isOwner: true },
        { userId: alex._id, role: 'React Developer', isOwner: false }
      ],
      status: 'Active'
    });

    // 4. Create Tasks for AI Project Workspace
    await Task.create([
      {
        projectId: projectAI._id,
        assignedTo: alex._id,
        createdBy: sarah._id,
        title: 'Build Interactive Resume Upload Dropzone',
        description: 'Design a drag-and-drop PDF uploader with real-time status indicators in React.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        projectId: projectAI._id,
        assignedTo: sarah._id,
        createdBy: sarah._id,
        title: 'Integrate Grok API Prompt Endpoint',
        description: 'Set up Express router with Grok API integration for PDF text extraction analysis.',
        status: 'Completed',
        priority: 'Urgent',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        projectId: projectAI._id,
        assignedTo: alex._id,
        createdBy: sarah._id,
        title: 'Implement Explainable Match Score Modal',
        description: 'Display percentage breakdown and natural language "Why this match?" list.',
        status: 'To Do',
        priority: 'Medium'
      }
    ]);

    // 5. Create Milestones
    await Milestone.create([
      {
        projectId: projectAI._id,
        title: 'Phase 1: Core Parsing & Engine',
        description: 'Complete PDF text extraction & deterministic matching formula.',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        progress: 65
      },
      {
        projectId: projectAI._id,
        title: 'Phase 2: Team Workspace & Chat',
        description: 'Enable real-time Socket.IO communication and Kanban board.',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'Upcoming',
        progress: 20
      }
    ]);

    // 6. Create Resources
    await Resource.create([
      {
        projectId: projectAI._id,
        name: 'GitHub Repository',
        url: 'https://github.com/project-partner-finder/ai-resume-analyzer',
        type: 'GitHub',
        addedBy: sarah._id
      },
      {
        projectId: projectAI._id,
        name: 'xAI Grok API Documentation',
        url: 'https://docs.x.ai/api',
        type: 'Documentation',
        addedBy: sarah._id
      }
    ]);

    // 7. Create Group Chat Messages
    await Message.create([
      {
        senderId: sarah._id,
        projectId: projectAI._id,
        content: 'Welcome to the project workspace team! Excited to work together.'
      },
      {
        senderId: alex._id,
        projectId: projectAI._id,
        content: 'Thanks Sarah! I have started working on the frontend resume uploader component.'
      }
    ]);

    // 8. Create Application
    await Application.create({
      projectId: projectAI._id,
      applicantId: alex._id,
      requestedRole: 'React Developer',
      message: 'Hi Sarah, I would love to build the frontend interface for the AI Resume Analyzer! I have strong React & Node experience.',
      matchScore: 88,
      status: 'Accepted'
    });

    console.log('[Seed] Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();

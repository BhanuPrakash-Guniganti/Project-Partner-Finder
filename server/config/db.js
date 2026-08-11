const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/project_partner_finder';

  // 1. Try Primary URI (MongoDB Atlas or custom URI from .env)
  if (primaryUri) {
    try {
      console.log(`[MongoDB] Connecting to Primary URI...`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB Primary Connection Notice] ${err.message}`);
    }
  }

  // 2. Try Local MongoDB Instance
  try {
    console.log(`[MongoDB] Connecting to local MongoDB (${localUri})...`);
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to local database: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB Local Connection Notice] ${err.message}`);
  }

  // 3. Fail-safe: Try MongoMemoryServer for 100% guaranteed working database
  try {
    console.log(`[MongoDB] Initializing MongoMemoryServer in-memory database...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Memory Server] In-memory database running successfully at: ${mongoUri}`);

    // Auto-seed in-memory database with sample test data so login/register work instantly!
    try {
      const bcrypt = require('bcryptjs');
      const User = require('../models/User');
      const passHash = await bcrypt.hash('Password123!', 10);
      await User.create([
        {
          name: 'Alex Rivera',
          email: 'alex@student.edu',
          passwordHash: passHash,
          role: 'student',
          bio: 'Full-stack developer.',
          skills: [{ name: 'React', proficiency: 'Advanced' }, { name: 'Node.js', proficiency: 'Intermediate' }],
          onboardingCompleted: true
        },
        {
          name: 'Sarah Chen',
          email: 'sarah@student.edu',
          passwordHash: passHash,
          role: 'student',
          bio: 'AI enthusiast.',
          onboardingCompleted: true
        },
        {
          name: 'Platform Admin',
          email: 'admin@partnerfinder.com',
          passwordHash: passHash,
          role: 'admin',
          onboardingCompleted: true
        }
      ]);
      console.log(`[MongoDB Memory Server] Auto-seeded demo accounts (alex@student.edu, sarah@student.edu, admin@partnerfinder.com).`);
    } catch (seedErr) {
      console.warn('[MongoDB Memory Server Seed Warning]', seedErr.message);
    }

    return conn;
  } catch (memErr) {
    console.error(`[MongoDB Critical Error] Failed to initialize in-memory database: ${memErr.message}`);
    return null;
  }
};

module.exports = connectDB;

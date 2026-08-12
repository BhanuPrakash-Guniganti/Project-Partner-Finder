const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const primaryUri = process.env.MONGODB_URI;

  // In production, strictly require process.env.MONGODB_URI and fail fast if Atlas is unreachable
  if (isProduction) {
    if (!primaryUri) {
      const errMessage = '[MongoDB Error] MONGODB_URI environment variable is missing in production.';
      console.error(errMessage);
      throw new Error(errMessage);
    }

    try {
      console.log(`[MongoDB] Connecting to MongoDB Atlas Cloud Database in production...`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 15000,
        dbName: 'project_partner_finder'
      });
      console.log(`[MongoDB] Connected successfully to Atlas: ${conn.connection.host}`);
      cachedConn = conn;
      return conn;
    } catch (err) {
      console.error(`[MongoDB Error] Connection to MongoDB Atlas failed: ${err.message}`);
      console.error(`[MongoDB Error] Production requires a persistent MongoDB Atlas connection.`);
      console.error(`[MongoDB Error] Application cannot continue without persistent database connectivity.`);
      throw err;
    }
  }

  // Development / Local Environment
  const localUri = 'mongodb://127.0.0.1:27017/project_partner_finder';

  // 1. Try process.env.MONGODB_URI in development if configured
  if (primaryUri) {
    try {
      console.log(`[MongoDB Dev] Connecting to configured MONGODB_URI...`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 15000,
        dbName: 'project_partner_finder'
      });
      console.log(`[MongoDB Dev] Connected successfully: ${conn.connection.host}`);
      cachedConn = conn;
      return conn;
    } catch (err) {
      console.warn(`[MongoDB Dev] Primary connection notice: ${err.message}`);
    }
  }

  // 2. Try Local MongoDB Instance
  try {
    console.log(`[MongoDB Dev] Connecting to local MongoDB (${localUri})...`);
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB Dev] Connected successfully to local database: ${conn.connection.host}`);
    cachedConn = conn;
    return conn;
  } catch (err) {
    console.warn(`[MongoDB Dev] Local connection notice: ${err.message}`);
  }

  // 3. Fail-safe for local dev/testing only
  try {
    console.log(`[MongoDB Dev] Initializing MongoMemoryServer for local development...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Memory Server Dev] In-memory development database running at: ${mongoUri}`);

    cachedConn = conn;
    return conn;
  } catch (memErr) {
    console.error(`[MongoDB Error] Failed to initialize in-memory development database: ${memErr.message}`);
    throw memErr;
  }
};

module.exports = connectDB;

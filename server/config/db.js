const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_partner_finder';
  const fallbackUri = 'mongodb://127.0.0.1:27017/project_partner_finder';

  // Disable bufferCommands globally so requests fail fast or use fallback if DB disconnected
  mongoose.set('bufferCommands', false);

  try {
    console.log(`[MongoDB] Connecting to primary URI...`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000 // 5 sec connection timeout
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Primary Connection Notice] ${error.message}`);
    
    if (primaryUri !== fallbackUri) {
      try {
        console.log(`[MongoDB] Attempting fallback to local MongoDB instance (${fallbackUri})...`);
        const fallbackConn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`[MongoDB Fallback] Connected to local database: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.warn(`[MongoDB Fallback Notice] Local MongoDB service is unavailable: ${fallbackErr.message}`);
      }
    }

    console.warn('[MongoDB] Running without active database connection (mock/in-memory mode active).');
    return null;
  }
};

module.exports = connectDB;

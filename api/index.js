const app = require('../server/app');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]', err);
    return res.status(500).json({
      message: 'Database connection failure. Persistent MongoDB database is unreachable.'
    });
  }
  return app(req, res);
};

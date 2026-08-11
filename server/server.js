const http = require('http');
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect Database & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Project Partner Finder Backend running on port ${PORT}`);
    console.log(`📡 Socket.IO Real-time Server active`);
    console.log(`====================================================`);
  });
});

const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const socketHandlers = require('./sockets/socketHandlers');

const PORT = process.env.PORT || 9999;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
});

// Initialize Socket event handlers
socketHandlers(io);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('✅ MongoDB Connected Successfully'))
        .catch(err => {
          console.error('❌ Server startup error (MongoDB):', err.message);
          console.warn('⚠️ Server is running without a database connection.');
        });
    } else {
      console.warn('⚠️ MONGODB_URI not provided. Running without database connection.');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Critical Server Error:', error.message);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

startServer();

// Trigger restart - Conflicting background process terminated. Port 5000 is now free.

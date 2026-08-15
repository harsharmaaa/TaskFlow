const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');


// Connect to Database
connectDB();


// Initialize express app
const app = express();

// Create HTTP server wrapping the Express app
const server = http.createServer(app);

// Configure CORS origin from env or fallback to local Vite dev server
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Express Middleware
app.use(cors({
  origin: clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io to the HTTP server with CORS configurations
const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Store io instance in Express app settings for controllers' access
app.set('io', io);

// Initialize socket handler
const initSocket = require('./sockets/socketHandler');
initSocket(io);

// Base API route
app.get('/', (req, res) => {
  res.json({ message: "TaskFlow API Running" });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// Global Error Handler
app.use(errorHandler);


// Listen using the HTTP server (not app.listen) on PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

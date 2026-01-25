import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { connectDatabase } from './database/database.js';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded avatars
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Example: Listen for chat messages
  socket.on('chat_message', (msg) => {
    io.emit('chat_message', msg); // Broadcast to all clients
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Galaxy Chat Hub!');
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// Start server
async function startServer() {
  await connectDatabase(); // ⬅ DB first

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

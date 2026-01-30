import "./env.js"; 
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { prisma } from './database/database.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
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
  console.log('User connected:', socket.id);

  // 1. Join a specific conversation room
  socket.on('join_dm', ({ currentUserId, targetUserId }) => {
    // Create a unique room ID for this pair
    const roomId = [currentUserId, targetUserId].sort().join('_');
    socket.join(roomId);
    console.log(`User ${currentUserId} joined room ${roomId}`);
  });

  // 2. Handle sending messages
  socket.on('send_dm', async ({ senderId, receiverId, content }) => {
    try {
      // A. Save to Database (Prisma)
      const newMessage = await prisma.directMessage.create({
        data: {
          content,
          senderId,
          receiverId
        },
        include: {
          sender: true // Optional: Sender Details
        }
      });

      // B. Broadcast to the specific room
      const roomId = [senderId, receiverId].sort().join('_');
      io.to(roomId).emit('receive_dm', newMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      // Optional: Emit error back to sender
      socket.emit('message_error', { error: 'Failed to send' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Galaxy Chat Hub!');
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/rooms', roomRoutes);


// Start server
async function startServer() {
  await connectDatabase(); // ⬅ DB first

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

import 'dotenv/config';
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

// Attach IO to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
    const roomId = [parseInt(currentUserId), parseInt(targetUserId)].sort().join('_');
    socket.join(roomId);
    console.log(`User ${currentUserId} joined room ${roomId}`);
  });

  // 2. Handle sending messages
  socket.on('send_dm', async ({ senderId, receiverId, content }, callback) => {
    try {
      const sId = parseInt(senderId);
      const rId = parseInt(receiverId);

      // A. Save to Database (Prisma)
      const newMessage = await prisma.directMessage.create({
        data: {
          content,
          senderId: sId,
          receiverId: rId
        },
        include: {
          sender: true // Optional: Sender Details
        }
      });

      // B. Broadcast to the specific room
      const roomId = [sId, rId].sort().join('_');
      io.to(roomId).emit('receive_dm', newMessage);
      
      if (callback) callback({ status: 'ok', data: newMessage });

    } catch (error) {
      console.error('Error sending message:', error);
      // Optional: Emit error back to sender
      socket.emit('message_error', { error: 'Failed to send' });
      if (callback) callback({ status: 'error' });
    }
  });

  // 3. Join Group Room
  socket.on('join_room', ({ roomId }) => {
    const roomName = `group_${parseInt(roomId)}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined ${roomName}`);
  });

  // 4. Send Group Message
  socket.on('send_room_message', async ({ roomId, content, userId }, callback) => {
     try {
       const message = await prisma.message.create({
         data: {
           content,
           roomId: parseInt(roomId),
           userId: parseInt(userId)
         },
         include: {
           user: {
             select: { id: true, username: true, avatarUrl: true }
           }
         }
       });
       io.to(`group_${roomId}`).emit('receive_room_message', message);
       if (callback) callback({ status: 'ok', data: message });
     } catch(e) {
       console.error("Error sending room message:", e);
       if (callback) callback({ status: 'error' });
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

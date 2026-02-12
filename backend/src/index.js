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

// Helper to normalize origins (remove trailing slashes)
const normalizeOrigin = (url) => url ? url.replace(/\/$/, "") : "";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173", // Explicitly added from error message
  "https://galaxy-gch.vercel.app/", 
  "https://galaxy-chat-hub.vercel.app/", // Potential other Vercel URL
  normalizeOrigin(process.env.CLIENT_URL)     // Environment variable
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
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

const onlineUsers = new Map(); // uId -> Set of socketIds
const offlineTimeouts = new Map(); // uId -> setTimeout reference

// Socket.IO connection handler
io.on('connection', (socket) => {
  
  socket.on('register_user', async (userId) => {
    if (!userId) return;
    const uId = parseInt(userId);
    if (isNaN(uId)) return;

    socket.data.userId = uId;

    // 1. CANCEL PENDING OFFLINE STATUS
    // If the user refreshed, they re-connected before the 5s timer finished.
    if (offlineTimeouts.has(uId)) {
      clearTimeout(offlineTimeouts.get(uId));
      offlineTimeouts.delete(uId);
      console.log(`User ${uId} reconnected quickly. Cancelled offline status.`);
    }

    // 2. TRACK SOCKET
    if (!onlineUsers.has(uId)) {
      onlineUsers.set(uId, new Set());
    }
    const sockets = onlineUsers.get(uId);
    sockets.add(socket.id);

    // 3. UPDATE DB ONLY IF NECESSARY
    if (sockets.size === 1) {
      try {
        await prisma.user.update({
          where: { id: uId },
          data: { status: 'ONLINE' }
        });
        io.emit('user_status_change', { userId: uId, status: 'online' });
      } catch (e) {
        console.error("Status update error", e);
      }
    }
  });


  

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

socket.on('disconnect', async () => {
    const uId = socket.data.userId;
    if (!uId) return;

    const sockets = onlineUsers.get(uId);
    if (!sockets) return;

    sockets.delete(socket.id);

    if (sockets.size === 0) {
      // ⬇️ CRITICAL FIX: Clear any existing timer for this user first
      if (offlineTimeouts.has(uId)) {
        clearTimeout(offlineTimeouts.get(uId));
      }

      const timeout = setTimeout(async () => {
        const currentSockets = onlineUsers.get(uId);
        // Double check: are they STILL disconnected?
        if (!currentSockets || currentSockets.size === 0) {
          onlineUsers.delete(uId);
          try {
            await prisma.user.update({
              where: { id: uId },
              data: { status: 'OFFLINE' }
            });
            io.emit('user_status_change', { userId: uId, status: 'offline' });
            console.log(`User ${uId} is now officially OFFLINE`);
          } catch (e) {
            console.error("Disconnect status update error", e);
          }
        }
        offlineTimeouts.delete(uId);
      }, 5000);

      offlineTimeouts.set(uId, timeout);
    }
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

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import { authenticateSocket } from './middleware/auth.js';
import { initializeDatabase } from './database/init.js';
import { saveMessage, getMessages } from './database/messages.js';
import { getUserById } from './database/users.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
await initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user to their own room
  socket.join(socket.userId);

  // Handle joining a conversation
  socket.on('join_conversation', async (data) => {
    const { otherUserId } = data;
    const conversationId = [socket.userId, otherUserId].sort().join('_');
    socket.join(conversationId);
    
    // Send previous messages
    try {
      const messages = await getMessages(socket.userId, otherUserId);
      socket.emit('previous_messages', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('error', { message: 'Failed to load messages' });
    }
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, content } = data;
      
      // Validate input
      if (!receiverId || !content || content.trim().length === 0) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      // Check if receiver exists
      const receiver = await getUserById(receiverId);
      if (!receiver) {
        socket.emit('error', { message: 'Receiver not found' });
        return;
      }

      // Save message to database
      const message = await saveMessage(socket.userId, receiverId, content.trim());
      
      // Send to conversation room
      const conversationId = [socket.userId, receiverId].sort().join('_');
      io.to(conversationId).emit('new_message', message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit('user_typing', { userId: socket.userId });
  });

  socket.on('typing_stop', (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit('user_stopped_typing', { userId: socket.userId });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, User, Notification } = require('./db');
const { authMiddleware, authorize } = require('./middleware/auth');

// Controllers
const authController = require('./controllers/authController');
const ticketController = require('./controllers/ticketController');
const kbController = require('./controllers/kbController');
const aiController = require('./controllers/aiController');
const analyticsController = require('./controllers/analyticsController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Setup
// 1. Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, authController.getMe);
app.get('/api/users', authMiddleware, authorize(['Admin']), authController.getAllUsers);
app.put('/api/users/:id/approve', authMiddleware, authorize(['Admin']), authController.approveUser);

// 2. Ticket routes
app.post('/api/tickets', authMiddleware, ticketController.createTicket);
app.get('/api/tickets', authMiddleware, ticketController.getTickets);
app.get('/api/tickets/:id', authMiddleware, ticketController.getTicketById);
app.put('/api/tickets/:id', authMiddleware, ticketController.updateTicket);
app.post('/api/tickets/:id/comments', authMiddleware, ticketController.addComment);

// 3. Knowledge Base routes
app.get('/api/kb', kbController.getArticles);
app.get('/api/kb/:id', kbController.getArticleById);
app.put('/api/kb/:id/helpful', kbController.voteHelpful);

// 4. AI helper routes
app.post('/api/ai/analyze', aiController.analyzeTicket);
app.post('/api/ai/chat', aiController.chatAssistant);

// 5. Analytics routes (Admin-only)
app.get('/api/analytics', authMiddleware, authorize(['Admin']), analyticsController.getDashboardStats);

// 6. Notification routes
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    // Sort by newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading notifications' });
  }
});

app.put('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    for (let notif of notifications) {
      const id = notif.id || notif._id;
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notifications' });
  }
});

// 7. IT Staff list route (for ticket assignment)
app.get('/api/users/staff', authMiddleware, authorize(['Admin', 'IT Staff']), async (req, res) => {
  try {
    const staffMembers = await User.find({ role: 'IT Staff' });
    const formatted = staffMembers.map(u => ({
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      department: u.department
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error loading IT staff list' });
  }
});

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HindConnect Enterprise IT Support API' });
});

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`HindConnect server running on port ${PORT}`);
  });
};

startServer();

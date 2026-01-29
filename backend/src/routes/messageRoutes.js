import express from 'express';
import { getMessages, getConversations, deleteConversation } from '../controllers/messageController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/messages/conversations - Before /:userId
router.get('/conversations', isAuthenticated, getConversations);
// GET /api/messages/:userId
router.get('/:userId', isAuthenticated, getMessages);
// DELETE /api/messages/:userId
router.delete('/:userId', isAuthenticated, deleteConversation);


export default router;

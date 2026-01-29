import express from 'express';
import { createRoom, getUserRooms, getRoomMessages, deleteRoom } from '../controllers/roomController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', isAuthenticated, createRoom);
router.get('/', isAuthenticated, getUserRooms);
router.get('/:roomId/messages', isAuthenticated, getRoomMessages);
router.delete('/:roomId', isAuthenticated, deleteRoom);

export default router;

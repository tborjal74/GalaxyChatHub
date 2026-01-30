import express from 'express';
import { createRoom, getUserRooms, getRoomMessages, deleteRoom, leaveRoom, addMember, getRoomMembers } from '../controllers/roomController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', isAuthenticated, createRoom);
router.get('/', isAuthenticated, getUserRooms);
router.get('/:roomId/messages', isAuthenticated, getRoomMessages);
router.delete('/:roomId', isAuthenticated, deleteRoom);
router.post('/:roomId/leave', isAuthenticated, leaveRoom);
router.post('/:roomId/members', isAuthenticated, addMember);
router.get('/:roomId/members', isAuthenticated, getRoomMembers);

export default router;

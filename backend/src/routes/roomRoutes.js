import express from 'express';
import { createRoom, getRooms } from '../controllers/roomController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', isAuthenticated, createRoom);
router.get('/', isAuthenticated, getRooms);

export default router;

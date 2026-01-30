import express from 'express';
import { getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest } from '../controllers/friendController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', isAuthenticated, getFriends);
router.get('/requests', isAuthenticated, getFriendRequests);
router.post('/request', isAuthenticated, sendFriendRequest);
router.post('/accept', isAuthenticated, acceptFriendRequest);

export default router;

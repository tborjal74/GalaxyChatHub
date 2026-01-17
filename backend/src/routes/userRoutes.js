// routes/userRoutes.js
import express from 'express';
import { getUsers, getUser, createUser } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply middleware globally to this router or specific routes
// router.use(isAuthenticated);

router.get('/', isAuthenticated, getUsers);
router.get('/:id', isAuthenticated, getUser);
router.post('/', isAuthenticated, createUser);

export default router;

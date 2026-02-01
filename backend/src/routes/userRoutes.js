// routes/userRoutes.js
import express from 'express';
import { getUsers, getUser, createUser, deleteUserById, uploadUserAvatar, getMe, updateMe, changePassword } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { uploadAvatar } from "../middlewares/uploadAvatarMiddleware.js";

const router = express.Router();

// Apply middleware globally to this router or specific routes
// router.use(isAuthenticated);

router.get('/', isAuthenticated, getUsers);
router.get('/me', isAuthenticated, getMe);
router.put("/me", isAuthenticated, uploadAvatar.single("avatar"), updateMe);
router.get('/:id', isAuthenticated, getUser);
router.post('/', isAuthenticated, createUser);
router.delete('/', isAuthenticated, deleteUserById);
router.post(
  '/avatar',
  isAuthenticated,
  uploadAvatar.single("avatar"),
  uploadUserAvatar
);
router.post('/change-password', isAuthenticated, changePassword)

export default router;

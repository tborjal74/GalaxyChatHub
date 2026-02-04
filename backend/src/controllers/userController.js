// controllers/userController.js
import * as userService from '../services/userService.js';
import { prisma } from '../database/database.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return successResponse(res, users, "Users retrieved successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch users", 500, error);
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user, "User retrieved successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch user", 500, error);
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    return successResponse(res, newUser, "User created successfully", 201);
  } catch (error) {
    return errorResponse(res, "Failed to create user", 500, error);
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const id = req.user.userId;

    const deletedUser = await userService.deleteUserById(id);

    if (!deletedUser) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(
      res,
      null,
      "User deleted successfully",
      200
    );
  } catch (error) {
    return errorResponse(res, "Failed to delete user", 500, error);
  }
};

export const uploadUserAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return errorResponse(res, "No file uploaded", 400);
    }

    // Use the Cloudinary URL directly
    const avatarUrl = req.file.path; 

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return successResponse(res, {
      avatarUrl: updatedUser.avatarUrl,
    }, "Avatar updated successfully");

  } catch (error) {
    return errorResponse(res, "Failed to upload avatar", 500, error);
  }
};


export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user, "User loaded");
  } catch (err) {
    return errorResponse(res, "Failed to load user", 500, err);
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      username,
      email,
      bio,
      removeAvatar,
    } = req.body || {};

    const data = {};

    if (username) data.username = username;
    if (email) data.email = email;
    if (bio !== undefined) data.bio = bio;

    // Avatar upload
    if (req.file) {
      // Use the Cloudinary URL directly
      data.avatarUrl = req.file.path;
    }

    // Avatar removal
    if (removeAvatar === "true") {
      data.avatarUrl = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return successResponse(
      res,
      updatedUser,
      "Profile updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update profile", 500, error);
  }
};

export async function changePassword(req, res) {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

    // ---- PASSWORD VALIDATION ----
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,12}$/;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be 8–12 characters, contain at least 1 number and 1 special character",
    });
  }
  // -----------------------------

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const match = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!match) {
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
    },
  });

  return res.json({ success: true });
}







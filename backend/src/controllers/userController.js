// controllers/userController.js
import * as userService from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

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

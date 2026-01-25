// services/userService.js
import { users } from '../models/userModel.js';
import { prisma } from "../database/database.js";

export const getAllUsers = async () => {
  // Simulate database delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(users), 100);
  });
};

export const getUserById = async (id) => {
  return new Promise((resolve) => {
    const user = users.find(u => u.id === parseInt(id));
    setTimeout(() => resolve(user), 100);
  });
};

export const createUser = async (userData) => {
  return new Promise((resolve) => {
    const newUser = { id: users.length + 1, ...userData };
    users.push(newUser);
    setTimeout(() => resolve(newUser), 100);
  });
};

export const deleteUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  if (!user) return null;

  return prisma.user.delete({
    where: { id: Number(id) },
  });
};



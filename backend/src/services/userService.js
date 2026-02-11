// services/userService.js
import { users } from '../models/userModel.js';
import { prisma } from "../database/database.js";

export const getAllUsers = async (query = "") => {
  const where = query
    ? {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      status: true,
    },
    take: 20,
  });
};

export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      avatarUrl: true,
      status: true
    }
  });
};

export const createUser = async (userData) => {
  // This is mostly handled by authController now, but kept for admin/internal usage if needed
  return await prisma.user.create({
    data: userData
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



import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createRoom = async (req, res) => {
  const { name, isPrivate } = req.body;
  try {
    const room = await prisma.room.create({
      data: {
        name,
        isPrivate: isPrivate ?? false,
      },
    });
    res.json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

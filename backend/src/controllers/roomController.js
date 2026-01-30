import { prisma } from "../database/database.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createRoom = async (req, res) => {
  try {
    const { name, members } = req.body; // members is array of userIds
    const currentUserId = req.user.userId;

    if (!name) {
      return errorResponse(res, "Room name is required", 400);
    }

    // Prepare member list (creator + selected friends)
    // members should be an array of IDs.
    const memberIds = new Set([currentUserId]);
    if (Array.isArray(members)) {
      members.forEach(id => memberIds.add(parseInt(id)));
    }

    const room = await prisma.room.create({
      data: {
        name,
        members: {
          create: Array.from(memberIds).map(userId => ({
            userId
          }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    return successResponse(res, room, "Room created successfully");
  } catch (error) {
    console.error("Error creating room:", error);
    return errorResponse(res, "Failed to create room", 500);
  }
};

export const getUserRooms = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: currentUserId
          } // User is a member
        }
      },
      include: {
        members: {
           include: {
             user: {
               select: {
                 id: true,
                 username: true,
                 avatarUrl: true
               }
             }
           }
        },
        _count: {
            select: { messages: true }
        }
        // Could order by last message time if we had it on Room or related
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return successResponse(res, rooms, "Rooms retrieved successfully");
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    return errorResponse(res, "Failed to fetch rooms", 500);
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.userId;

    if (!roomId) return errorResponse(res, "Room ID required", 400);

    // Check membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: currentUserId,
          roomId: parseInt(roomId)
        }
      }
    });

    if (!membership) {
      return errorResponse(res, "Not a member of this room", 403);
    }

    const messages = await prisma.message.findMany({
      where: { roomId: parseInt(roomId) },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    return successResponse(res, messages, "Messages fetched");
  } catch (error) {
    console.error("Error fetching room messages:", error);
    return errorResponse(res, "Failed to fetch messages", 500);
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.userId;

    if (!roomId) return errorResponse(res, "Room ID required", 400);

    // Verify membership first
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
            userId: currentUserId,
            roomId: parseInt(roomId)
        }
      }
    });

    if (!membership) return errorResponse(res, "Not authorized", 403);

    // Notify all clients in the room
    if (req.io) {
        req.io.to(`group_${roomId}`).emit('room_deleted', { 
            roomId: parseInt(roomId),
            deleterId: currentUserId
        });
    }

    // Delete the room (Cascade will handle members and messages)
    await prisma.room.delete({
        where: { id: parseInt(roomId) }
    });

    return successResponse(res, null, "Room deleted successfully");
  } catch (error) {
    console.error("Error deleting room:", error);
    return errorResponse(res, "Failed to delete room", 500);
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.userId;

    if (!roomId) return errorResponse(res, "Room ID required", 400);

    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: currentUserId,
          roomId: parseInt(roomId)
        }
      },
      include: {
        user: true
      }
    });

    if (!membership) return errorResponse(res, "Not a member", 400);

    // Create system message
    const systemMsg = await prisma.message.create({
      data: {
        roomId: parseInt(roomId),
        userId: currentUserId,
        content: `SYSTEM:${membership.user.username} left the group`
      },
      include: {
        user: {
            select: {
                id: true,
                username: true,
                avatarUrl: true
            }
        }
      }
    });

    // Notify room
    if (req.io) {
       req.io.to(`group_${roomId}`).emit('receive_room_message', systemMsg);
    }

    // Remove member
    await prisma.roomMember.delete({
      where: {
        userId_roomId: {
          userId: currentUserId,
          roomId: parseInt(roomId)
        }
      }
    });

    return successResponse(res, null, "Left room successfully");

  } catch (error) {
    console.error("Error leaving room:", error);
    return errorResponse(res, "Failed to leave room", 500);
  }
};

export const addMember = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    if (!roomId || !userId) return errorResponse(res, "Missing parameters", 400);

    // Verify requester is member
    const requesterMembership = await prisma.roomMember.findUnique({
      where: {
         userId_roomId: {
             userId: currentUserId,
             roomId: parseInt(roomId)
         }
      }
    });
    if(!requesterMembership) return errorResponse(res, "Not authorized", 403);

    // Check if simple check user exists or is already member
    const existingMember = await prisma.roomMember.findUnique({
        where: {
            userId_roomId: {
                userId: parseInt(userId),
                roomId: parseInt(roomId)
            }
        }
    });

    if (existingMember) return errorResponse(res, "User already in room", 400);
    
    // Add member
    await prisma.roomMember.create({
        data: {
            userId: parseInt(userId),
            roomId: parseInt(roomId)
        }
    });

    const userToAdd = await prisma.user.findUnique({ where: { id: parseInt(userId) }});

    // Create system message
    const systemMsg = await prisma.message.create({
      data: {
        roomId: parseInt(roomId),
        userId: parseInt(userId), 
        // Using "SYSTEM:" prefix to denote system messages for frontend parsing
        content: `SYSTEM:${userToAdd.username} has been added to the group`
      },
      include: {
        user: {
            select: {
                id: true,
                username: true,
                avatarUrl: true
            }
        }
      }
    });

    if (req.io) {
        req.io.to(`group_${roomId}`).emit('receive_room_message', systemMsg);
    }

    return successResponse(res, null, "Member added");

  } catch (error) {
     console.error("Error adding member:", error);
     return errorResponse(res, "Failed to add member", 500);
  }
};

export const getRoomMembers = async (req, res) => {
    try {
        const { roomId } = req.params;
        const currentUserId = req.user.userId;

        // Verify membership
        const membership = await prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId: currentUserId,
                    roomId: parseInt(roomId)
                }
            }
        });
        if(!membership) return errorResponse(res, "Not authorized", 403);

        const members = await prisma.roomMember.findMany({
            where: { roomId: parseInt(roomId) },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        status: true
                    }
                }
            }
        });
        
        // Flatten structure if needed, or return as is.
        const activeMembers = members.map(m => m.user);

        return successResponse(res, activeMembers, "Members fetched");

    } catch(error) {
        console.error("Error fetching members:", error);
        return errorResponse(res, "Failed to fetch members", 500);
    }
};



import { prisma } from "../database/database.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// List all friends (Accepted only)
export const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;

    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true, status: true } },
        receiver: { select: { id: true, username: true, avatarUrl: true, status: true } }
      }
    });

    // Map to get the "other" person
    const friendList = friends.map(f => f.senderId === userId ? f.receiver : f.sender);

    return successResponse(res, friendList, "Friends retrieved");
  } catch (error) {
    return errorResponse(res, "Failed to fetch friends", 500, error);
  }
};

// List pending requests (Incoming AND Outgoing)
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Incoming requests (people asking me)
    const incoming = await prisma.friend.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING'
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } }
      }
    });

    // Outgoing requests
    // This allows User A to see they have already sent a request
    const outgoing = await prisma.friend.findMany({
        where: {
            senderId: userId,
            status: 'PENDING'
        },
        include: {
            receiver: { select: { id: true, username: true, avatarUrl: true } }
        }
    });

    return successResponse(res, { incoming, outgoing }, "Friend requests retrieved");
  } catch (error) {
    return errorResponse(res, "Failed to fetch requests", 500, error);
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
    try {
      const senderId = req.user.userId;
      const { username } = req.body;
  
      const receiver = await prisma.user.findUnique({ where: { username } });
      if (!receiver) return errorResponse(res, "User not found", 404);
      if (receiver.id === senderId) return errorResponse(res, "Cannot add yourself", 400);
  
      const existing = await prisma.friend.findFirst({
        where: {
          OR: [
            { senderId, receiverId: receiver.id },
            { senderId: receiver.id, receiverId: senderId }
          ]
        }
      });
  
      if (existing) return errorResponse(res, "Friendship or request already exists", 400);
  
      await prisma.friend.create({
        data: {
          senderId,
          receiverId: receiver.id,
          status: 'PENDING'
        }
      });
  
      return successResponse(res, null, "Friend request sent");
    } catch (error) {
      console.log(error);
      return errorResponse(res, "Failed to send request", 500, error);
    }
  };

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { requestId } = req.body;
  
      const friendship = await prisma.friend.findUnique({
        where: { id: requestId }
      });
  
      if (!friendship || friendship.receiverId !== userId) {
        return errorResponse(res, "Request not found or unauthorized", 404);
      }
  
      await prisma.friend.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' }
      });
  
      return successResponse(res, null, "Friend request accepted");
    } catch (error) {
      return errorResponse(res, "Failed to accept request", 500, error);
    }
  };

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { requestId } = req.body;
  
      const friendship = await prisma.friend.findUnique({
        where: { id: requestId }
      });
  
      if (!friendship || friendship.receiverId !== userId) {
        return errorResponse(res, "Request not found or unauthorized", 404);
      }
  
      await prisma.friend.delete({
        where: { id: requestId }
      });
  
      return successResponse(res, null, "Friend request rejected");
    } catch (error) {
      return errorResponse(res, "Failed to reject request", 500, error);
    }
  };

// Remove a friend
export const removeFriend = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { friendId } = req.body;
  
      const friendUserId = parseInt(friendId);
      if (isNaN(friendUserId)) return errorResponse(res, "Invalid friend ID", 400);

      // Find the friendship
      const friendship = await prisma.friend.findFirst({
        where: {
            OR: [
                { senderId: userId, receiverId: friendUserId, status: 'ACCEPTED' },
                { senderId: friendUserId, receiverId: userId, status: 'ACCEPTED' }
            ]
        }
      });
  
      if (!friendship) {
        return errorResponse(res, "Friendship not found", 404);
      }
  
      await prisma.friend.delete({
        where: { id: friendship.id }
      });
  
      return successResponse(res, null, "Friend removed successfully");
    } catch (error) {
        console.log(error);
      return errorResponse(res, "Failed to remove friend", 500, error);
    }
  };

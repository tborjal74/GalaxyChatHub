import { useEffect, useState } from "react";
import { AuthPage } from "./components/authPage";
import { Sidebar } from "./components/sideBar";
import { ProfileView } from "./components/profile/ProfileView";
import { FriendsView } from "./components/FriendsView";
import { ChatArea } from "./components/ChatArea";
import { socket } from "./socket";
import "./App.css";


/**
 * Types
 */
interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  joinedDate: Date;
  avatarUrl?: string;
}


interface Friend {
  id: string;
  username: string;
  avatarUrl?: string;
  status: "online" | "offline";
  unreadMessages?: number;   // optional
}


interface Room {
  id: string;
  name: string;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date | string;
  room?: string;
  receiverId?: string;
}

/**
 * App component
 */
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<"friends" | "rooms" | "profile">(
    "friends"
  );
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<Record<string, Message[]>>({});
  const [dmMessages, setDmMessages] = useState<Record<string, Message[]>>({});

  /**
   * Restore session on mount
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.username && parsedUser.email) {
          setCurrentUser({
            ...parsedUser,
            joinedDate: parsedUser.createdAt ? new Date(parsedUser.createdAt) : new Date(),
          });
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  /**
   * Load current user from API (if token present)
   */
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/users/me/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser({
          ...data.data,
          joinedDate: new Date(data.data.createdAt),
        });
        // persist minimal user for other components
        localStorage.setItem("user", JSON.stringify(data.data));
      }
    } catch (err) {
      console.error("Failed to load user", err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Socket connection lifecycle and listeners
   * - Keep hooks at top level (no nested hooks)
   */
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("Socket connected!");
    }
    function onDisconnect() {
      setIsConnected(false);
      console.log("Socket disconnected!");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Connect socket only when we have a current user
    if (currentUser && !socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // do not forcibly disconnect here if you want socket to persist across routes;
      // but to be safe on unmount we disconnect
      socket.disconnect();
    };
  }, [currentUser]);

  /**
   * Fetch friends (top-level effect)
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchFriends = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:3000/api/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          // Normalize shape if needed
          setFriends(
            (data.data || []).map((f: any) => ({
              id: String(f.id),
              username: f.username,
              avatarUrl: f.avatarUrl,
              status: f.status === "online" ? "online" : "offline", // normalize
              unreadMessages: f.unreadMessages ?? 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch friends", err);
      }
    };

    fetchFriends();
  }, []);

  /**
   * Fetch rooms (conversations)
   */
  const fetchRooms = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRooms(
          (data.data || []).map((r: any) => ({
            id: String(r.id),
            name: r.name,
            unread: r.unread ?? 0,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to fetch rooms", e);
    }
  };

  useEffect(() => {
    if (currentUser) fetchRooms();
  }, [currentUser, activeView]);

  /**
   * Helper for auth headers
   */
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  /**
   * Handlers required by Sidebar / ChatArea / FriendsView
   */

  // Create room placeholder (implement API call as needed)
  const handleCreateRoom = async (roomName: string) => {
    if (!roomName || !currentUser) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });
      const data = await res.json();
      if (data.success) {
        // refresh rooms
        await fetchRooms();
      } else {
        console.warn("Failed to create room", data);
      }
    } catch (err) {
      console.error("handleCreateRoom error", err);
    }
  };

  // Select a friend (from FriendsView or Sidebar)
  const handleSelectFriend = (friendOrId: Friend | string) => {
    if (!friendOrId) return;
    const friend =
      typeof friendOrId === "string"
        ? friends.find((f) => f.id === friendOrId) ?? null
        : friendOrId;
    setSelectedFriend(friend);
    setSelectedRoom(null);
    setActiveView("rooms");
  };

  // Select a room: join socket room, fetch history, clear unread locally and on server
  const handleRoomSelect = async (roomId: string) => {
    if (!roomId || !currentUser) return;

    setSelectedRoom(roomId);
    setSelectedFriend(null);

    // join socket room for real-time updates
    socket.emit("join_room", { room: roomId, userId: currentUser.id });

    // optimistic local clear of unread
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, unread: 0 } : r)));

    try {
      // fetch messages for the room
      const res = await fetch(
        `http://localhost:3000/api/room/${encodeURIComponent(roomId)}`,
        {
          headers: { ...authHeaders(), "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.success) {
        setRoomMessages((prev) => ({ ...prev, [roomId]: data.data || [] }));
      } else {
        console.warn("Failed to fetch room history", data);
      }

      // clear unread on server
      await fetch(
        `http://localhost:3000/api/messages/room/${encodeURIComponent(roomId)}/clear-unread`,
        {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id }),
        }
      );
    } catch (err) {
      console.error("handleRoomSelect error", err);
    }
  };

  // Send a room message (optimistic + persist + socket)
  const handleSendRoomMessage = async (content: string) => {
    if (!selectedRoom || !currentUser || !content.trim()) return;

    const roomId = selectedRoom;
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUser.id ?? "unknown",
      senderName: currentUser.username,
      content,
      timestamp: new Date(),
      room: roomId,
    };

    setRoomMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), optimisticMessage],
    }));

    socket.emit("send_room", {
      senderId: currentUser.id,
      room: roomId,
      content,
    });

    try {
      const res = await fetch(
        `http://localhost:3000/api/messages/room/${encodeURIComponent(roomId)}`,
        {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: currentUser.id, content }),
        }
      );
      const data = await res.json();
      if (data.success && data.message) {
        setRoomMessages((prev) => ({
          ...prev,
          [roomId]: (prev[roomId] || []).map((m) => (m.id === tempId ? data.message : m)),
        }));
      } else {
        throw new Error("Server failed to save message");
      }
    } catch (err) {
      console.error("Failed to persist room message", err);
      setRoomMessages((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter((m) => m.id !== tempId),
      }));
    }
  };

  // Send a DM message (optimistic + persist + socket)
  const handleSendDmMessage = async (content: string) => {
    if (!selectedFriend || !currentUser || !content.trim()) return;

    const friendId = selectedFriend.id;
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUser.id ?? "unknown",
      senderName: currentUser.username,
      content,
      timestamp: new Date(),
      receiverId: friendId,
    };

    setDmMessages((prev) => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), optimisticMessage],
    }));

    socket.emit("send_dm", {
      senderId: currentUser.id,
      receiverId: friendId,
      content,
    });

    try {
      const res = await fetch(
        `http://localhost:3000/api/messages/${encodeURIComponent(friendId)}`,
        {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: currentUser.id, receiverId: friendId, content }),
        }
      );
      const data = await res.json();
      if (data.success && data.message) {
        setDmMessages((prev) => ({
          ...prev,
          [friendId]: (prev[friendId] || []).map((m) => (m.id === tempId ? data.message : m)),
        }));
      } else {
        throw new Error("Server failed to save DM");
      }
    } catch (err) {
      console.error("Failed to persist DM", err);
      setDmMessages((prev) => ({
        ...prev,
        [friendId]: (prev[friendId] || []).filter((m) => m.id !== tempId),
      }));
    }
  };

  /**
   * Logout handler
   */
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socket.disconnect();
  };

  /**
   * Profile update handler
   */
  const handleUpdateProfile = async (updates: Partial<User> & { avatar?: File | null }) => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    const formData = new FormData();
    if (updates.username) formData.append("username", updates.username);
    if (updates.email) formData.append("email", updates.email);
    if (updates.bio) formData.append("bio", updates.bio);
    if (updates.avatar instanceof File) formData.append("avatar", updates.avatar);
    if (updates.avatar === null) formData.append("removeAvatar", "true");

    try {
      const res = await fetch("http://localhost:3000/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser({
          ...data.data,
          joinedDate: new Date(data.data.createdAt),
        });
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  /**
   * Login callback (used by AuthPage)
   */
  const handleLogin = () => {
    loadUser();
  };

  /**
   * Render
   */
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="fixed top-2 right-2 z-50">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </div>

      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={(v) => setActiveView(v)}
        onLogout={handleLogout}
        rooms={rooms}
        onRoomSelect={handleRoomSelect}
        selectedRoom={selectedRoom}
        onCreateRoom={handleCreateRoom}
        friends={friends}
        onSelectFriend={(idOrFriend) => handleSelectFriend(idOrFriend as any)}
        selectedFriend={selectedFriend?.id}
      />

      {activeView === "friends" && (
        <FriendsView
          onChatSelect={(friend) => {
            setSelectedFriend(friend);
            setActiveView("rooms");
          }}
        />
      )}

      {activeView === "rooms" && (
        <ChatArea
          currentUserId={currentUser.id ?? ""}
          selectedFriend={selectedFriend}
          onMessageSent={() => {
            // refresh rooms list when a message is sent (to update unread counts)
            fetchRooms();
          }}
          isConnected={isConnected}
          chatType={selectedRoom ? "room" : "dm"}
          chatName={
            selectedRoom
              ? rooms.find((r) => r.id === selectedRoom)?.name ?? ""
              : selectedFriend?.username ?? ""
          }
          initialMessages={selectedRoom ? roomMessages[selectedRoom] ?? [] : selectedFriend ? dmMessages[selectedFriend.id] ?? [] : []}
          participants={[]} // populate if you have participant lists for rooms
        />
      )}
       {activeView === "profile" && (
        <ProfileView
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
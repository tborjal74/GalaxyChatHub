import { useState, useEffect, useRef } from "react";
import { AuthPage } from "./components/AuthPage";
import { Sidebar } from "./components/AppSidebar";
import "./App.css";
import { ProfileView } from "./components/profile/ProfileView";
import { FriendsView } from "./components/FriendsView";
import { FriendProfileSidebar } from "./components/profile/FriendProfileSidebar";
import { ChatArea } from "./components/ChatArea";
import { socket } from "./socket";
import { ConfirmModal } from "./components/ui/confirm-modal";
import { API_URL } from "./config";

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  status?: string;
  joinedDate: Date;
  avatarUrl?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<"friends" | "rooms" | "profile">(
    "friends",
  );
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const [openedProfileUserId, setOpenedProfileUserId] = useState<number | null>(null);
  const selectedFriendRef = useRef(selectedFriend);
  const [rooms, setRooms] = useState<any[]>([]);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" as "danger"|"info"|"alert", onConfirm: undefined as undefined|(() => void) });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
      selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
         // Ensure we have the minimal required fields
         if(parsedUser.username && parsedUser.email) {
            setCurrentUser({ ...parsedUser, joinedDate: new Date() });
         }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL}/api/users/me/`, {
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
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("Socket connected!");
      
      // Register user for status tracking
      if (currentUser?.id) {
         socket.emit('register_user', currentUser.id);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Socket disconnected!");
    }

    function onRoomDeleted(payload: { roomId: number, deleterId?: number }) {
        console.log("Room deleted:", payload.roomId);
        setRooms((prev: any[]) => prev.filter((r: any) => !(r.type === 'room' && r.originalId === payload.roomId)));
        
        const current = selectedFriendRef.current;
        if(current && current.type === 'room' && current.originalId === payload.roomId) {
            setSelectedFriend(null);
            if (currentUser && currentUser.id !== payload.deleterId) {
                 setModal({
                    isOpen: true,
                    title: "Group Deleted",
                    message: "This group chat has been deleted.",
                    type: "alert",
                    onConfirm: undefined
                });
            }
        }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_deleted", onRoomDeleted);

    // Connect only if we have a user (optional strategy)
    if (currentUser) {
      if (!socket.connected) socket.connect();
      // If already connected, register immediately (handles page refreshes where socket might reconnect fast)
      if (socket.connected) {
         socket.emit('register_user', currentUser.id);
      }
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_deleted", onRoomDeleted);
      socket.disconnect();
    };
  }, [currentUser]);

  // Fetch Rooms (Conversations)
  const fetchRooms = async () => {
     if(!currentUser) return;
     const token = localStorage.getItem('token');
     try {
       // Fetch DMs
       const resDM = await fetch(`${API_URL}/api/messages/conversations`, {
           headers: { Authorization: `Bearer ${token}` }
       });
       const dataDM = await resDM.json();
       
       // Fetch Rooms
       const resRooms = await fetch(`${API_URL}/api/rooms`, {
           headers: { Authorization: `Bearer ${token}` }
       });
       const dataRooms = await resRooms.json();

       let combined: any[] = [];
       if(dataDM.success) {
           combined.push(...dataDM.data.map((d: any) => ({ ...d, id: `dm_${d.id}`, originalId: d.id, type: 'dm' })));
       }
       if(dataRooms.success) {
            combined.push(...dataRooms.data.map((r: any) => ({ ...r, id: `room_${r.id}`, originalId: r.id, type: 'room' })));
       }
       setRooms(combined);
       restoreSelectedChat(combined);
     } catch(e) { console.error(e); }
  };

  useEffect(() => {
     if(currentUser) fetchRooms();
  }, [currentUser, activeView]);

  // Restore selected chat from localStorage after rooms are loaded (so messages load from DB after refresh)
  const restoreSelectedChat = (roomsList: any[]) => {
    try {
      const stored = localStorage.getItem('selectedChat');
      if (!stored || roomsList.length === 0) return;
      const { originalId, type } = JSON.parse(stored);
      const match = roomsList.find((r: any) => Number(r.originalId) === Number(originalId) && r.type === type);
      if (match) {
        setSelectedFriend(match);
        setActiveView('rooms');
      }
    } catch (_) { /* ignore */ }
  }; 

  const handleLogin = () => {
    loadUser();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedFriend(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedChat');
    socket.disconnect();
  };

 const handleUpdateProfile = async (
  updates: Partial<User> & { avatar?: File | null }
) => {
  const token = localStorage.getItem("token");
  if (!token || !currentUser) return;

  const formData = new FormData();

  // Text fields
  if (updates.username) formData.append("username", updates.username);
  if (updates.email) formData.append("email", updates.email);
  if (updates.bio) formData.append("bio", updates.bio);

  // Avatar upload
  if (updates.avatar instanceof File) {
    formData.append("avatar", updates.avatar);
  }

  // Avatar removal
  if (updates.avatar === null) {
    formData.append("removeAvatar", "true");
  }

  const res = await fetch(`${API_URL}/api/users/me`, {
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
};


  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen min-h-0 w-full max-w-[100vw] overflow-hidden bg-background">

      {/* Mobile overlay when sidebar is open */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-200"
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none" }}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={(view) => {
            if (view === 'rooms') setSelectedFriend(null);
            setActiveView(view);
        }}
        onLogout={handleLogout}
        rooms={rooms}
        onRoomSelect={(roomId) => {
            const room = rooms.find(r => r.id === roomId);
            if(room) {
                setSelectedFriend(room);
                localStorage.setItem('selectedChat', JSON.stringify({ originalId: room.originalId ?? room.id, type: room.type || 'dm' }));
                setActiveView('rooms');
            }
        }}
        selectedRoom={selectedFriend?.id}
        onRefreshRooms={fetchRooms}
      />

      {/* Mobile top bar: menu button when sidebar is closed */}
      <div className="fixed top-0 left-0 right-0 z-20 flex h-14 items-center gap-3 border-b border-sidebar-border bg-sidebar px-3 md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="truncate text-sm font-medium text-white">Galaxy Chat Hub</span>
      </div>

      <main className="flex min-w-0 flex-1 flex-col pt-14 md:pt-0">
      <div className="flex-1 min-h-0 flex">
        {activeView === "friends" && (
          <FriendsView 
               onChatSelect={(friend) => {
                   const chat = { ...friend, id: `dm_${friend.id}`, originalId: friend.id, type: 'dm' as const };
                   setSelectedFriend(chat);
                   localStorage.setItem('selectedChat', JSON.stringify({ originalId: friend.id, type: 'dm' }));
                   setActiveView('rooms');
               }}
               onOpenProfile={(id) => {
                  setOpenedProfileUserId(Number(id));
               }}
          />
        )}
      
        {activeView === "rooms" && (
          <ChatArea 
             currentUserId={JSON.parse(localStorage.getItem('user') || '{}').id} 
             selectedFriend={selectedFriend} 
             onMessageSent={fetchRooms}
             isConnected={isConnected}
             onBack={() => { setSelectedFriend(undefined); localStorage.removeItem('selectedChat'); }}
          />
        )}
      
        {activeView === "profile" && (
          <ProfileView
            user={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        )}

        {openedProfileUserId && (
          <FriendProfileSidebar userId={openedProfileUserId} onClose={() => setOpenedProfileUserId(null)} />
        )}
      </div>

      <ConfirmModal 
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm}
          onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />
      </main>
    </div>
  );
}

export default App;
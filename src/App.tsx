import { useState, useEffect } from "react";
import { AuthPage } from "./components/authPage";
import { Sidebar } from "./components/sideBar";
import "./App.css";
import { ProfileView } from "./components/profile/ProfileView";
import { FriendsView } from "./components/FriendsView";
import { ChatArea } from "./components/ChatArea";
import { socket } from "./socket";

interface User {
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

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

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
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

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

    // Connect only if we have a user (optional strategy)
    if (currentUser) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [currentUser]);

  const handleLogin = () => {
    loadUser();
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
};


  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="fixed top-2 right-2 z-50">
        <span
          className={`inline-block w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </div>

      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
        rooms={[]}
        onRoomSelect={(roomId) => console.log("Room selected:", roomId)}
        selectedRoom={null}
      />

      {activeView === "friends" && <FriendsView />}
      {activeView === "rooms" && <ChatArea />}
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

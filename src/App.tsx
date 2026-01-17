import { useState, useEffect } from 'react'
import { AuthPage } from './components/authPage';
import { Sidebar } from "./components/sideBar"
import './App.css'
import { ProfileView } from './components/ProfileView';
import { socket } from './socket';

interface User {
  username: string;
  email: string;
  bio?: string;
  status?: string;
  joinedDate: Date;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'friends' | 'rooms' | 'profile'>('friends');
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("Socket connected!");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Socket disconnected!");
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Connect only if we have a user (optional strategy)
    if (currentUser) {
       socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [currentUser]);

  const handleLogin = (username: string, email: string) => {
    setCurrentUser({ username, email, joinedDate: new Date() });
  };


  const handleLogout = () => {
    setCurrentUser(null);
  };

    if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentUser={{ username: "Demo", email: "demo@example.com" }}
        activeView={activeView}
        onViewChange={setActiveView} onLogout={function (): void {
          throw new Error('Function not implemented.');
        } } rooms={[]} onRoomSelect={function (roomId: string): void {
          throw new Error('Function not implemented.');
        } } selectedRoom={null}      />

        {activeView === "friends" && <div>Friends view placeholder</div>}
        {activeView === "rooms" && <div>Select a room</div>}
        {activeView === "rooms" && <div>Room: This is a room</div>}
        {activeView === "profile" && <div>Profile view placeholder</div>}

    </div>
  )
}

export default App

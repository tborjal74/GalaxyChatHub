import { useState } from 'react'
import { AuthPage } from './components/authPage';
import { Sidebar } from './components/sideBar';
import './App.css'

interface User {
  username: string;
  email: string;
  bio?: string;
  status?: string;
  joinedDate: Date;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (username: string, email: string) => {
    setCurrentUser({ username, email, joinedDate: new Date() });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  //   if (!currentUser) {
  //   return <AuthPage onLogin={handleLogin} />;
  // }

  return (
    <>
      <Sidebar currentUser={{
        username: '',
        email: ''
      }} activeView={'friends'} onViewChange={function (view: 'friends' | 'rooms' | 'profile'): void {
        throw new Error('Function not implemented.');
      } } onLogout={function (): void {
        throw new Error('Function not implemented.');
      } } rooms={[]} onRoomSelect={function (roomId: string): void {
        throw new Error('Function not implemented.');
      } } selectedRoom={null}/>
    </>
  )
}

export default App

import { useEffect, useState } from 'react';
import { ConfirmModal } from './ui/confirm-modal';
import { API_URL } from '../config';
import { socket } from '../socket';

interface Friend {
  id: string;
  username: string;
  avatarUrl: string;
  status: "online" | "offline";
}

interface FriendsViewProps {
    onChatSelect?: (friend: Friend) => void;
}

export function FriendsView({ onChatSelect }: FriendsViewProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [newFriendName, setNewFriendName] = useState("");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" as "danger"|"info"|"alert" });

  const token = localStorage.getItem('token');

  const fetchFriends = async () => {
    const res = await fetch(`${API_URL}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if(data.success) setFriends(data.data);
  };

  const fetchRequests = async () => {
    const res = await fetch(`${API_URL}/api/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if(data.success) {
        if(data.data.incoming) {
            setRequests(data.data.incoming);
        } else {
             setRequests(data.data); 
        }
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    
    // Status Listener
    const onStatusChange = ({ userId, status }: { userId: number, status: string }) => {
        setFriends(prev => prev.map(f => {
            if (parseInt(f.id) === userId) {
                 return { ...f, status: status === 'online' ? 'online' : 'offline' };
            }
            return f;
        }));
    };
    
    socket.on('user_status_change', onStatusChange);
    
    return () => {
        socket.off('user_status_change', onStatusChange);
    };
  }, []);

  const addFriend = async () => {
      if (!newFriendName.trim()) {
           setModal({
              isOpen: true,
              title: "Error",
              message: "Please enter a username.",
              type: "alert"
           });
           return;
      }

      try {
          const res = await fetch(`${API_URL}/api/friends/request`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ username: newFriendName })
          });
          
          const data = await res.json();
          
          if (data.success) {
              setNewFriendName("");
              setModal({
                  isOpen: true,
                  title: "Success",
                  message: "Friend request sent successfully!",
                  type: "alert"
              });
          } else {
              let msg = data.message || "Failed to send request.";
              if(msg.toLowerCase().includes('not found')) msg = "Invalid Username";
              
              setModal({
                  isOpen: true,
                  title: "Error",
                  message: msg,
                  type: "alert"
              });
          }
      } catch(e) {
          setModal({
              isOpen: true,
              title: "Error",
              message: "An unexpected error occurred.",
              type: "alert"
          });
      }
  };

  const acceptRequest = async (requestId: number) => {
    await fetch(`${API_URL}/api/friends/accept`, {
        method: 'POST',
        headers: {  
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ requestId })
    });
    fetchFriends();
    fetchRequests();
  };

  return (
    <div className="flex-1 p-6 text-white overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Friends</h2>
      
      <div className="flex gap-2 mb-6">
        <input 
            className="p-2 rounded bg-gray-800 border border-gray-700 outline-none focus:border-purple-500 transition-colors placeholder:text-gray-500 text-sm w-64"
            placeholder="Add friend by username" 
            value={newFriendName}
            onChange={e => setNewFriendName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
        />
        <button onClick={addFriend} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 cursor-pointer">Add Friend</button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-400">Friend Requests</h3>
        {requests.length === 0 && <p className="text-gray-500">No pending requests</p>}
        {requests.map(req => (
            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-900 rounded mb-2">
                <span>{req.sender.username} wants to be friends</span>
                <button onClick={() => acceptRequest(req.id)} className="bg-green-600 px-3 py-1 rounded text-sm cursor-pointer">Accept</button>
            </div>
        ))}
      </div>

      <div className="grid gap-2">
        <h3 className="text-lg font-semibold mb-2 text-gray-400">My Friends</h3>
        {friends.length === 0 && <p className="text-gray-500">No friends yet. Add someone!</p>}
        {friends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-900 rounded hover:bg-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
                        {friend.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium">{friend.username}</div>
                        <div className="text-xs text-gray-400">{friend.status}</div>
                    </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-white bg-gray-800 px-3 py-1 rounded border border-gray-700 hover:bg-purple-600 hover:border-purple-600 cursor-pointer"
                  onClick={() => onChatSelect?.(friend)}
                >
                  Message
                </button>
            </div>
        ))}
      </div>

      <ConfirmModal 
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

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
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);

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

  const rejectRequest = async (requestId: number) => {
    await fetch(`${API_URL}/api/friends/reject`, {
        method: 'POST',
        headers: {  
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ requestId })
    });
    fetchRequests();
  };

  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    try {
        const res = await fetch(`${API_URL}/api/friends/remove`, {
            method: 'POST',
            headers: {  
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ friendId: friendToRemove.id })
        });
        
        const data = await res.json();
        
        if (data.success) {
            setFriends(prev => prev.filter(f => f.id !== friendToRemove.id));
            setFriendToRemove(null);
        } else {
             setModal({
                isOpen: true,
                title: "Error",
                message: data.message || "Failed to remove friend",
                type: "alert"
             });
        }
    } catch(e) {
        setModal({
            isOpen: true,
            title: "Error",
            message: "An unexpected error occurred",
            type: "alert"
        });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 text-white sm:p-6">
      <h2 className="mb-4 text-xl font-bold sm:text-2xl">Friends</h2>
      
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:gap-2">
        <input 
            className="min-w-0 flex-1 rounded border border-gray-700 bg-gray-800 p-2.5 text-sm outline-none transition-colors placeholder:text-gray-500 focus:border-purple-500 sm:w-64"
            placeholder="Add friend by username" 
            value={newFriendName}
            onChange={e => setNewFriendName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
        />
        <button onClick={addFriend} className="h-11 shrink-0 rounded bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700 cursor-pointer sm:h-10">Add Friend</button>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-gray-400 sm:text-lg">Friend Requests</h3>
        {requests.length === 0 && <p className="text-sm text-gray-500">No pending requests</p>}
        {requests.map(req => (
            <div key={req.id} className="mb-2 flex flex-col gap-2 rounded bg-gray-900 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 truncate text-sm sm:text-base">{req.sender.username} wants to be friends</span>
                <div className="flex shrink-0 self-end gap-2 sm:self-center">
                  <button onClick={() => acceptRequest(req.id)} className="h-10 rounded bg-green-600 px-3 py-1.5 text-sm cursor-pointer hover:bg-green-700">Accept</button>
                  <button onClick={() => rejectRequest(req.id)} className="h-10 rounded bg-red-600 px-3 py-1.5 text-sm cursor-pointer hover:bg-red-700">Reject</button>
                </div>
            </div>
        ))}
      </div>

      <div className="grid gap-2">
        <h3 className="mb-2 text-base font-semibold text-gray-400 sm:text-lg">My Friends</h3>
        {friends.length === 0 && <p className="text-sm text-gray-500">No friends yet. Add someone!</p>}
        {friends.map(friend => (
            <div key={friend.id} className="flex flex-col gap-2 rounded bg-gray-900 p-3 hover:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-purple-500 flex items-center justify-center text-lg font-bold">
                        {friend.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-medium">{friend.username}</div>
                        <div className="text-xs text-gray-400">{friend.status}</div>
                    </div>
                </div>
                <div className="flex shrink-0 gap-2 self-end sm:self-center">
                    <button 
                      className="h-10 rounded border border-gray-700 bg-gray-600 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer"
                      onClick={() => onChatSelect?.(friend)}
                    >
                      Message
                    </button>
                    <button 
                      className="h-10 rounded border border-red-900 bg-red-900/20 px-3 py-1.5 text-sm text-red-500 hover:bg-red-900/40 hover:text-red-400 cursor-pointer"
                      onClick={() => setFriendToRemove(friend)}
                    >
                      Remove
                    </button>
                </div>
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

      <ConfirmModal 
          isOpen={!!friendToRemove}
          title="Remove Friend"
          message={`Are you sure you want to remove ${friendToRemove?.username} from your friends list?`}
          type="danger"
          confirmText="Remove"
          onClose={() => setFriendToRemove(null)}
          onConfirm={confirmRemoveFriend}
      />
    </div>
  );
}

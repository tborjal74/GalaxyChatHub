import { useEffect, useState } from 'react';

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

  const token = localStorage.getItem('token');

  const fetchFriends = async () => {
    const res = await fetch('http://localhost:3000/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if(data.success) setFriends(data.data);
  };

  const fetchRequests = async () => {
    const res = await fetch('http://localhost:3000/api/friends/requests', {
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
  }, []);

  const addFriend = async () => {
      await fetch('http://localhost:3000/api/friends/request', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ username: newFriendName })
      });
      setNewFriendName("");
      alert("Request sent!");
  };

  const acceptRequest = async (requestId: number) => {
    await fetch('http://localhost:3000/api/friends/accept', {
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
            className="p-2 rounded bg-gray-800 border border-gray-700"
            placeholder="Add friend by username" 
            value={newFriendName}
            onChange={e => setNewFriendName(e.target.value)}
        />
        <button onClick={addFriend} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">Add</button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-400">Friend Requests</h3>
        {requests.length === 0 && <p className="text-gray-500">No pending requests</p>}
        {requests.map(req => (
            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-900 rounded mb-2">
                <span>{req.sender.username} wants to be friends</span>
                <button onClick={() => acceptRequest(req.id)} className="bg-green-600 px-3 py-1 rounded text-sm">Accept</button>
            </div>
        ))}
      </div>

      <div className="grid gap-2">
        <h3 className="text-lg font-semibold mb-2 text-gray-400">My Friends</h3>
        {friends.length === 0 && <p className="text-gray-500">No friends yet. Add someone!</p>}
        {friends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-900 rounded hover:bg-gray-800 cursor-pointer" onClick={() => onChatSelect?.(friend)}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
                        {friend.username[0].toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium">{friend.username}</div>
                        <div className="text-xs text-gray-400">{friend.status}</div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white">Message</button>
            </div>
        ))}
      </div>
    </div>
  );
}

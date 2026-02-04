import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { API_URL } from "../config";

interface Friend {
  id: number;
  username: string;
  avatarUrl: string;
}

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: () => void;
}

export function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setName("");
      setSelectedFriends([]);
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFriends(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
           name,
           members: selectedFriends 
        }),
      });

      const data = await res.json();
      if (data.success) {
        onRoomCreated();
        onClose();
      } else {
          alert('Failed to create room');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating room');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (id: number) => {
    setSelectedFriends(prev => 
      prev.includes(id) 
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[24rem] rounded-lg border border-gray-700 bg-[#1a1b26] p-4 shadow-xl sm:p-6">
        <h2 className="text-xl font-bold text-white mb-4">Create Group Chat</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Room Name</label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="My Awesome Group"
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
             <label className="text-sm text-gray-400 block mb-1">Add Friends</label>
             <div className="bg-gray-900 border border-gray-700 rounded-md p-2 h-40 overflow-y-auto">
                {friends.length === 0 ? (
                    <p className="text-gray-500 text-sm">No friends to add.</p>
                ) : (
                    friends.map(friend => (
                        <div 
                            key={friend.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${selectedFriends.includes(friend.id) ? 'bg-purple-900/50' : 'hover:bg-gray-800'}`}
                            onClick={() => toggleFriend(friend.id)}
                        >
                             <div className={`w-4 h-4 border rounded ${selectedFriends.includes(friend.id) ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
                                 {selectedFriends.includes(friend.id) && (
                                     <svg viewBox="0 0 24 24" className="text-white w-3 h-3 mx-auto">
                                         <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                     </svg>
                                 )}
                             </div>
                             <span className="text-gray-200">{friend.username}</span>
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !name} className="bg-purple-600 hover:bg-purple-700 text-white">
             {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </div>
    </div>
  );
}

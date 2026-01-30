import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { X, Plus } from "lucide-react";
import { API_URL } from "../config";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  onAdded: () => void;
}

export function AddMemberDialog({ isOpen, onClose, roomId, onAdded }: AddMemberModalProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, roomId]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [friendsRes, membersRes] = await Promise.all([
          fetch(`${API_URL}/api/friends`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/rooms/${roomId}/members`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const friendsData = await friendsRes.json();
      const membersData = await membersRes.json();

      if (friendsData.success && membersData.success) {
          setFriends(friendsData.data);
          setMembers(membersData.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addFriend = async (friendId: number) => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/api/rooms/${roomId}/members`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ userId: friendId })
          });
          const data = await res.json();
          if(data.success) {
              onAdded();
              onClose();
          } else {
              alert(data.message || "Failed to add user");
          }
      } catch(e) {
          console.error(e);
          alert("Error adding user");
      } finally {
          setLoading(false);
      }
  };

  // Filter friends: keep only those whose ID is NOT in the members list
  const availableFriends = friends.filter(friend => 
      !members.some(member => member.id === friend.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
      <div className="bg-[#313338] p-6 rounded-lg w-96 border border-[#26272D] shadow-xl">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-100">Add Friend to Group</h2>
             <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                 <X className="w-5 h-5"/>
             </Button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {availableFriends.length === 0 && <p className="text-gray-400 text-sm">No new friends to add.</p>}
            {availableFriends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-[#2B2D31] rounded-md theme-transition">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                             <AvatarFallback className="bg-indigo-500 text-white text-xs">
                                 {friend.username.substring(0,2).toUpperCase()}
                             </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-200 text-sm font-medium">{friend.username}</span>
                    </div>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        disabled={loading}
                        onClick={() => addFriend(friend.id)}
                        className="h-8 w-8 p-0"
                    >
                        <Plus className="w-4 h-4"/>
                    </Button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

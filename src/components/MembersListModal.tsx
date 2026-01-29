import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { X, User } from "lucide-react";
import { API_URL } from "../config";

interface MembersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
}

export function MembersListModal({ isOpen, onClose, roomId }: MembersListModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, roomId]);

  const fetchMembers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/rooms/${roomId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
      <div className="bg-[#313338] p-6 rounded-lg w-96 border border-[#26272D] shadow-xl">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                 <User className="w-5 h-5"/>
                 Group Members
             </h2>
             <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                 <X className="w-5 h-5"/>
             </Button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {members.length === 0 && <p className="text-gray-400 text-sm">Loading...</p>}
            {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-md">
                     <Avatar className="w-8 h-8">
                             <AvatarFallback className="bg-blue-600 text-white text-xs">
                                 {member.username.substring(0,2).toUpperCase()}
                             </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-gray-200 text-sm font-medium">{member.username}</span>
                            <span className="text-gray-500 text-xs">
                                {member.status === 'ONLINE' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

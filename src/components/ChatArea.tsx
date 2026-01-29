import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { SendHorizontal, Trash2 } from "lucide-react";
import { ConfirmModal } from "./ui/confirm-modal";

export function ChatArea({ currentUserId, selectedFriend, onMessageSent, isConnected }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" as "danger"|"info"|"alert", onConfirm: undefined as undefined | (() => void) });

  const chatName = selectedFriend?.name || selectedFriend?.username || "Chat";

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 1. Join Room on select
  useEffect(() => {
    if (!selectedFriend) return;
    const token = localStorage.getItem('token');
    
    setMessages([]); // Clear on switch
    const friendId = selectedFriend.originalId || selectedFriend.id;
    const isRoom = selectedFriend.type === 'room';

    const joinSession = () => {
         if (isRoom) {
            // Join Group Room
            socket.emit("join_room", { roomId: friendId });
         } else {
            // Join DM
            socket.emit("join_dm", { currentUserId, targetUserId: friendId });
        }
    };

    // Initial Join
    joinSession();

    // Handle Reconnection
    const onConnect = () => {
        console.log("Reconnected to socket, rejoining room...");
        joinSession();
    };
    socket.on("connect", onConnect);

    // Fetch History
    if (isRoom) {
        fetch(`http://localhost:3000/api/rooms/${friendId}/messages`, {
           headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) setMessages(data.data);
        })
        .catch(err => console.error("Failed to fetch room history", err));

    } else {
        // DM Logic
        fetch(`http://localhost:3000/api/messages/${friendId}`, {
           headers: {
             'Authorization': `Bearer ${token}`
           }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) setMessages(data.data);
        })
        .catch(err => console.error("Failed to fetch history", err));
    }

    return () => {
        socket.off("connect", onConnect);
    };
  }, [selectedFriend?.id, selectedFriend?.originalId, selectedFriend?.type, currentUserId]);

  // 2. Listen for incoming messages
  useEffect(() => {
    const dmHandler = (message: any) => {
        if (selectedFriend?.type !== 'dm' && !(!selectedFriend?.type)) return; // Only if DM or legacy
        const friendId = selectedFriend?.originalId || selectedFriend?.id;
        const cId = Number(currentUserId);
        const fId = Number(friendId);
        const mSender = Number(message.senderId);
        const mReceiver = Number(message.receiverId);

        // Strict check
        const isRelated = 
            (mSender === cId && mReceiver === fId) ||
            (mSender === fId && mReceiver === cId);

        if (isRelated) {
             setMessages((prev) => {
                 if(prev.some(m => m.id === message.id)) return prev;
                 return [...prev, message];
             });
        }
    };

    const roomHandler = (message: any) => {
        if (selectedFriend?.type === 'room' && Number(message.roomId) === Number(selectedFriend.originalId)) {
             setMessages((prev) => {
                 if(prev.some(m => m.id === message.id)) return prev;
                 return [...prev, message];
             });
        }
    };
    
    socket.on("receive_dm", dmHandler);
    socket.on("receive_room_message", roomHandler);

    return () => { 
        socket.off("receive_dm", dmHandler);
        socket.off("receive_room_message", roomHandler);
    };
  }, [selectedFriend, currentUserId]);

  // 3. Send Message
  const handleSend = () => {
    if (!inputText.trim() || !selectedFriend) return;

    const isRoom = selectedFriend.type === 'room';
    
    // Explicitly parse IDs to avoid mismatched types (string vs number)
    const friendId = selectedFriend.originalId ? parseInt(selectedFriend.originalId) : parseInt(selectedFriend.id);
    const myId = parseInt(currentUserId);

    if (isRoom) {
         socket.emit("send_room_message", {
             roomId: friendId,
             content: inputText,
             userId: myId
         }, (response: any) => {
             // Callback after server confirmation
             if (response?.status === 'ok' && response.data) {
                 setMessages(prev => {
                     if(prev.some(m => m.id === response.data.id)) return prev;
                     return [...prev, response.data];
                 });
             }
             if(onMessageSent) onMessageSent();
         });
    } else {
        // Emit to server
        socket.emit("send_dm", {
            senderId: myId,
            receiverId: friendId,
            content: inputText
        }, (response: any) => {
             // Callback after server confirmation
             if (response?.status === 'ok' && response.data) {
                 setMessages(prev => {
                     if(prev.some(m => m.id === response.data.id)) return prev;
                     return [...prev, response.data];
                 });
             }
             if(onMessageSent) onMessageSent();
         });
    }

    setInputText("");
  };

  const confirmDelete = async () => {
     const isRoom = selectedFriend.type === 'room';
     const friendId = selectedFriend.originalId || selectedFriend.id;
     
     try {
        const token = localStorage.getItem('token');
        const url = isRoom 
          ? `http://localhost:3000/api/rooms/${friendId}`
          : `http://localhost:3000/api/messages/${friendId}`;

        const res = await fetch(url, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        if(data.success) {
            setMessages([]); 
            if(onMessageSent) onMessageSent(); 
            setModal({
                isOpen: true,
                title: "Success",
                message: isRoom ? "Group deleted." : "Conversation deleted.",
                type: "alert",
                onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
            });
        } else {
             setModal({
                isOpen: true,
                title: "Error",
                message: "Failed to delete.",
                type: "alert",
                onConfirm: undefined
            });
        }
    } catch(e) {
        console.error(e);
        setModal({
            isOpen: true,
            title: "Error",
            message: "An unexpected error occurred.",
            type: "alert",
            onConfirm: undefined
        });
    }
  };

  const handleDeleteConversation = () => {
    if(!selectedFriend) return;
    
    const isRoom = selectedFriend.type === 'room';
    
    setModal({
        isOpen: true,
        title: isRoom ? "Delete Group?" : "Delete Conversation?",
        message: isRoom 
          ? `This will delete the group "${chatName}" for all members. Are you sure?`
          : `Are you sure you want to delete the conversation with ${chatName}? This cannot be undone.`,
        type: "danger",
        onConfirm: confirmDelete
    });
  };

  if(!selectedFriend) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground bg-[#313338]">
             <div className="text-center">
                <p>Select a conversation or group chat to view</p>
            </div>
        </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#313338] text-gray-100">
       <div className="h-14 border-b border-[#26272D] flex items-center px-4 shadow-sm bg-[#313338] justify-between">
        <div className="flex items-center gap-3">
             <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {chatName?.[0]?.toUpperCase()}
                </AvatarFallback>
             </Avatar>
            <div>
                <div className="font-bold text-sm text-gray-100 flex items-center gap-2">
                    {chatName}
                    <span 
                      className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                      title={isConnected ? "Connected" : "Disconnected"} 
                    />
                </div>
            </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-transparent" onClick={handleDeleteConversation} title="Delete Conversation">
            <Trash2 className="w-5 h-5" />
        </Button>
      </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
         {messages.map((msg, idx) => {
            const senderId = msg.senderId || msg.userId;
            const isMe = Number(senderId) === Number(currentUserId);
            const senderName = msg.sender?.username || msg.user?.username || (isMe ? "Me" : chatName);

            return (
           <div key={msg.id || idx} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
             <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className={`${isMe ? 'bg-blue-600' : 'bg-purple-600'} text-white text-[10px]`}>
                    {senderName.substring(0,2).toUpperCase()}
                </AvatarFallback>
             </Avatar>
             
             <div className={`max-w-[70%] rounded-lg p-3 text-sm ${
                 isMe 
                 ? "bg-blue-600 text-white rounded-br-none" 
                 : "bg-[#2B2D31] text-gray-100 rounded-bl-none"
             }`}>
                {msg.content}
             </div>
           </div>
         )})}
       </div>

       <div className="p-4 bg-[#313338]">
         <div className="bg-[#383A40] rounded-lg flex items-center px-4 py-2 gap-2">
             <input 
               className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-400 text-sm"
               placeholder={`Message ${chatName}`}
               value={inputText} 
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <Button variant="ghost" size="icon" onClick={handleSend} className="text-gray-400 hover:text-white hover:bg-transparent">
                 <SendHorizontal className="w-5 h-5" />
             </Button>
         </div>
       </div>

       <ConfirmModal 
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm}
          onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
       />
    </div>
  );
}
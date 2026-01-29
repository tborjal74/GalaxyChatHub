import React, { useEffect, useRef, useState } from "react";
import { Hash, User, Send } from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { socket } from "../socket";

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  room?: string;
  content: string;
  timestamp: string | Date;
};

type Participant = {
  id: string;
  username: string;
  status: "online" | "offline" | string;
};

interface SelectedFriend {
  id: string;
  username: string;
}

interface ChatAreaProps {
  currentUserId: string;
  selectedFriend?: SelectedFriend | null;
  onMessageSent?: () => void;
  isConnected?: boolean;
  chatType: "room" | "dm";
  chatName: string;
  participants?: Participant[];
  // optional initial messages prop — if you prefer external control
  initialMessages?: Message[];
}

export function ChatArea({
  currentUserId,
  selectedFriend = null,
  onMessageSent,
  isConnected = true,
  chatType,
  chatName,
  participants = [],
  initialMessages = [],
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Join room or DM and fetch history when selection or chatName changes
  useEffect(() => {
    // Clear messages when switching chats
    setMessages([]);

    if (chatType === "dm") {
      if (!selectedFriend) return;

      // Join DM room on server (if your server uses a DM room)
      socket.emit("join_dm", { currentUserId, targetUserId: selectedFriend.id });

      // Fetch DM history
      const fetchHistory = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:3000/api/messages/${selectedFriend.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          if (data.success) {
            // Normalize timestamps to strings
            setMessages(data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch DM history", err);
        }
      };

      fetchHistory();

      // cleanup listeners for DM handled in separate effect
      return () => {
        socket.off("receive_dm");
      };
    } else {
      // room
      // Join the room by name
      socket.emit("join_room", { room: chatName });

      // Fetch room history
      const fetchRoomHistory = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:3000/api/messages/room/${encodeURIComponent(chatName)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setMessages(data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch room history", err);
        }
      };

      fetchRoomHistory();

      return () => {
        socket.off("receive_room");
      };
    }
  }, [chatType, chatName, selectedFriend?.id, currentUserId]);

  // Listen for incoming DM messages
  useEffect(() => {
    if (chatType !== "dm") return;

    const handler = (message: Message) => {
      const isRelated =
        (message.senderId === currentUserId && message.receiverId === selectedFriend?.id) ||
        (message.senderId === selectedFriend?.id && message.receiverId === currentUserId);

      if (isRelated) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receive_dm", handler);
    return () => {
      socket.off("receive_dm", handler);
    };
  }, [chatType, selectedFriend, currentUserId]);

  // Listen for incoming room messages
  useEffect(() => {
    if (chatType !== "room") return;

    const handler = (message: Message) => {
      // Only append messages for this room
      if (message.room === chatName) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receive_room", handler);
    return () => {
      socket.off("receive_room", handler);
    };
  }, [chatType, chatName]);

  // Send message (handles both DM and room)
  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    if (chatType === "dm") {
      if (!selectedFriend) return;

      const payload = {
        senderId: currentUserId,
        receiverId: selectedFriend.id,
        content: trimmed,
      };

      socket.emit("send_dm", payload);

      // Optimistic UI append (server will also send back receive_dm)
      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        senderName: "You",
        receiverId: selectedFriend.id,
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
    } else {
      // room
      const payload = {
        senderId: currentUserId,
        room: chatName,
        content: trimmed,
      };

      socket.emit("send_room", payload);

      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        senderName: "You",
        room: chatName,
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
    }

    if (onMessageSent) onMessageSent();
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Delete conversation (DM only)
  const handleDeleteConversation = async () => {
    if (chatType !== "dm" || !selectedFriend) return;
    if (!confirm(`Are you sure you want to delete the conversation with ${selectedFriend.username}? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/messages/${selectedFriend.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages([]);
        if (onMessageSent) onMessageSent();
        alert("Conversation deleted.");
      } else {
        alert("Failed to delete.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred.");
    }
  };

  if (chatType === "dm" && !selectedFriend) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-[#313338]">
        <div className="text-center">
          <p>Select a friend to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="h-12 px-4 border-b border-border flex items-center gap-2">
          {chatType === "room" ? (
            <Hash className="w-5 h-5 text-muted-foreground" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-white">{chatName}</span>

          {/* Optional delete button for DM */}
          {chatType === "dm" && selectedFriend && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleDeleteConversation}
                className="text-xs text-muted-foreground hover:text-white"
                title="Delete conversation"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    {chatType === "room" ? (
                      <Hash className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-white mb-2">
                    {chatType === "room"
                      ? `Welcome to #${chatName}!`
                      : `This is the beginning of your conversation`}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    {chatType === "room"
                      ? "This is the start of the conversation in this channel."
                      : "Send a message to start the conversation."}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={{
                      ...message,
                      // ensure timestamp is a Date for rendering
                      timestamp:
                        typeof message.timestamp === "string"
                          ? new Date(message.timestamp)
                          : message.timestamp,
                    }}
                    isOwn={message.senderId === currentUserId}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={`Message ${chatType === "room" ? "#" : "@"}${chatName}`}
              value={messageInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-input-background border-input text-white placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !isConnected}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Participants Sidebar (for rooms) */}
      {chatType === "room" && participants.length > 0 && (
        <div className="w-60 bg-sidebar border-l border-sidebar-border">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="text-xs uppercase text-muted-foreground mb-3">
                Members — {participants.length}
              </div>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs">
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{participant.username}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            participant.status === "online" ? "bg-green-500" : "bg-gray-500"
                          }`}
                        ></span>
                        {participant.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function MessageItem({ message, isOwn }: { message: Message & { timestamp: Date }; isOwn: boolean }) {
  return (
    <div className="flex gap-3 hover:bg-secondary/20 px-2 py-1 rounded">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
          {message.senderName?.charAt(0)?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={`text-sm ${isOwn ? "text-primary" : "text-white"}`}>
            {message.senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp instanceof Date
              ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : String(message.timestamp)}
          </span>
        </div>
        <div className="text-white break-words">{message.content}</div>
      </div>
    </div>
  );
}
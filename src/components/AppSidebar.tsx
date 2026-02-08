import {
  Users,
  Hash,
  Settings,
  LogOut,
  BotMessageSquare,
  Plus,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { CreateRoomModal } from "./CreateRoomModal";
import { API_URL } from "../config";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
  currentUser: { username: string; email: string; avatarUrl?: string | null };
  activeView: "friends" | "rooms" | "profile";
  onViewChange: (view: "friends" | "rooms" | "profile") => void;
  onLogout: () => void;
  rooms: Array<{ id: string; name: string; unread: number }>;
  onRoomSelect: (roomId: string) => void;
  selectedRoom: string | null;
  onRefreshRooms?: () => void;
}

export function Sidebar({
  open = true,
  onClose,
  onNavigate,
  currentUser,
  activeView,
  onViewChange,
  onLogout,
  rooms,
  onRoomSelect,
  selectedRoom,
  onRefreshRooms,
}: SidebarProps) {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const handleViewChange = (view: "friends" | "rooms" | "profile") => {
    onViewChange(view);
    onNavigate?.();
  };

  const handleRoomSelect = (roomId: string) => {
    onRoomSelect(roomId);
    onNavigate?.();
  };

  return (
    <aside
      className={`
        z-40 flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border
        transition-transform duration-200 ease-out
        fixed left-0 top-0 md:relative md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onRoomCreated={() => {
          if (onRefreshRooms) onRefreshRooms();
        }}
      />
      {/* Server Icon Section + mobile close */}
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border p-3 sm:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="h-9 w-9 shrink-0 sm:h-10 sm:w-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
            <BotMessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="truncate text-sm font-medium text-white sm:text-base">
            Galaxy Chat Hub
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 shrink-0 md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="border-b border-sidebar-border p-2">
        <Button
          variant={activeView === "friends" ? "secondary" : "ghost"}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer h-10 sm:h-9"
          onClick={() => handleViewChange("friends")}
        >
          <Users className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">Friends</span>
        </Button>
        <Button
          variant={activeView === "rooms" ? "secondary" : "ghost"}
          className="mt-1 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer h-10 sm:h-9"
          onClick={() => handleViewChange("rooms")}
        >
          <Hash className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">Chat Rooms</span>
        </Button>
        <Button
          variant={activeView === "profile" ? "secondary" : "ghost"}
          className="mt-1 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer h-10 sm:h-9"
          onClick={() => handleViewChange("profile")}
        >
          <Settings className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">Profile</span>
        </Button>
      </div>

      {/* Room List */}
      {activeView === "rooms" && (
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <div className="text-xs uppercase text-muted-foreground">
                Chat Rooms
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => setIsCreateRoomOpen(true)}
              >
                <Plus className="w-4 h-4 text-muted-foreground hover:text-white" />
              </Button>
            </div>
            {rooms.map((room: any) => (
              <Button
                key={room.id}
                variant={selectedRoom === room.id ? "secondary" : "ghost"}
                className="mt-1 h-10 min-h-10 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent sm:h-9 sm:min-h-0"
                onClick={() => handleRoomSelect(room.id)}
              >
                {room.type === "dm" ? (
                  room.avatarUrl ? (
                    <img
                      src={
                        room.avatarUrl.startsWith("http")
                          ? room.avatarUrl
                          : `${API_URL}${room.avatarUrl}`
                      }
                      className="h-4 w-4 w-4 shrink-0 mr-2 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <Users className="h-4 w-4 mr-2 shrink-0" />
                  )
                ) : (
                  <Hash className="h-4 w-4 mr-2 shrink-0" />
                )}
                <span className="min-w-0 truncate">{room.name}</span>
                {room.unread > 0 && (
                  <span className="ml-auto shrink-0 bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {room.unread}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* User Section */}
      <div className="mt-auto shrink-0 border-t border-sidebar-border bg-[#0a0a0f] p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="h-full w-full object-cover rounded-full"
                onError={(e) => {
                  // fallback if Cloudinary image fails
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = `
          <div class="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-500 to-violet-600 text-white text-sm font-medium">
            ${currentUser.username.charAt(0).toUpperCase()}
          </div>`;
                }}
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-sm">
                {currentUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-white">
              {currentUser.username}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
              Online
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-white cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

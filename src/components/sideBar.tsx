import { Users, Hash, Settings, LogOut, UserPlus, BotMessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {
  currentUser: { username: string; email: string };
  activeView: 'friends' | 'rooms' | 'profile';
  onViewChange: (view: 'friends' | 'rooms' | 'profile') => void;
  onLogout: () => void;
  rooms: Array<{ id: string; name: string; unread: number }>;
  onRoomSelect: (roomId: string) => void;
  selectedRoom: string | null;
}

export function Sidebar({
  currentUser,
  activeView,
  onViewChange,
  onLogout,
  rooms,
  onRoomSelect,
  selectedRoom,
}: SidebarProps) {
  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Server Icon Section */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
          <BotMessageSquare className="w-5 h-5 text-white" />
        </div>
        <span className="text-white">Galaxy Chat Hub</span>
      </div>

      {/* Navigation */}
      <div className="p-2 border-b border-sidebar-border">
        <Button
          variant={activeView === 'friends' ? 'secondary' : 'ghost'}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => onViewChange('friends')}
        >
          <Users className="w-4 h-4 mr-2" />
          Friends
        </Button>
        <Button
          variant={activeView === 'rooms' ? 'secondary' : 'ghost'}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent mt-1"
          onClick={() => onViewChange('rooms')}
        >
          <Hash className="w-4 h-4 mr-2" />
          Chat Rooms
        </Button>
        <Button
          variant={activeView === 'profile' ? 'secondary' : 'ghost'}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent mt-1"
          onClick={() => onViewChange('profile')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Profile
        </Button>
      </div>

      {/* Room List */}
      {activeView === 'rooms' && (
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="text-xs uppercase text-muted-foreground px-2 py-1">
              Text Channels
            </div>
            {rooms.map((room) => (
              <Button
                key={room.id}
                variant={selectedRoom === room.id ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent mt-1"
                onClick={() => onRoomSelect(room.id)}
              >
                <Hash className="w-4 h-4 mr-2" />
                {room.name}
                {room.unread > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {room.unread}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* User Section */}
      <div className="p-3 bg-[#0a0a0f] border-t border-sidebar-border w-59 fixed bottom-0">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
              {currentUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{currentUser.username}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Online
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-muted-foreground hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
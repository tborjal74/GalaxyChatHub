import { Users, Hash, Settings, LogOut, UserPlus, MessageCircle, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
// import { label } from '../components/ui/label';
import { useEffect, useState } from 'react';

interface SidebarProps {
  currentUser: { username: string; email: string };
  activeView: 'friends' | 'rooms' | 'profile';
  onViewChange: (view: 'friends' | 'rooms' | 'profile') => void;
  onLogout: () => void;
  rooms: Array<{ id: string; name: string; unread: number }>;
  onRoomSelect: (roomId: string) => void;
  selectedRoom: string | null;
  onCreateRoom?: (roomName: string) => void;
  friends?: Array<{ id: string; username: string; status: 'online' | 'offline'; unreadMessages?: number }>;
  onSelectFriend?: (friendId: string) => void;
  selectedFriend?: string | null;
}


export function Sidebar({
  currentUser,
  activeView,
  onViewChange,
  onLogout,
  rooms,
  onRoomSelect,
  selectedRoom,
  onCreateRoom,
  friends = [],
  onSelectFriend,
  selectedFriend,
}: SidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

const handleCreateRoom = async () => {
  if (newRoomName.trim()) {
    await fetch('/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoomName.trim(), isPrivate: false })
    });
    setNewRoomName('');
    setIsCreateDialogOpen(false);
  }
};

  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Server Icon Section */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <span className="text-white">GalaxyChatHub</span>
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
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent mt-1 cursor-pointer"
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
            <div className="flex items-center justify-between px-2 py-1">
              <div className="text-xs uppercase text-muted-foreground">
                Text Channels
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a24] border-[#2a2a3a]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Channel</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Create a new text channel for your community
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="channel-name" className="text-white">
                        Channel Name
                      </label>
                      <Input
                        id="channel-name"
                        placeholder="e.g. general-chat"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateRoom();
                          }
                        }}
                        className="bg-[#0f0f17] border-[#2a2a3a] text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="text-muted-foreground hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRoom}
                      disabled={!newRoomName.trim()}
                      className="bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700"
                    >
                      Create Channel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

      {/* Direct Messages List */}
      {activeView === 'friends' && (
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="text-xs uppercase text-muted-foreground">
                Direct Messages
              </div>
            </div>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <Button
                  key={friend.id}
                  variant={selectedFriend === friend.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent mt-1 h-auto py-2"
                  onClick={() => onSelectFriend?.(friend.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs">
                          {friend.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-sidebar ${friend.status === "online" ? "bg-green-500" : "bg-gray-500"
                          }`}
                        aria-hidden="true"
                      />
                    </div>

                    <span className="flex-1 text-left truncate">{friend.username}</span>

                    {(friend.unreadMessages ?? 0) > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                        {friend.unreadMessages}
                      </span>
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                No friends yet. Add some friends to start chatting!
              </div>
            )}

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
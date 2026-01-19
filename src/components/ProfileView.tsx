import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Mail, Edit2, Save, X, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  username: string;
  email: string;
  bio?: string;
  joinedDate: Date;
}

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileView({ user, onUpdateProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile>(user);

  const handleSave = () => {
    onUpdateProfile(editedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-white">My Profile</h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-border text-white hover:bg-secondary"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card className="bg-card/50 backdrop-blur border-border p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-4xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" className="border-border text-white">
                    Change Avatar
                  </Button>
                )}
                <div className="text-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Online
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedUser.username}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, username: e.target.value })
                      }
                      className="bg-input-background border-input text-white"
                    />
                  ) : (
                    <div className="text-white">{user.username}</div>
                  )}
                </div>

                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                      className="bg-input-background border-input text-white"
                    />
                  ) : (
                    <div className="text-white">{user.email}</div>
                  )}
                </div>

              </div>
            </div>
          </Card>

          {/* Additional Info Tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="bg-secondary">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <Card className="bg-card/50 backdrop-blur border-border p-6">
                <h3 className="text-white mb-4">About Me</h3>
                {isEditing ? (
                  <textarea
                    value={editedUser.bio || ''}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, bio: e.target.value })
                    }
                    placeholder="Tell others about yourself..."
                    className="bg-input-background border-input text-white placeholder:text-muted-foreground min-h-[120px]"
                  />
                ) : (
                  <div className="text-white whitespace-pre-wrap">
                    {user.bio || (
                      <span className="text-muted-foreground">
                        No bio added yet. Click "Edit Profile" to add one.
                      </span>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="account" className="mt-4">
              <Card className="bg-card/50 backdrop-blur border-border p-6">
                <h3 className="text-white mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <div>
                      <div className="text-white">Member Since</div>
                      <div className="text-sm text-muted-foreground">
                        {user.joinedDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <div>
                      <div className="text-white">Password</div>
                      <div className="text-sm text-muted-foreground">
                        ••••••••••••
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-border text-white">
                      Change Password
                    </Button>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="text-white">Account ID</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {Math.random().toString(36).substring(2, 15)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-4">
              <Card className="bg-card/50 backdrop-blur border-border p-6">
                <h3 className="text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <div>
                      <div className="text-white">Direct Messages</div>
                      <div className="text-sm text-muted-foreground">
                        Who can send you direct messages
                      </div>
                    </div>
                    <select className="bg-input-background border border-input text-white rounded-md px-3 py-2">
                      <option>Everyone</option>
                      <option>Friends Only</option>
                      <option>No One</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <div>
                      <div className="text-white">Friend Requests</div>
                      <div className="text-sm text-muted-foreground">
                        Who can send you friend requests
                      </div>
                    </div>
                    <select className="bg-input-background border border-input text-white rounded-md px-3 py-2">
                      <option>Everyone</option>
                      <option>Friends of Friends</option>
                      <option>No One</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="text-white">Read Receipts</div>
                      <div className="text-sm text-muted-foreground">
                        Let others know when you've read their messages
                      </div>
                    </div>
                    <select className="bg-input-background border border-input text-white rounded-md px-3 py-2">
                      <option>Enabled</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Danger Zone */}
          <Card className="bg-card/50 backdrop-blur border-destructive/30 p-6">
            <h3 className="text-destructive mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <div className="text-white">Delete Account</div>
                  <div className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </div>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Shield } from "lucide-react";
import { useState } from "react";
import { ChangePasswordModal } from "./ChangePasswordModal";

type ProfileTabsProps = {
  isEditing: boolean;
  user: {
    bio?: string;
    joinedDate: Date;
  };
  editedUser: {
    bio?: string;
  };
  setEditedUser: (user: any) => void;
};

export function ProfileTabs({
  isEditing,
  user,
  editedUser,
  setEditedUser,
}: ProfileTabsProps) {
  const [showModal, setShowModal] = useState(false);
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="bg-secondary">
        <TabsTrigger value="about" className="cursor-pointer">
          About
        </TabsTrigger>
        <TabsTrigger value="account" className="cursor-pointer">
          Account
        </TabsTrigger>
        <TabsTrigger value="privacy" className="cursor-pointer">
          Privacy
        </TabsTrigger>
      </TabsList>

      {/* ABOUT */}
      <TabsContent value="about" className="mt-4">
        <Card className="bg-card/50 backdrop-blur border-border p-6">
          <h3 className="text-white mb-4">About Me</h3>

          {isEditing ? (
            <textarea
              value={editedUser.bio || ""}
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

      {/* ACCOUNT */}
      <TabsContent value="account" className="mt-4">
        <Card className="bg-card/50 backdrop-blur border-border p-6">
          <h3 className="text-white mb-4">Account Information</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <div>
                <div className="text-white">Member Since</div>
                <div className="text-sm text-muted-foreground">
                  {user.joinedDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="cursor-pointer"
              >
                Change Password
              </Button>

              {showModal && (
                <ChangePasswordModal onClose={() => setShowModal(false)} />
              )}
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

      {/* PRIVACY */}
      <TabsContent value="privacy" className="mt-4">
        <Card className="bg-card/50 backdrop-blur border-border p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </h3>

          <div className="space-y-4">
            <PrivacyRow
              title="Direct Messages"
              description="Who can send you direct messages"
            />

            <PrivacyRow
              title="Friend Requests"
              description="Who can send you friend requests"
            />

            <PrivacyRow
              title="Read Receipts"
              description="Let others know when you've read their messages"
            />
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function PrivacyRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-none">
      <div>
        <div className="text-white">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>

      <select className="bg-input-background border border-input text-white rounded-md px-3 py-2">
        <option>Everyone</option>
        <option>Friends Only</option>
        <option>No One</option>
      </select>
    </div>
  );
}

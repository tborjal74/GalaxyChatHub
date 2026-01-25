import { Input } from "../ui/input";
import { User, Mail } from "lucide-react";

type ProfileInfoProps = {
  isEditing: boolean;
  user: {
    username: string;
    email: string;
  };
  editedUser: {
    username: string;
    email: string;
  };
  setEditedUser: (user: any) => void;
};

export function ProfileInfo({
  isEditing,
  user,
  editedUser,
  setEditedUser,
}: ProfileInfoProps) {
  return (
    <div className="flex-1 space-y-4">
      {/* Username */}
      <div>
        <label className="text-muted-foreground flex items-center gap-2 mb-2">
          <User className="w-4 h-4" />
          Username
        </label>

        {isEditing ? (
          <Input
            value={editedUser.username}
            onChange={(e) =>
              setEditedUser({
                ...editedUser,
                username: e.target.value,
              })
            }
            className="bg-input-background border-input text-white"
          />
        ) : (
          <div className="text-white">{user.username}</div>
        )}
      </div>

      {/* Email */}
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
              setEditedUser({
                ...editedUser,
                email: e.target.value,
              })
            }
            className="bg-input-background border-input text-white"
          />
        ) : (
          <div className="text-white">{user.email}</div>
        )}
      </div>
    </div>
  );
}

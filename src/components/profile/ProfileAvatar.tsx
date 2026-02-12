import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

type ProfileAvatarProps = {
  user: {
    username: string;
    avatarUrl?: string;
    status?: string;
  };
  isEditing: boolean;
  localAvatar: string | null;
  setLocalAvatar: (value: string | null) => void;
  onUpdateProfile: (data: { avatar?: File | null; avatarUrl?: string }) => void;
  getAvatarUrl: (url: string) => string;
  onSelectImage: (file: File) => void;
};

export function ProfileAvatar({
  user,
  isEditing,
  localAvatar,
  setLocalAvatar,
  onUpdateProfile,
  getAvatarUrl,
  onSelectImage,
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUndoAvatar = () => {
    if (localAvatar) {
      URL.revokeObjectURL(localAvatar);
    }

    console.log("USER STATUS", user.status)

    setLocalAvatar(null);
    onUpdateProfile({ avatar: null, avatarUrl: undefined });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localAvatar) {
        URL.revokeObjectURL(localAvatar);
      }
    };
  }, [localAvatar]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32">
        {localAvatar || user.avatarUrl ? (
          <img
            src={
              localAvatar ??
              (user.avatarUrl ? getAvatarUrl(user.avatarUrl) : undefined)
            }
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-4xl">
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>

      {isEditing && (
        <>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              onSelectImage(file);
            }}
          />

          <Button
            variant="outline"
            size="sm"
            className="border-border text-white cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Avatar
          </Button>
        </>
      )}

      {isEditing && (localAvatar || user.avatarUrl) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground cursor-pointer"
          onClick={handleUndoAvatar}
        >
          Remove Avatar
        </Button>
      )}

      <div className="text-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <span
      className={`w-3 h-3 rounded-full ${
        user.status?.toUpperCase() === "ONLINE"
          ? "bg-green-500"
          : "bg-red-500"
      }`}
    />
    <span
      className={
        user.status?.toUpperCase() === "ONLINE"
          ? "text-green-400"
          : "text-red-400"
      }
    >
      {user.status?.toUpperCase() === "ONLINE"
        ? "Online"
        : "Offline"}
    </span>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card } from "../ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileAvatar } from "./ProfileAvatar";
import { AvatarCropModal } from "./AvatarCropModal";
import { DangerZone } from "./DangerZone";
import { ConfirmDangerModal } from "./ConfirmDangerModal";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileTabs } from "./ProfileTabs";
import { API_URL } from "../../config";

interface UserProfile {
  username: string;
  email: string;
  bio?: string;
  joinedDate: Date;
  avatarUrl?: string;
}

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export function ProfileView({
  user,
  onUpdateProfile,
  onLogout,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile>(user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    onUpdateProfile(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  function getAvatarUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("https")) {
      return path;
    }
    // Note: Ensure your backend is actually running on 3000 or update this string
    return `${API_URL}${path}?t=${Date.now()}`;
  }

  type UploadAvatarResponse = {
    avatarUrl: string;
  };

  const uploadAvatar = async (blob: Blob): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.jpg");

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/users/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload avatar");
    }

    const data = await response.json();

    return {
      avatarUrl: data.avatarUrl,
    };
  };

  const handleDeleteAccount = async () => {
    setError(null);
    const token = localStorage.getItem("token");
    
    try {
      setIsDeleting(true);
      const USERS_API = `${API_URL}/api/users`;
      const response = await fetch(`${USERS_API}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success !== true) {
        throw new Error(data.message || "Failed to delete account");
      } else {
        onLogout();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <ProfileHeader
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card className="bg-card/50 backdrop-blur border-border p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <ProfileAvatar
                user={user}
                isEditing={isEditing}
                localAvatar={localAvatar}
                setLocalAvatar={setLocalAvatar}
                onUpdateProfile={onUpdateProfile}
                getAvatarUrl={getAvatarUrl}
                onSelectImage={setSelectedImage}
              />

              {/* Profile Info */}
              <ProfileInfo
                isEditing={isEditing}
                user={user}
                editedUser={editedUser}
                setEditedUser={setEditedUser}
              />
            </div>
          </Card>

          {/* Additional Info Tabs */}
          <ProfileTabs
            isEditing={isEditing}
            user={user}
            editedUser={editedUser}
            setEditedUser={setEditedUser}
          />

          {/* Danger Zone */}
          <DangerZone
            description="Permanently delete your account and all associated data"
            actionLabel="Delete Account"
            isLoading={isDeleting}
            error={error}
            onAction={() => setShowDeleteConfirm(true)}
          />
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmDangerModal
        open={showDeleteConfirm}
        title="Delete account?"
        description="This action is permanent and cannot be undone. All your data will be deleted."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* Avatar Crop Modal */}
      <AvatarCropModal
        file={selectedImage}
        onClose={() => setSelectedImage(null)}
        onSave={async (file, previewUrl) => {
          try {
            // instant UI update for responsiveness
            setLocalAvatar(previewUrl);

            // backend upload
            const { avatarUrl } = await uploadAvatar(file);

            // update ProfileView state/parent
            onUpdateProfile({ avatarUrl });
          } catch (err) {
            console.error("Avatar upload failed:", err);
            // Optionally reset localAvatar here if upload fails
          }
        }}
      />
    </div>
  );
}
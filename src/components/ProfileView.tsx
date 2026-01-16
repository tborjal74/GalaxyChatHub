import { useState } from 'react';

interface UserProfile {
  username: string;
  email: string;
  bio?: string;
  status?: string;
  joinedDate: Date;
}

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileView({ user, onUpdateProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile>(user);


  return (
    <>
    </>
  );
}

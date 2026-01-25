import { Button } from "../ui/button";
import { Edit2, Save, X } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileHeader({
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: ProfileHeaderProps) {
  return (
    <div className="p-6 border-b border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-white">My Profile</h2>

        {!isEditing ? (
          <Button
            onClick={onEdit}
            className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-border text-white hover:bg-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            <Button
              onClick={onSave}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

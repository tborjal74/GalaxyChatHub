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
    <div className="shrink-0 border-b border-border p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-white sm:text-base">My Profile</h2>

        {!isEditing ? (
          <Button
            onClick={onEdit}
            className="w-full cursor-pointer bg-primary text-white hover:bg-primary/90 sm:w-auto"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
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

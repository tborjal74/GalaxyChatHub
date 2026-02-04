import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { API_URL } from "../../config";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  onClose: () => void;
};

export function ChangePasswordModal({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Failed to change password");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      {/* MODAL CARD */}
      <Card
        className="w-full max-w-[420px] bg-card p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white mb-4">Change Password</h3>

        {error && <div className="text-red-400 mb-2">{error}</div>}

        {success ? (
          <div className="text-green-400">Password changed successfully!</div>
        ) : (
          <>
            <PasswordInput
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              visible={showCurrent}
              toggle={() => setShowCurrent(!showCurrent)}
            />

            <PasswordInput
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              visible={showNew}
              toggle={() => setShowNew(!showNew)}
            />

            <PasswordInput
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              visible={showConfirm}
              toggle={() => setShowConfirm(!showConfirm)}
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="cursor-pointer">
                Save
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  visible,
  toggle,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  visible: boolean;
  toggle: () => void;
}) {
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className="bg-input-background border-input text-white pr-10"
        value={value}
        onChange={onChange}
      />

      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

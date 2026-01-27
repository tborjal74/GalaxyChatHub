import { Button } from "../ui/button";

type ConfirmDangerModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDangerModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDangerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card p-6 rounded-lg w-[380px] border border-destructive/40">
        <h3 className="text-white text-lg mb-2">{title}</h3>

        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

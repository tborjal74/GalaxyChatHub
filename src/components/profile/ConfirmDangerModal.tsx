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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-[380px] rounded-lg border border-destructive/40 bg-card p-4 sm:p-6">
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

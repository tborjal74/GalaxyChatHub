import { Card } from "../ui/card";
import { Button } from "../ui/button";

type DangerZoneProps = {
  title?: string;
  description: string;
  actionLabel: string;
  isLoading?: boolean;
  error?: string | null;
  onAction: () => void;
};

export function DangerZone({
  title = "Danger Zone",
  description,
  actionLabel,
  isLoading = false,
  error,
  onAction,
}: DangerZoneProps) {
  return (
    <Card className="bg-card/50 backdrop-blur border-destructive/30 p-6">
      <h3 className="text-destructive mb-4">{title}</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-3 border-b border-border">
          <div>
            <div className="text-white">{actionLabel}</div>
            <div className="text-sm text-muted-foreground">
              {description}
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={onAction}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? "Processing..." : actionLabel}
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}

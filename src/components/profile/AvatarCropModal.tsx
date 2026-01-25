import { useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "../ui/button";
import { getCroppedImg } from "../../utils/cropImage";

interface AvatarCropModalProps {
  file: File | null;
  onClose: () => void;
  onSave: (file: File, previewUrl: string) => Promise<void> | void;
}

export function AvatarCropModal({
  file,
  onClose,
  onSave,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<any>(null);

  const imageUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-card p-4 rounded-lg w-[360px]">
        <div className="relative w-full h-[300px] bg-black rounded overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) =>
              setCroppedAreaPixels(pixels)
            }
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full mt-3"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={async () => {
              if (!croppedAreaPixels) return;

              const blob = await getCroppedImg(
                imageUrl,
                croppedAreaPixels
              );

              const croppedFile = new File(
                [blob],
                "avatar.png",
                { type: blob.type }
              );

              const previewUrl =
                URL.createObjectURL(croppedFile);

              await onSave(croppedFile, previewUrl);
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

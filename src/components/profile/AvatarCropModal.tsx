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
  const [isSaving, setIsSaving] = useState(false);

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

    const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsSaving(true);                

      const blob = await getCroppedImg(
        imageUrl,
        croppedAreaPixels
      );

      const croppedFile = new File(
        [blob],
        "avatar.png",
        { type: blob.type }
      );

      const previewUrl = URL.createObjectURL(croppedFile);

      await onSave(croppedFile, previewUrl);
      onClose();
    } finally {
      setIsSaving(false);               
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-[360px] rounded-lg bg-card p-4">

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

          {/* Overlay while processing */}
          {isSaving && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-sm">
                Processing image...
              </span>
            </div>
          )}
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full mt-3"
          disabled={isSaving}          
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer"       
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}  
            className="cursor-pointer"     
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

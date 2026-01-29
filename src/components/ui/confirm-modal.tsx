import { Button } from "./button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info" | "alert"; 
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isAlert = type === 'alert';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-[#313338] p-6 rounded-lg w-[380px] border shadow-xl transform transition-all scale-100 ${type === 'danger' ? 'border-red-500/50' : 'border-[#26272D]'}`}>
        <h3 className="text-gray-100 text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          {!isAlert && (
            <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-100 hover:bg-[#383A40]"
            >
                {cancelText}
            </Button>
          )}
          
          <Button 
            onClick={() => {
                if(onConfirm) onConfirm();
                else onClose();
            }}
            className={type === 'danger' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}
          >
            {isAlert ? "OK" : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

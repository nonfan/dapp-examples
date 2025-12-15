import { useEffect } from "react";

type Props = {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

export default function Toast({ open, message, type = "info", onClose }: Props) {
  // 5秒后自动关闭
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;
  
  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm transform transition-all duration-300 ease-out animate-in slide-in-from-right-2`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <span className="text-sm font-medium leading-relaxed">{message}</span>
          </div>
          <button
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 -m-1"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

export default function Toast({ open, message, type = "info", onClose }: Props) {
  if (!open) return null;
  
  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-gray-900";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${bgColor} text-white px-4 py-3 rounded shadow-lg max-w-sm`}>
        <div className="flex items-center justify-between">
          <span className="text-sm">{message}</span>
          <button
            className="ml-3 text-xs underline"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

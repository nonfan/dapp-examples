type Props = {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

export default function Toast({ open, message, type = "info", onClose }: Props) {
  if (!open) return null;
  const bg =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-gray-900";
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`text-white px-4 py-3 rounded-xl shadow-lg ${bg}`}>
        <div className="text-sm">{message}</div>
        <button
          className="ml-3 text-xs underline underline-offset-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

import React from "react";
import Spinner from "./Spinner";

type Props = {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  confirmTitle?: string;
};

export default function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmLoading = false,
  confirmDisabled = false,
  confirmTitle,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-[520px] card overflow-hidden">
        {title ? (
          <div className="px-3 py-2 border-b border-gray-200 text-[15px] font-semibold">
            {title}
          </div>
        ) : null}
        <div className="p-3">{children}</div>
        <div className="flex gap-2 justify-end p-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-60 text-sm"
            disabled={confirmLoading}
          >
            {cancelText}
          </button>
          {onConfirm ? (
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60 text-sm"
              disabled={confirmDisabled || confirmLoading}
              title={confirmTitle}
            >
              {confirmLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size={14} /> {confirmText}
                </span>
              ) : (
                confirmText
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

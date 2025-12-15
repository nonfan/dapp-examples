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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md card">
        {title ? (
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
        ) : null}
        <div className="p-4">{children}</div>
        <div className="flex gap-2 justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            disabled={confirmLoading}
          >
            {cancelText}
          </button>
          {onConfirm ? (
            <button
              onClick={onConfirm}
              className="btn btn-primary btn-sm"
              disabled={confirmDisabled || confirmLoading}
              title={confirmTitle}
            >
              {confirmLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size={12} /> {confirmText}
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

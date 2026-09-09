import React from "react";
import { Trash2 } from "lucide-react";

export function DeleteModal({
  isOpen,
  title = "Delete Item",
  message = "This action is permanent and cannot be undone. Are you sure?",
  confirmText = "Delete Permanently",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-zinc-900 p-6 shadow-2xl animate-fade-in text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-red-950/80 border border-red-800/50 flex items-center justify-center text-red-400">
            <Trash2 className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-bold uppercase tracking-tight text-white">{title}</h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed mb-6">{message}</p>
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-red-700 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

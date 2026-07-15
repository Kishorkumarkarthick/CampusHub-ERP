import React, { useEffect } from "react";
import { AlertTriangle, X, Info, AlertOctagon } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  // ESC key handler to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const config = {
    danger: {
      icon: AlertOctagon,
      iconClass: "text-rose-600 bg-rose-500/10 dark:text-rose-400",
      btnClass: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/40 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconClass: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
      btnClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/40 text-white",
    },
    info: {
      icon: Info,
      iconClass: "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400",
      btnClass: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/40 text-white",
    },
  };

  const selected = config[variant];
  const IconComponent = selected.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Dialog box card */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200 font-sans">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected.iconClass}`}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="space-y-2 flex-grow">
            <h3 className="text-base font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold active:scale-[0.98] transition-all cursor-pointer focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-card ${selected.btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

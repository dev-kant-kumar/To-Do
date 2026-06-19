import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, AlertCircle } from "lucide-react";

export default function ConfirmationModal({ 
  isOpen, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  type = "danger" // "danger" | "warning" | "info"
}) {

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 size={20} className="text-red-400" />;
      case "warning":
        return <AlertTriangle size={20} className="text-amber-400" />;
      case "info":
      default:
        return <AlertCircle size={20} className="text-purple-400" />;
    }
  };

  const getConfirmBtnStyles = () => {
    switch (type) {
      case "danger":
        return "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/20 border-red-500/20";
      case "warning":
        return "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-950/20 border-amber-500/20";
      case "info":
      default:
        return "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-950/20 border-purple-500/20";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-md" 
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div 
        className="relative max-w-sm w-full bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-left select-none animate-fade-slide-up z-10"
      >
        {/* Subtle purple aura glow inside modal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-purple-600/5 blur-3xl pointer-events-none z-0" />

        <div className="flex gap-4 items-start relative z-10">
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex-shrink-0 flex items-center justify-center">
            {getIcon()}
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest">{title}</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 relative z-10 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/50 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 font-bold text-xs rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border cursor-pointer focus:outline-none ${getConfirmBtnStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

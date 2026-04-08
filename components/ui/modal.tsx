"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  // Blocca scroll body quando aperto
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "relative z-10 bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {/* Handle bar (mobile) */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xl active:scale-95"
            >
              ×
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

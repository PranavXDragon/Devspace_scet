"use client";
import React from "react";
import { AlertTriangle, X, Sparkles, AlertCircle, HelpCircle, Info } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const isAccent = type === "accent" || type === "info";
  const isWarning = type === "warning";
  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border-soft rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-card-hover transition-colors"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
            isAccent 
              ? "bg-accent/10 border-accent/20 text-accent" 
              : isWarning
              ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
              : "bg-danger/10 border-danger/20 text-danger"
          }`}>
            {isAccent ? (
              <Sparkles className="w-5 h-5" />
            ) : isWarning ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div className="pr-6">
            <h2 className="text-lg font-bold font-headline text-text tracking-tight">
              {title || "Confirm Action"}
            </h2>
            <p className="text-text-muted mt-1.5 leading-relaxed text-xs sm:text-sm">
              {message || "Are you sure you want to proceed?"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border-soft mt-5">
          {cancelText ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-text text-xs font-bold rounded-xl border border-border-soft bg-card hover:bg-card-hover transition-all"
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm ${
              isAccent
                ? "bg-accent text-bg hover:bg-accent/90"
                : isWarning
                ? "bg-amber-500 text-bg hover:bg-amber-500/90"
                : "bg-danger text-white hover:bg-danger/90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

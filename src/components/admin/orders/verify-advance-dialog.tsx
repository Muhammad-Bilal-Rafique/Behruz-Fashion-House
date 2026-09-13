"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifyAdvanceDialogProps {
  isOpen: boolean;
  orderNumber: string;
  customerName?: string;
  advanceAmount?: number;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function VerifyAdvanceDialog({
  isOpen,
  orderNumber,
  customerName,
  advanceAmount = 1000,
  isLoading,
  onConfirm,
  onClose,
}: VerifyAdvanceDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-dialog-title"
      aria-describedby="verify-dialog-description"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50 duration-150"
    >
      <div className="bg-card border border-border rounded-xs shadow-2xl max-w-md w-full p-6 space-y-5 text-left relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Verification Icon */}
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 id="verify-dialog-title" className="font-serif text-xl font-normal text-foreground">
            Verify Advance Payment?
          </h2>
          <p id="verify-dialog-description" className="text-xs text-muted-foreground leading-relaxed">
            Confirm that the <strong className="text-foreground font-semibold">PKR {advanceAmount.toLocaleString()}</strong> advance payment for order{" "}
            <span className="font-mono font-bold text-foreground">#{orderNumber}</span>{" "}
            {customerName ? `(${customerName}) ` : ""}has been received and verified. The order will be marked as Confirmed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs h-9 rounded-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs h-9 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs shadow-xs gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "Verifying..." : "Verify Payment"}</span>
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

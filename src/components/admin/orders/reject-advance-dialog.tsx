"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RejectAdvanceDialogProps {
  isOpen: boolean;
  orderNumber: string;
  customerName?: string;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function RejectAdvanceDialog({
  isOpen,
  orderNumber,
  customerName,
  isLoading,
  onConfirm,
  onClose,
}: RejectAdvanceDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setReason("");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-dialog-title"
      aria-describedby="reject-dialog-description"
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

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 id="reject-dialog-title" className="font-serif text-xl font-normal text-foreground">
            Reject Advance Payment?
          </h2>
          <p id="reject-dialog-description" className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to mark the payment for order{" "}
            <span className="font-mono font-bold text-foreground">#{orderNumber}</span>{" "}
            {customerName ? `(${customerName}) ` : ""}as rejected? The order will not be marked as Confirmed.
          </p>
        </div>

        {/* Reason Input */}
        <div className="space-y-1.5">
          <label htmlFor="reject-reason" className="text-[11px] uppercase font-semibold text-foreground tracking-wider block">
            Rejection Reason (Optional):
          </label>
          <input
            id="reject-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Payment not received in account, invalid screenshot"
            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xs focus:border-primary focus:outline-hidden"
          />
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
            onClick={() => onConfirm(reason)}
            disabled={isLoading}
            className="text-xs h-9 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xs shadow-xs gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "Rejecting..." : "Reject Payment"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

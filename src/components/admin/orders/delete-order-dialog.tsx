"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteOrderDialogProps {
  isOpen: boolean;
  orderNumber: string;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteOrderDialog({
  isOpen,
  orderNumber,
  isLoading,
  onConfirm,
  onClose,
}: DeleteOrderDialogProps) {
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
      aria-labelledby="delete-order-title"
      aria-describedby="delete-order-description"
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
          <h2 id="delete-order-title" className="font-serif text-xl font-normal text-foreground">
            Delete Order?
          </h2>
          <p id="delete-order-description" className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete order{" "}
            <span className="font-mono font-bold text-foreground">#{orderNumber}</span>?
            This record will be permanently removed from the database. This action cannot be undone.
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
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs h-9 font-semibold gap-1.5 rounded-xs cursor-pointer"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "Deleting..." : "Delete Order"}</span>
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

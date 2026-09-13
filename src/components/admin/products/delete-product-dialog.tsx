"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteProductDialogProps {
  isOpen: boolean;
  productName: string;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteProductDialog({
  isOpen,
  productName,
  isLoading,
  onConfirm,
  onClose,
}: DeleteProductDialogProps) {
  // Close on Escape key
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50 duration-150"
    >
      {/* Modal Card */}
      <div className="bg-card border border-border rounded-xs shadow-2xl max-w-md w-full p-6 space-y-5 text-left relative animate-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-xs transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h2 id="delete-dialog-title" className="font-serif text-xl font-normal text-foreground">
            Delete Product?
          </h2>
          <p id="delete-dialog-description" className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{productName}"</span>?
            This will permanently remove the product and its associated Cloudinary images from the store. This action cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs h-9 rounded-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs h-9 font-semibold gap-1.5 rounded-xs"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "Deleting..." : "Delete Product"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
